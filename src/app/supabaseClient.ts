import { createClient } from '@supabase/supabase-js';

// 1. Extract the secure environment routing tokens from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Add a quick safety development check to ensure keys are loading correctly
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Supabase Connection Error: Missing environment variables in your .env file. " +
    "Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are spelled correctly."
  );
}

// 3. Initialize the permanent secure database handshake instance module
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');