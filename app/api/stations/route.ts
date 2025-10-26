import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Uses charging_station and charging_port tables
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const connectorType = searchParams.get('connectorType')
    const availability = searchParams.get('availability')

    // Get stations with port information
    let query = supabase
      .from('charging_station')
      .select(`
        *,
        ports:charging_port(*)
      `)

    const { data: stations, error } = await query

    if (error) throw error

    // Calculate availability and filter
    const stationsWithStats = stations?.map((station: any) => {
      const ports = station.ports || []
      const availablePorts = ports.filter((p: any) => p.status === 'Available').length
      const totalPorts = ports.length

      // Filter by connector type
      let filteredPorts = ports
      if (connectorType) {
        filteredPorts = ports.filter((p: any) => p.connectortype === connectorType)
      }

      return {
        ...station,
        ports: filteredPorts,
        available_ports: availablePorts,
        total_ports: totalPorts,
      }
    })

    // Filter by availability
    let filteredStations = stationsWithStats
    if (availability === 'available') {
      filteredStations = stationsWithStats?.filter((s: any) => s.available_ports > 0)
    } else if (availability === 'in-use') {
      filteredStations = stationsWithStats?.filter((s: any) => s.available_ports === 0)
    }

    // Get average ratings
    const { data: reviews } = await supabase
      .from('review')
      .select('station_id, rating')

    const ratingMap: Record<number, number> = {}
    reviews?.forEach((r: any) => {
      if (!ratingMap[r.station_id]) ratingMap[r.station_id] = []
      ratingMap[r.station_id].push(r.rating)
    })

    const stationsWithRatings = filteredStations?.map((station: any) => {
      const ratings = ratingMap[station.station_id] || []
      const avg_rating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : null

      return { ...station, avg_rating }
    })

    return NextResponse.json(stationsWithRatings || [])
  } catch (error) {
    console.error('Error fetching stations:', error)
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('charging_station')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create station' }, { status: 500 })
  }
}
