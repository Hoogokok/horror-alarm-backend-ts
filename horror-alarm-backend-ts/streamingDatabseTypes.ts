export interface StreamingDetailResponse {
    id: string;
    title: string;
    posterPath: string;
    releaseDate: string;
    overview: string;
    voteAverage: string;
    voteCount: string;
    providers: string[];

}

export interface StreamingHorrorExpiring {
    title: string;
    poster_path: string;
    id: string;
    the_movie_db_id: string;
}

export interface StreamingPageResponse {
    title: string;
    posterPath: string;
    id: string;
    the_provider_id?: number;
}

export interface Provider {
    the_provider_id: number;
    movie_id?: string;
}