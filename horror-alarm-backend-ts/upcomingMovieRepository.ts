import { createClient, PostgrestError } from 'jsr:@supabase/supabase-js@2'
import "jsr:@std/dotenv/load";
import { Movie, Theater, MovieTheater } from './movieDatabaseTypes.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export async function findByReleaseDateAfter(today: string): Promise<Array<Movie>> {
  //날짜가 오늘 이후인 영화를 찾는다.
  const { data, error } = await supabase
    .from('upcoming_movie')
    .select('title, release_date, poster_path, overview, id, vote_average, vote_count')
    .gt('release_date', today)

  return handleError(error, data)
}

export async function findByReleaseDateBefore(today: string): Promise<Array<Movie>> {
  //날짜가 오늘 이전인 영화를 찾는다.
  const { data, error } = await supabase
    .from('upcoming_movie')
    .select('title, release_date, poster_path, overview, id, vote_average, vote_count')
    .lte('release_date', today)

  return handleError(error, data)
}

export async function findMovieTheaters(ids: string[]): Promise<Array<MovieTheater>> {
  const { data, error } = await supabase
    .from('movie_theaters')
    .select('theaters_id, movie_id')
    .in('movie_id', ids)

  return handleError(error, data)
}

export async function findTheaters(): Promise<Array<Theater>> {
  const { data, error } = await supabase
    .from('theaters')
    .select('*')

  return handleError(error, data)
}

export  async function findMovieDetail(id: string): Promise<Movie> { 
  const { data, error } = await supabase
    .from('upcoming_movie')
    .select('title, release_date, poster_path, overview, id, vote_average, vote_count, the_movie_db_id')
    .eq('id', id)

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, review_content')
    .eq('review_movie_id', data[0].the_movie_db_id)

  if (reviewsError || !reviews) {
    return {
      ...data[0],
      reviews: []
    }
  }

  return {
    ...data[0],
    reviews: reviews.map((review: any) => review.review_content)
  }
}

function handleError(error: PostgrestError | null, data: any): Array<any> {
  if (error || !data) {
    console.error(error?.message);
    return [];
  }
  return data;
}

