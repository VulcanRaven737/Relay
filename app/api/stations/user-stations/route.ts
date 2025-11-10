import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get stations that the current user has used (based on charging sessions)
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

    // Get distinct stations from user's charging sessions
    // First get all sessions with port information
    const { data: sessions, error } = await supabase
      .from('charging_session')
      .select(`
        session_id,
        port_id,
        charging_port!inner(
          port_id,
          station_id,
          charging_station!inner(
            station_id,
            operatorname,
            location
          )
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user stations:', error)
      throw error
    }

    // Extract unique stations from the sessions
    const stationsMap = new Map()
    sessions?.forEach((session: any) => {
      const station = session.charging_port?.charging_station
      if (station && !stationsMap.has(station.station_id)) {
        stationsMap.set(station.station_id, station)
      }
    })

    const uniqueStations = Array.from(stationsMap.values())

    return NextResponse.json(uniqueStations)
  } catch (error) {
    console.error('Error fetching user stations:', error)
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 })
  }
}
