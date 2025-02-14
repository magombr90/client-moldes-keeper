
import { createClient } from '@supabase/supabase-js';

// We'll use environment variables from Supabase integration
export const supabase = createClient(
  'https://your-project-url.supabase.co',  // ⚠️ You need to replace this with your actual Supabase URL
  'your-anon-key'  // ⚠️ You need to replace this with your actual anon key
);
