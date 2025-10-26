import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// For client-side usage - automatically handles cookies
export const supabase = createClientComponentClient<Database>()
