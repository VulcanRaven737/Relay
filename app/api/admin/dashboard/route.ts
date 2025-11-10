import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Admin dashboard - uses maintenance_log and getstationrevenue() function
export async function GET() {
  try {
    // Get overall stats
    const { data: stations } = await supabase.from('charging_station').select('*')
    const { data: ports } = await supabase.from('charging_port').select('*')
    const { data: sessions } = await supabase.from('charging_session').select('*')
    const { data: payments } = await supabase.from('payment').select('amount')

    const totalStations = stations?.length || 0
    const totalPorts = ports?.length || 0
    const activeSessions = sessions?.filter((s: any) => !s.end_time).length || 0
    const totalRevenue = payments?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0

    const availablePorts = ports?.filter((p: any) => p.status === 'Available').length || 0
    const inUsePorts = ports?.filter((p: any) => p.status === 'In Use').length || 0
    const outOfOrderPorts = ports?.filter((p: any) => p.status === 'Out of Order').length || 0
    const underMaintenancePorts = ports?.filter((p: any) => p.status === 'Under Maintenance').length || 0
    const maintenancePorts = outOfOrderPorts + underMaintenancePorts

    const today = new Date().toISOString().split('T')[0]
    const sessionsToday = sessions?.filter((s: any) => s.start_time?.startsWith(today)).length || 0

    const { data: paymentsToday } = await supabase
      .from('payment')
      .select('amount')
      .gte('pay_date', today)

    const revenueToday = paymentsToday?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0

    const { data: users } = await supabase.from('user_account').select('user_id')
    const newUsers = users?.length || 0

    // Get maintenance logs with station names
    const { data: maintenanceLogs } = await supabase
      .from('maintenance_log')
      .select(`
        *,
        station:charging_station(operatorname)
      `)
      .order('maintain_date', { ascending: false })
      .limit(10)

    const formattedLogs = maintenanceLogs?.map((log: any) => ({
      ...log,
      station_name: log.station?.operatorname || 'Unknown',
    }))

    // Get station revenue using DB function
    const currentMonth = new Date().toISOString().slice(0, 7)
    const startDate = `${currentMonth}-01`
    const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString().split('T')[0]

    const stationsWithRevenue = await Promise.all(stations?.map(async (station: any) => {
      // Call getstationrevenue() function
      const { data: revenue } = await supabase
        .rpc('getstationrevenue', {
          station_id_input: station.station_id,
          start_date: startDate,
          end_date: endDate,
        })

      const stationPorts = ports?.filter((p: any) => p.station_id === station.station_id) || []
      const availablePorts = stationPorts.filter((p: any) => p.status === 'Available').length

      const stationSessions = sessions?.filter((s: any) => {
        const sessionPort = ports?.find((p: any) => p.port_id === s.port_id)
        return sessionPort?.station_id === station.station_id
      }) || []

      return {
        ...station,
        revenue: revenue || 0,
        total_ports: stationPorts.length,
        available_ports: availablePorts,
        sessions: stationSessions.length,
      }
    }) || [])

    return NextResponse.json({
      stats: {
        totalStations,
        totalPorts,
        activeSessions,
        totalRevenue,
        availablePorts,
        inUsePorts,
        maintenancePorts,
        outOfOrderPorts,
        underMaintenancePorts,
        sessionsToday,
        revenueToday,
        newUsers,
      },
      maintenanceLogs: formattedLogs || [],
      stations: stationsWithRevenue,
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
