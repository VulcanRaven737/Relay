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

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    let query = supabase
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
      .order('station_id', { ascending: true })

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: ports, error } = await query

    if (error) {
      console.error('Error fetching ports:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ports: ports || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Error in ports route:', error)
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
    const { portId, newStatus } = body

    if (!portId || !newStatus) {
      return NextResponse.json({ error: 'Port ID and status are required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['Available', 'In Use', 'Out of Order', 'Under Maintenance']
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current status for logging
    const { data: currentPort } = await supabase
      .from('charging_port')
      .select('status')
      .eq('port_id', portId)
      .single()

    // Update port status
    const { error: updateError } = await supabase
      .from('charging_port')
      .update({ status: newStatus })
      .eq('port_id', portId)

    if (updateError) {
      console.error('Error updating port status:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the status change
    const { error: logError } = await supabase
      .from('port_status_log')
      .insert({
        port_id: portId,
        old_status: currentPort?.status,
        new_status: newStatus
      })

    if (logError) {
      console.error('Error logging status change:', logError)
    }

    return NextResponse.json({ 
      message: 'Port status updated successfully',
      portId,
      newStatus
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in ports PATCH route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
