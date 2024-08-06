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
        .from('netflix_horror_kr')
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
        .from('netflix_horror_kr')
        .select('title, poster_path, id, overview')
        .eq('pk', id)

    if (error || !data) {
        return {
            title: "Unknown",
            poster_path: "Unknown",
            id: "Unknown",
            overview: "Unknown",
        }
    }

    return data[0]
}