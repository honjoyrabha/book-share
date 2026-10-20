import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xliydgbrrzyqwbuhpuqs.supabase.co';
const supabaseKey = 'sb_publishable_HgMatH_pqu_Wov0iPK1QYg_0Wa124eq';

export const supabase = createClient(supabaseUrl, supabaseKey);