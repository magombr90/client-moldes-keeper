// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eanfptuvuemuozjbbdpi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbmZwdHV2dWVtdW96amJiZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MDA3MzAsImV4cCI6MjA1NTQ3NjczMH0.pCWJNZ2WKsdGzxSAkbvmE-tUE3aQKc-zASJE6qKlFLk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);