import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Admin-only endpoint to fetch ALL reviews
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (ends with @relay.com)
    if (!user.email?.endsWith('@relay.com')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch ALL reviews for admin view
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
    console.error('Error fetching all reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
