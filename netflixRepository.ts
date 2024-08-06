import { createClient } from 'jsr:@supabase/supabase-js@2'
import "jsr:@std/dotenv/load";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)