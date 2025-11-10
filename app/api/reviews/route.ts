import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Uses review table
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
    
    // Fetch only reviews by the current user
    const { data: reviews, error } = await supabase
      .from('review')
      .select(`
        *,
        user:user_account(name),
        station:charging_station(operatorname, location)
      `)
      .eq('user_id', userId)
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
    
    const supabaseClient = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user_id from user_account table by email
    const { data: userAccount, error: userError } = await supabaseClient
      .from('user_account')
      .select('user_id')
      .eq('email', user.email!)
      .single()

    if (userError || !userAccount) {
      console.error('User account error:', userError)
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const userId = (userAccount as any).user_id

    const reviewData = {
      user_id: userId,
      station_id: parseInt(body.station_id),
      rating: body.rating,
      comments: body.comments,
      date: new Date().toISOString().split('T')[0],
    }

    const { data, error } = await supabaseClient
      .from('review')
      .insert([reviewData])
      .select()

    if (error) {
      console.error('Error inserting review:', error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
