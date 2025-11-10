import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// End a charging session - trigger will auto-calculate duration and cost
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = parseInt(params.id)

    // Get session to find port and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('charging_session')
      .select('port_id, user_id, start_time')
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify user owns this session
    const { data: userAccount } = await supabase
      .from('user_account')
      .select('user_id')
      .eq('email', user.email!)
      .single()

    if (!userAccount || (userAccount as any).user_id !== session.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get port details to calculate energy consumed based on actual charging rate
    const { data: portData } = await supabase
      .from('charging_port')
      .select('max_power_output')
      .eq('port_id', session.port_id)
      .single()

    // Calculate duration in minutes using UTC timestamps
    const startTime = new Date(session.start_time + 'Z') // Force UTC parsing
    const endTime = new Date()
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000

    console.log('Duration calculation:', {
      start: session.start_time,
      startParsed: startTime.toISOString(),
      end: endTime.toISOString(),
      durationMinutes
    })

    // Calculate energy consumed based on port's charging rate
    // Convert kW to kW per minute: max_power_output / 60
    const chargingRatePerMinute = portData?.max_power_output 
      ? portData.max_power_output / 60 
      : 0.1 // Default fallback to 0.1 kW/min
    
    const energyConsumed = durationMinutes * chargingRatePerMinute

    // Update end_time and energy_consumed - trigger will calculate duration and cost
    const { data: sessionData, error } = await supabase
      .from('charging_session')
      .update({
        end_time: endTime.toISOString(),
        energy_consumed: energyConsumed,
      })
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error ending session:', error)
      throw error
    }

    // Update port status back to Available
    const { error: portUpdateError } = await supabase
      .from('charging_port')
      .update({ status: 'Available' })
      .eq('port_id', session.port_id)

    if (portUpdateError) {
      console.error('Failed to update port status:', portUpdateError)
      // Don't fail the entire request if port update fails
    }

    // Log the status change in port_status_log
    await supabase
      .from('port_status_log')
      .insert({
        port_id: session.port_id,
        old_status: 'In Use',
        new_status: 'Available'
      })

    // Create payment record with default "Cash" payment method and "Completed" status
    // Amount will be the cost calculated by the trigger
    const cost = sessionData.cost || (energyConsumed * 15.0) // Fallback calculation
    
    const { error: paymentError } = await supabase
      .from('payment')
      .insert({
        session_id: sessionId,
        pay_status: 'Completed',
        pay_date: endTime.toISOString(),
        amount: cost,
        pay_method: 'Cash',
      })

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      // Don't fail the entire request if payment creation fails
      // Session is already ended successfully
    }

    // Return the session data
    return NextResponse.json(sessionData)
  } catch (error: any) {
    console.error('Error ending session:', error)
    return NextResponse.json({ 
      error: 'Failed to end session',
      details: error.message 
    }, { status: 500 })
  }
}
