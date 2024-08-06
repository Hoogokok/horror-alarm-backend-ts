import { findByReleaseDateBefore, findMovieTheaters, findTheaters } from "./movieRepository.ts";


interface MovieResponse {
    id: string;
    title: string;
    release_date: string;
    poster_path: string;
    overview: string;
    theaters: string[];
}

export async function getUpcomingResponse(today: string = new Date().toISOString()) {
    // 오늘 이후 개봉하는 영화를 찾는다.
    const releasingMovies = await findByReleaseDateBefore(today);
    // 개봉하는 영화의 id를 가져온다.
    const releasingMoviesIds = releasingMovies.map((movie: any) => movie.id);
    // 개봉하는 영화의 상영관 정보를 가져온다.
    const theaters = await findMovieTheaters(releasingMoviesIds);
    // 상영관 정보를 가져온다.
    const theaterList = await findTheaters();
    // 상영관 정보를 포함한 영화 정보를 만든다.
    const movies: MovieResponse[] = makeMovieResponse(releasingMovies, theaters, theaterList);
    return movies.filter((movie: MovieResponse) => movie.theaters.length > 0);
}
function makeMovieResponse(releasingMovies: any[], theaters: any[], theaterList: any[]): MovieResponse[] {
    const movies: MovieResponse[] = releasingMovies.map((movie: any) => {
        const movieTheaters = theaters.filter((theater: any) => theater.movie_id === movie.id);
        // 상영관 정보를 가져온다.
        const theatersList = movieTheaters.map((movieTheater: any) => {
            const theater = theaterList.find((theater: any) => theater.id === movieTheater.theaters_id);
            return theater.name;
        });
        return {
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            overview: movie.overview,
            theaters: theatersList
        };
    });

    return movies;
}