
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project-url.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);
