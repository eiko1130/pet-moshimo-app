import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nukpisixfolbnzkvorym.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Q1XSJAMEDyMf8-sZw06UMA_MlsGKnAC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
