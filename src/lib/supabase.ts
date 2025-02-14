
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'sua-url-do-supabase',
  'sua-chave-anon-key'
);
