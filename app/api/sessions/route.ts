import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Uses charging_session table (triggers auto-calculate duration/cost on end_time update)
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user_id from user_account table by email
    const { data: userAccount, error: userError } = await supabase
      .from('user_account')
      .select('user_id')
      .eq('email', user.email!)
      .single()

    if (userError || !userAccount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = (userAccount as any).user_id

    // Get all sessions with related data including port details
    const { data: sessions, error } = await supabase
      .from('charging_session')
      .select(`
        *,
        port:charging_port(
          port_id,
          max_power_output,
          connectortype,
          station:charging_station(
            station_id,
            operatorname
          )
        ),
        vehicle:vehicle(
          no_plate,
          maker_model
        ),
        payment:payment(
          pay_status
        )
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    if (error) throw error

    const formattedSessions = sessions?.map((session: any) => ({
      ...session,
      station_name: session.port?.station?.operatorname || 'Unknown',
      vehicle_plate: session.vehicle?.no_plate || 'Unknown',
      vehicle_model: session.vehicle?.maker_model || 'Unknown',
      payment_status: session.payment?.[0]?.pay_status || 'Pending',
    }))

    // Find active session
    const activeSession = formattedSessions?.find((s: any) => !s.end_time)
    const completedSessions = formattedSessions?.filter((s: any) => s.end_time)

    return NextResponse.json({
      sessions: completedSessions || [],
      activeSession: activeSession || null,
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user_id from user_account table by email
    const { data: userAccount, error: userError } = await supabase
      .from('user_account')
      .select('user_id')
      .eq('email', user.email!)
      .single()

    if (userError || !userAccount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = (userAccount as any).user_id
    const body = await request.json()

    console.log('Creating session with data:', {
      user_id: userId,
      port_id: body.port_id,
      vehicle_id: body.vehicle_id
    })

    const supabaseClient = createRouteHandlerClient({ cookies })

    // Validate that the port exists and is available
    const { data: port, error: portError } = await supabaseClient
      .from('charging_port')
      .select('port_id, status')
      .eq('port_id', body.port_id)
      .single()

    if (portError || !port) {
      console.error('Port validation failed:', portError)
      return NextResponse.json({ error: 'Invalid port ID' }, { status: 400 })
    }

    if (port.status !== 'Available') {
      return NextResponse.json({ error: 'Port is not available' }, { status: 400 })
    }

    const sessionData = {
      user_id: userId,
      port_id: body.port_id,
      vehicle_id: body.vehicle_id,
      start_time: new Date().toISOString(),
    }

    // Update port status to In-Use
    await supabaseClient
      .from('charging_port')
      .update({ status: 'In-Use' })
      .eq('port_id', body.port_id)

    const { data, error } = await supabaseClient
      .from('charging_session')
      .insert([sessionData])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
