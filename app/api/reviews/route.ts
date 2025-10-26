import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Uses review table
export async function GET() {
  try {
    const { data: reviews, error } = await supabase
      .from('review')
      .select(`
        *,
        user:user_account(name),
        station:charging_station(operatorname, location)
      `)
      .order('date', { ascending: false })

    if (error) throw error

    const formattedReviews = reviews?.map((review: any) => ({
      ...review,
      user_name: review.user?.name || 'Anonymous',
      station_name: review.station?.operatorname || 'Unknown',
      station_location: review.station?.location || 'Unknown',
    }))

    return NextResponse.json(formattedReviews || [])
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = 1 // Replace with actual user ID from session

    const reviewData = {
      user_id: userId,
      station_id: parseInt(body.station_id),
      rating: body.rating,
      comments: body.comments,
      date: new Date().toISOString().split('T')[0],
    }

    const { data, error } = await supabase
      .from('review')
      .insert([reviewData])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
