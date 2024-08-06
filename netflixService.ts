import { findByExpiredDateAfter, findNetflixHorrorKr } from "./netflixRepository.ts";

interface ExpiredMovie {
    title: string;
    expired_date: string;
    the_movie_db_id: string;
}

interface NetflixHorrorKr {
    title: string;
    poster_path: string;
    id: string;
}


interface NetflixResponse {
    id: string;
    title: string;
    poster_path: string;
    expired_date: string;
}

