import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Uses payment table (auto-created by before_session_end_func trigger)
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

    // Get all payments for this user's sessions (payment table doesn't have user_id)
    // We need to get sessions first, then their payments
    const { data: sessions, error: sessionsError } = await supabase
      .from('charging_session')
      .select('session_id')
      .eq('user_id', userId)

    if (sessionsError) throw sessionsError

    const sessionIds = sessions?.map((s: any) => s.session_id) || []

    if (sessionIds.length === 0) {
      return NextResponse.json({
        payments: [],
        stats: { total: 0, pending: 0, completed: 0 },
      })
    }

    // Get all payments for these sessions
    const { data: payments, error } = await supabase
      .from('payment')
      .select(`
        *,
        session:charging_session(
          session_id,
          energy_consumed,
          duration,
          cost,
          user_id,
          port:charging_port(
            station:charging_station(
              operatorname
            )
          )
        )
      `)
      .in('session_id', sessionIds)
      .order('pay_date', { ascending: false })

    if (error) throw error

    const formattedPayments = payments?.map((payment: any) => ({
      ...payment,
      station_name: payment.session?.port?.station?.operatorname || 'Unknown',
      energy_consumed: payment.session?.energy_consumed || 0,
      duration: payment.session?.duration || 0,
    }))

    // Calculate stats
    const total = payments?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0
    const pending = payments?.filter((p: any) => p.pay_status === 'Pending')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0
    const completed = payments?.filter((p: any) => p.pay_status === 'Completed')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0

    return NextResponse.json({
      payments: formattedPayments || [],
      stats: { total, pending, completed },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
