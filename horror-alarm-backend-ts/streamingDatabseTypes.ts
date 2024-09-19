export interface StreamingDetailResponse {
    id: string;
    title: string;
    posterPath: string;
    releaseDate: string;
    overview: string;
    voteAverage: string;
    voteCount: string;
    providers: string[];
    the_movie_db_id: string;
    reviews: string[];
}

export interface StreamingHorrorExpiring {
    title: string;
    poster_path: string;
    id: string;
    the_movie_db_id: string;
    vote_average: number;
    vote_count: number;
}

export interface StreamingPageResponse {
    title: string;
    posterPath: string;
    id: string;
    the_provider_id?: number;
    releaseDate: string;
    providers?: string;
}

export interface Provider {
    the_provider_id: number;
    movie_id?: string;
}