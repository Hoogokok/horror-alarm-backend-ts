import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Provider, StreamingDetailResponse, StreamingHorrorExpiring, StreamingPageResponse } from "./streamingDatabseTypes.ts";
import { sql } from "./db.ts";

const itemPerPage = 6

let supabase: ReturnType<typeof createClient>;

export function initSupabase() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
    }

    if (Deno.env.get('DENO_ENV') !== 'test') {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
}

// 테스트용 함수 추가
export function setTestSupabase(mockClient: any) {
    if (Deno.env.get('DENO_ENV') === 'test') {
        supabase = mockClient as ReturnType<typeof createClient>;
    }
}

export async function countStreamingAllHorror(providerId: number): Promise<number> {
    var result;
    if (providerId !== 0) {
        result = await sql`
        SELECT COUNT(*) FROM movie_providers WHERE the_provider_id = ${providerId}`;
    } else {
        result = await sql`
        SELECT COUNT(*) FROM movie_providers`;
    }
    const totalPages = Math.ceil(result[0].count / itemPerPage);
    return totalPages;
}

export async function filterStreamingHorror(id: number, currentPage: number): Promise<Array<StreamingPageResponse>> {
    // 스트리밍 공포 영화를 찾는다.
    const offset = (currentPage - 1) * itemPerPage
    if (id === 0) {
        const result = await sql`
        SELECT movie.title, movie.poster_path, movie.id AS movie_id, movie.release_date, movie.vote_average, movie.vote_count, movie_providers.the_provider_id        
        FROM movie
        JOIN movie_providers 
        ON movie.id = movie_providers.movie_id
        ORDER BY movie.release_date DESC   
        LIMIT ${itemPerPage} OFFSET ${offset}`

        return result.map((movie: any) => {
            return {
                title: movie.title,
                posterPath: movie.poster_path,
                id: movie.movie_id,
                releaseDate: movie.release_date,
                providers: movie.the_provider_id === "1" ? "넷플릭스" : "디즈니플러스"
            }
        })
    }

    const result = await sql`
        SELECT movie.title, movie.poster_path, movie.id AS movie_id, movie.release_date, movie.vote_average, movie.vote_count, movie_providers.the_provider_id        
        FROM movie
        JOIN movie_providers 
        ON movie.id = movie_providers.movie_id
        WHERE movie_providers.the_provider_id = ${id}
        ORDER BY movie.release_date DESC   
        LIMIT ${itemPerPage} OFFSET ${offset}`

    return result.map((movie: any) => {
        return {
            title: movie.title,
            posterPath: movie.poster_path,
            id: movie.movie_id,
            releaseDate: movie.release_date,
            providers: movie.the_provider_id === "1" ? "넷플릭스" : "디즈니플러스"
        }
    })
}


export async function findByExpiredDateAfter(today: string = new Date().toISOString()){
    //날짜가 오늘 이후인 영화를 찾는다.
    const { data, error } = await supabase
        .from('netflix_horror_expiring')
        .select('title, expired_date, the_movie_db_id')
        .gte('expired_date', today)

    if (error) {
        console.error('Error in findByExpiredDateAfter:', error);
        return [];
    }
    
    return data
}

export async function findStreamingHorror(the_movie_db_ids: string[]): Promise<StreamingHorrorExpiring[]> {
    // the_movie_db_id가 있는 스트리밍 공포 영화를 찾는다.
    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, vote_average, vote_count, the_movie_db_id')
        .in('the_movie_db_id', the_movie_db_ids)
    if (error || !data) {
        return []
    }

    return data  as StreamingHorrorExpiring[]
}

export async function findStreamingHorrorKrById(id: string): Promise<StreamingDetailResponse> {
    // 아이디로 공포 영화를 찾는다
    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, overview, release_date, vote_average, vote_count, the_movie_db_id')
        .eq('id', id)

    const result = await getMovieProviderByMovieId(id)
    if (error || !data) {
        return {
            title: "Unknown",
            posterPath: "Unknown",
            id: "Unknown",
            overview: "Unknown",
            releaseDate: "Unknown",
            providers: [],
            voteAverage: "Unknown",
            voteCount: "Unknown",
            the_movie_db_id: "Unknown",
            reviews: []
        }
    }

    const providers = result.map((provider: Provider) =>
        provider.the_provider_id === 1 ? "넷플릭스" : "Disney+"
    )

    const { data : reviews, error : reviewsError  } = await supabase
        .from('reviews')
        .select('id, review_content')
        .eq('the_movie_db_id', data[0].the_movie_db_id as string)

        if (reviewsError || !reviews) {
            return {
                title: data[0].title as string,
                posterPath: data[0].poster_path as string,
                id: data[0].id as string,
                overview: data[0].overview as string,
                releaseDate: data[0].release_date as string,
                providers: providers,
                voteAverage: data[0].vote_average as string,
                voteCount: data[0].vote_count as string,
                the_movie_db_id: data[0].the_movie_db_id as string,
                reviews: []
            }
        }

        return {
            title: data[0].title as string,
            posterPath: data[0].poster_path as string,
            id: data[0].id as string,
            overview: data[0].overview as string,
            releaseDate: data[0].release_date as string,
            providers: providers,
            voteAverage: data[0].vote_average as string,
            voteCount: data[0].vote_count as string,
            the_movie_db_id: data[0].the_movie_db_id as string,
            reviews: reviews.map((review: any) => review.review_content as string)
        }
}

export async function findStremingHorrorPage(the_provider_id: string, page: number): Promise<StreamingPageResponse[]> {
    // 스트리밍 공포 영화를 11개까지 찾는다.
    const ids = await getMovieProviders(the_provider_id)
    const start = page
    const end = start + 10

    const { data, error } = await supabase
        .from('movie')
        .select('title, poster_path, id, release_date')
        .in('id', ids)
        .range(start, end)

    if (error || !data) {
        return []
    }

    return data.map((movie: any) => {
        return {
            title: movie.title,
            posterPath: movie.poster_path,
            id: movie.id,
            releaseDate: movie.release_date
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

async function getMovieProviderByMovieId(movieId: string): Promise<Provider[]> {
    const { data, error } = await supabase
        .from('movie_providers')
        .select('the_provider_id')
        .eq('movie_id', movieId)

    if (error || !data) {
        return []
    }
    return data as Provider[];
}
