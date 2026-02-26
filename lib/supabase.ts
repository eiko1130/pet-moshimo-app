// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nukpisixfolbnzkvorym.supabase.co'

const supabaseAnonKey = 'sb_publishable_Q1XSJAMEDyMf8-sZw06UMA_MlsGKnAC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)