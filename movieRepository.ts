import { createClient } from 'jsr:@supabase/supabase-js@2'
import "jsr:@std/dotenv/load";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export async function findByReleaseDateAfter(today: string) {
  //날짜가 오늘 이후인 영화를 찾는다.
  const { data, error } = await supabase
    .from('upcoming_movie')
    .select('title, release_date, poster_path, overview, id')
    .gt('release_date', today)
  return data
}

export async function findByReleaseDateBefore(today: string) {
  //날짜가 오늘 이전인 영화를 찾는다.
  const { data, error } = await supabase
    .from('upcoming_movie')
    .select('title, release_date, poster_path, overview, id')
    .lte('release_date', today)

  return data
}


