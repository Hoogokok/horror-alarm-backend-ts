import { findByExpiredDateAfter, findNetflixHorrorKr, findNetflixHorrorKrById } from "./netflixRepository.ts";

interface ExpiredMovie {
    title: string;
    expired_date: string;
    the_movie_db_id: string;
}

export interface NetflixHorrorKr {
    title: string;
    poster_path: string;
    id: string;
    the_movie_db_id: string;
}

export interface NetflixHorrorKrById {
    title: string;
    poster_path: string;
    id: string;
    overview: string;
}


export interface NetflixResponses {
    expiredMovies: Array<NetflixResponse>;
}

interface NetflixResponse {
    id: string;
    title: string;
    posterPath: string;
    expiredDate: string;
}

interface NetflixDetailResponse {
    id: string;
    title: string;
    posterPath: string;
    overview: string;
}

export async function getNetflixDetailResponse(id: string): Promise<NetflixDetailResponse> {
    const netflixHorrorKrById = await findNetflixHorrorKrById(id);
    if (netflixHorrorKrById.id === "Unknown") {
        return {
            id: "Unknown",
            title: "Unknown",
            posterPath: "Unknown",
            overview: "Unknown",
        };
    }
    return {
        id: netflixHorrorKrById.id,
        title: netflixHorrorKrById.title,
        posterPath: netflixHorrorKrById.poster_path,
        overview: netflixHorrorKrById.overview,
    };
}


export async function getExpiringResponse(today: string = new Date().toISOString()): Promise<NetflixResponses> {
    // 오늘 이후 만료되는 넷플릭스 영화를 찾는다.
    const expiringMovies = await findByExpiredDateAfter(today);
    // 만료되는 영화가 없으면 빈 배열을 반환한다.
    if (!expiringMovies) {
        return {
            expiredMovies: [],
        };
    }
    // 만료되는 영화의 the_movie_db_id를 가져온다.
    const expiringMoviesIds = expiringMovies.map((movie: ExpiredMovie) => movie.the_movie_db_id);
    // 만료되는 영화의 한국어 정보를 가져온다.
    const netflixHorrorKr = await findNetflixHorrorKr(expiringMoviesIds);
    if (!netflixHorrorKr) {
        return {
            expiredMovies: [],
        };
    }
    // 만료되는 영화의 정보를 만든다.
    const movies: NetflixResponse[] = makeNetflixResponse(expiringMovies, netflixHorrorKr);
    // 정보가 있는 영화만 반환한다.
    const validMovies = movies.filter((movie: NetflixResponse) => movie.id !== "Unknown");
    return {
        expiredMovies: validMovies,
    };
}

function makeNetflixResponse(expiringMovies: ExpiredMovie[], netflixHorrorKr: NetflixHorrorKr[]): NetflixResponse[] {
    return expiringMovies.map((movie: ExpiredMovie) => {
        const netflixHorror = netflixHorrorKr.find((netflixHorror: NetflixHorrorKr) => netflixHorror.the_movie_db_id === movie.the_movie_db_id);
        if (!netflixHorror) {
            return {
                id: "Unknown",
                title: "Unknown",
                posterPath: "Unknown",
                expiredDate: "Unknown",
            };
        }
        return {
            id: netflixHorror.id,
            title: netflixHorror.title,
            posterPath: netflixHorror.poster_path,
            expiredDate: movie.expired_date
        }
    });
}

