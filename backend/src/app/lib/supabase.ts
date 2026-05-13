import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;
const supabaseServiceRoleKey = env.supabaseServiceRoleKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations
export const supabaseServiceRole = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey
);
