import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Uses vehicle table
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

    // Fetch vehicles for this user
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .eq('user_id', (userAccount as any).user_id)
      .order('vehicle_id', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
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

    const body = await request.json()
    
    // Add the actual user_id from the database
    const vehicleData = {
      ...body,
      user_id: (userAccount as any).user_id,
    }

    const { data, error } = await supabase
      .from('vehicle')
      .insert([vehicleData] as any)
      .select()

    if (error) {
      console.error('Error creating vehicle:', error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ 
      error: 'Failed to create vehicle',
      details: error.message 
    }, { status: 500 })
  }
}
