import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Uses calculateusertotalspending() DB function and various tables
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

    // Call DB function for total spending
    const { data: spendingData, error: spendingError } = await supabase
      .rpc('calculateusertotalspending', { user_id_input: userId })

    if (spendingError) throw spendingError

    // Get session statistics
    const { data: sessions, error: sessionsError } = await supabase
      .from('charging_session')
      .select('*')
      .eq('user_id', userId)

    if (sessionsError) throw sessionsError

    const totalSessions = sessions?.length || 0
    const totalEnergy = sessions?.reduce((sum: number, s: any) => sum + (parseFloat(s.energy_consumed) || 0), 0) || 0
    const avgSessionCost = spendingData && totalSessions > 0 ? spendingData / totalSessions : 0

    // Get current month data
    const currentMonth = new Date().toISOString().slice(0, 7)
    const sessionsThisMonth = sessions?.filter((s: any) => s.start_time?.startsWith(currentMonth)).length || 0

    const { data: paymentsThisMonth } = await supabase
      .from('payment')
      .select('amount, session:charging_session!inner(user_id, start_time)')
      .eq('session.user_id', userId)
      .gte('session.start_time', `${currentMonth}-01`)

    const spentThisMonth = paymentsThisMonth?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0
    const energyThisMonth = sessions
      ?.filter((s: any) => s.start_time?.startsWith(currentMonth))
      .reduce((sum: number, s: any) => sum + (parseFloat(s.energy_consumed) || 0), 0) || 0

    const avgDuration = sessions && sessions.length > 0
      ? sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / sessions.length
      : 0

    // Get favorite stations
    const { data: stationVisits } = await supabase
      .from('charging_session')
      .select(`
        port:charging_port(
          station:charging_station(station_id, operatorname)
        ),
        cost
      `)
      .eq('user_id', userId)
      .not('end_time', 'is', null)

    const stationMap: Record<number, any> = {}
    stationVisits?.forEach((visit: any) => {
      const stationId = visit.port?.station?.station_id
      const stationName = visit.port?.station?.operatorname
      if (stationId) {
        if (!stationMap[stationId]) {
          stationMap[stationId] = { station_id: stationId, name: stationName, visits: 0, spent: 0 }
        }
        stationMap[stationId].visits++
        stationMap[stationId].spent += parseFloat(visit.cost) || 0
      }
    })

    const favoriteStations = Object.values(stationMap)
      .sort((a: any, b: any) => b.visits - a.visits)
      .slice(0, 5)

    // Get vehicle usage
    const { data: vehicles } = await supabase
      .from('vehicle')
      .select('*')
      .eq('user_id', userId)

    const vehicleStats = await Promise.all(vehicles?.map(async (vehicle: any) => {
      const { data: vehicleSessions } = await supabase
        .from('charging_session')
        .select('energy_consumed, cost')
        .eq('vehicle_id', vehicle.vehicle_id)
        .not('end_time', 'is', null)

      return {
        vehicle_id: vehicle.vehicle_id,
        model: vehicle.maker_model,
        sessions: vehicleSessions?.length || 0,
        energy: vehicleSessions?.reduce((sum: number, s: any) => sum + (parseFloat(s.energy_consumed) || 0), 0) || 0,
        cost: vehicleSessions?.reduce((sum: number, s: any) => sum + (parseFloat(s.cost) || 0), 0) || 0,
      }
    }) || [])

    // Get chart data (last 6 months)
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().slice(0, 7)
      const monthSessions = sessions?.filter((s: any) => s.start_time?.startsWith(monthStr)).length || 0
      chartData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        sessions: monthSessions,
      })
    }

    return NextResponse.json({
      stats: {
        totalSpending: spendingData || 0,
        totalSessions,
        totalEnergy,
        avgSessionCost,
        sessionsThisMonth,
        spentThisMonth,
        energyThisMonth,
        avgDuration: Math.round(avgDuration),
        favoriteStations,
        vehicles: vehicleStats,
      },
      chartData,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
