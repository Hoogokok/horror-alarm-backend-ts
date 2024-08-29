export interface Movie {
    id: string;
    title: string;
    release_date: string;
    poster_path: string;
    overview: string;
}

export interface Theater {
    id: string;
    name: string;
}

export interface MovieTheater {
    theaters_id: string;
    movie_id: string;
}