import { createClient, PostgrestError } from 'jsr:@supabase/supabase-js@2'
import "jsr:@std/dotenv/load";
import { Movie, Theater } from './movieEntityTypes.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
}

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

export async function findByReleaseDateBefore(today: string): Promise<Movie[]> {
  //날짜가 오늘 이전인 영화를 찾는다.
  const { data, error } = await supabase
    .from('upcoming_movie')
    .select('title, release_date, poster_path, overview, id')
    .lte('release_date', today)

  if (error || !data) {
    console.error(error.message)
    return []
  }

  return data
}

export async function findMovieTheaters(ids: string[]) {
  const { data, error } = await supabase
    .from('movie_theaters')
    .select('theaters_id, movie_id')
    .in('movie_id', ids)
  return data
}

export async function findTheaters(): Promise<Theater[]> {
  const { data, error } = await supabase
    .from('theaters')
    .select('*')

  if (error || !data) {
    console.error(error.message)
    return []
  }

  return data
}
