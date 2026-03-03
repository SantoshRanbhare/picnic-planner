import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bahzmagfgiscxxbwdsah.supabase.co'
const supabaseKey = 'sb_publishable_pnTybTizolHLFj4TGAFr9w_7K4BU2Ua'

export const supabase = createClient(supabaseUrl, supabaseKey)