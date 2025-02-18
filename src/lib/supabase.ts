
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://your-project-url.supabase.co',  // ⚠️ Você precisa substituir com sua URL do Supabase
  'your-anon-key'  // ⚠️ Você precisa substituir com sua chave anon
);
