import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const mask = (s?: string) => (s ? s.slice(0, 18) + '…' : 'EMPTY');
console.log('[ENV]', { url: mask(SUPABASE_URL), anon: mask(SUPABASE_ANON_KEY) });

if (!SUPABASE_URL) throw new Error('Missing ENV: EXPO_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing ENV: EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
