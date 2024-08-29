import { createClient } from 'jsr:@supabase/supabase-js@2'
import "jsr:@std/dotenv/load";
import { StreamingHorrorExpiring, StreamingPageResponse } from "./streamingService.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
}
export interface StreamingDetailResponse {
    id: string;
    title: string;
    posterPath: string;
    releaseDate: string;
    overview: string;
    providers: string[];

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

export async function findStreamingHorror(the_movie_db_ids: string[]): Promise<StreamingHorrorExpiring[]> {
    // the_movie_db_id가 있는 스트리밍 공포 영화를 찾는다.
    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, the_movie_db_id')
        .in('the_movie_db_id', the_movie_db_ids)
    if (error || !data) {
        return []
    }

    return data
}

export async function findStreamingHorrorKrById(id: string): Promise<StreamingDetailResponse> {
    // 아이디로 공포 영화를 찾는다
    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, overview, release_date')
        .eq('id', id)

    const result = await getMovieProviderByMovieId(id)
    if (error || !data) {
        return {
            title: "Unknown",
            posterPath: "Unknown",
            id: "Unknown",
            overview: "Unknown",
            releaseDate: "Unknown",
            providers: []
        }
    }

    const providers = result.map((provider: Provider) =>
        provider.the_provider_id === 1 ? "넷플릭스" : "Disney+"
    );

    return {
        title: data[0].title,
        posterPath: data[0].poster_path,
        id: data[0].id,
        overview: data[0].overview,
        releaseDate: data[0].release_date,
        providers: providers
    }
}

export async function findStremingHorrorPage(the_provider_id: string): Promise<StreamingPageResponse[]> {
    // 넷플릭스 공포 영화를 11개까지 찾는다.
    const ids = await getMovieProviders(the_provider_id)

    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id')
        .in('id', ids)
        .range(0, 10)

    if (error || !data) {
        return []
    }

    return data.map((movie: any) => {
        return {
            title: movie.title,
            posterPath: movie.poster_path,
            id: movie.id
        }
    })
}

async function getMovieProviders(the_provider_id: string): Promise<Array<string>> {
    const { data, error } = await supabase
        .from('movie_providers')
        .select('movie_id')
        .eq('the_provider_id', the_provider_id)

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
