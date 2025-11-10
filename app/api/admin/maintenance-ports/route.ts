import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.email?.endsWith('@relay.admin') || 
                    user.email?.endsWith('@relay.com') || 
                    user.email === 'admin@relay.com'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch ports that are Out of Order or Under Maintenance
    const { data: ports, error } = await supabase
      .from('charging_port')
      .select(`
        port_id,
        station_id,
        connectortype,
        status,
        max_power_output,
        charging_station (
          station_id,
          operatorname,
          location,
          contact
        )
      `)
      .in('status', ['Out of Order', 'Under Maintenance'])
      .order('status', { ascending: false })
      .order('station_id', { ascending: true })

    if (error) {
      console.error('Error fetching maintenance ports:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ports: ports || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Error in maintenance-ports route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.email?.endsWith('@relay.admin') || 
                    user.email?.endsWith('@relay.com') || 
                    user.email === 'admin@relay.com'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { portId } = body

    if (!portId) {
      return NextResponse.json({ error: 'Port ID is required' }, { status: 400 })
    }

    // Get current status for logging
    const { data: currentPort } = await supabase
      .from('charging_port')
      .select('status')
      .eq('port_id', portId)
      .single()

    // Update port status to Available
    const { error: updateError } = await supabase
      .from('charging_port')
      .update({ status: 'Available' })
      .eq('port_id', portId)

    if (updateError) {
      console.error('Error updating port status:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the status change in port_status_log
    const { error: logError } = await supabase
      .from('port_status_log')
      .insert({
        port_id: portId,
        old_status: currentPort?.status,
        new_status: 'Available'
      })

    if (logError) {
      console.error('Error logging status change:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ 
      message: 'Port status updated successfully',
      portId 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in maintenance-ports PATCH route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
