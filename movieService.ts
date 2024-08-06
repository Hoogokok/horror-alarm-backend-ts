import { findByReleaseDateBefore, findMovieTheaters, findTheaters } from "./movieRepository.ts";

interface Movie {
    id: string;
    title: string;
    release_date: string;
    poster_path: string;
    overview: string;
}

interface Theater {
    id: string;
    name: string;
}

interface MovieTheater {
    theaters_id: string;
    movie_id: string;
}

interface MovieResponse {
    id: string;
    title: string;
    releaseDate: string;
    posterPath: string;
    overview: string;
    theaters: string[];
}

export async function getReleasedResponse(today: string = new Date().toISOString()) {
    // 오늘 이전 개봉한 영화를 찾는다.
    const releasedMovies = await findByReleaseDateBefore(today);
    // 개봉한 영화의 id를 가져온다.
    const releasedMoviesIds = (releasedMovies ?? []).map((movie: Movie) => movie.id);
    // 개봉한 영화의 상영관 정보를 가져온다.
    const theaters = await findMovieTheaters(releasedMoviesIds) ?? [];
    // 상영관 정보를 가져온다.
    const theaterList = await findTheaters() ?? [];
    // 상영관 정보를 포함한 영화 정보를 만든다.
    const movies: MovieResponse[] = makeMovieResponse(releasedMovies ?? [], theaters, theaterList);
    // 상영관 정보가 있는 영화만 반환한다.
    return movies.filter((movie: MovieResponse) => movie.theaters.length > 0);
}

export async function getUpcomingResponse(today: string = new Date().toISOString()) {
    // 오늘 이후 개봉하는 영화를 찾는다.
    const releasingMovies = await findByReleaseDateBefore(today);
    // 개봉하는 영화의 id를 가져온다.
    const releasingMoviesIds = (releasingMovies ?? []).map((movie: Movie) => movie.id);
    // 개봉하는 영화의 상영관 정보를 가져온다.
    const theaters = await (findMovieTheaters(releasingMoviesIds) ?? []);
    // 상영관 정보를 가져온다.
    const theaterList = await (findTheaters() ?? []);
    // 상영관 정보를 포함한 영화 정보를 만든다.
    const movies: MovieResponse[] = makeMovieResponse(releasingMovies ?? [], theaters ?? [], theaterList ?? []);

    return movies;
}

function makeMovieResponse(releasingMovies: Movie[], movieTheaterList: MovieTheater[], theaterList: Theater[]): MovieResponse[] {
    const movies: MovieResponse[] = releasingMovies.map((movie: Movie) => {
        const filteredTheaters = movieTheaterList.filter((movieTheater: MovieTheater) => movieTheater.movie_id === movie.id);
        // 상영관 정보를 가져온다.
        const theatersList = filteredTheaters.map((movieTheater: MovieTheater) => {
            const theater = theaterList.find((theater: Theater) => theater.id === movieTheater.theaters_id);
            return theater ? theater.name : '';
        });
        // 빈 문자열을 제거한다.
        const notBlankTheaters = theatersList.filter((theater: string) => theater !== '');

        return {
            id: movie.id,
            title: movie.title,
            releaseDate: movie.release_date,
            posterPath: movie.poster_path,
            overview: movie.overview,
            theaters: notBlankTheaters
        };
    });

    return movies;
}