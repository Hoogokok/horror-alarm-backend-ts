import { createClient } from 'jsr:@supabase/supabase-js@2'
import "jsr:@std/dotenv/load";
import { NetflixHorrorKrById, NetflixHorrorKr } from "./netflixService.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey
)

interface Provider {
    the_provider_id: number;
    movie_id?: string;
}


export async function findByExpiredDateAfter(today: string = new Date().toISOString()) {
    //날짜가 오늘 이후인 영화를 찾는다.
    const { data, error } = await supabase
        .from('netflix_horror_expiring')
        .select('title, expired_date, the_movie_db_id')
        .gte('expired_date', today)
    return data
}

export async function findNetflixHorrorKr(the_movie_db_ids: string[]): Promise<NetflixHorrorKr[]> {
    // the_movie_db_id가 있는 넷플릭스 공포 영화를 찾는다.
    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, the_movie_db_id')
        .in('the_movie_db_id', the_movie_db_ids)
    if (error || !data) {
        return []
    }

    return data
}

export async function findNetflixHorrorKrById(id: string): Promise<NetflixHorrorKrById> {
    // 아이디로 넷플릭스 공포 영화를 찾는다이
    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, overview, release_date')
        .eq('id', id)

    const result = await getMovieProviderByMovieId(id)
    if (error || !data) {
        return {
            title: "Unknown",
            poster_path: "Unknown",
            id: "Unknown",
            overview: "Unknown",
            release_date: "Unknown",
            providers: []
        }
    }

    const providers = result.map((provider: Provider) =>
        provider.the_provider_id === 1 ? "넷플릭스" : "Disney+"
    );

    return {
        title: data[0].title,
        poster_path: data[0].poster_path,
        id: data[0].id,
        overview: data[0].overview,
        release_date: data[0].release_date,
        providers: providers
    }
}

export async function findNetflixHorrorKrPage(): Promise<NetflixHorrorKr[]> {
    // 넷플릭스 공포 영화를 11개까지 찾는다.
    const ids = await getMovieProviders()

    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, overview')
        .in('id', ids)
        .range(0, 10)

    if (error || !data) {
        return []
    }

    return data.map((movie: any) => {
        return {
            title: movie.title,
            poster_path: movie.poster_path,
            id: movie.id,
            the_movie_db_id: movie.the_movie_db_id
        }
    })
}

async function getMovieProviders() {
    const { data, error } = await supabase
        .from('movie_providers')
        .select('movie_id')
        .eq('the_provider_id', 1)

    if (error || !data) {
        return []
    }
    return data.map((movie: any) => movie.movie_id)
}

async function getMovieProviderByMovieId(movieId: string): Promise<Array<Provider>> {
    const { data, error } = await supabase
        .from('movie_providers')
        .select('the_provider_id')
        .eq('movie_id', movieId)

    if (error || !data) {
        return []
    }
    return data
}
