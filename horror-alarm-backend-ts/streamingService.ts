import { StreamingDetailResponse, StreamingHorrorExpiring, StreamingPageResponse } from "./streamingDatabseTypes.ts";
import { countStreamingAllHorror, filterStreamingHorror, findByExpiredDateAfter, findStreamingHorror, findStreamingHorrorKrById, findStremingHorrorPage } from "./streamingRepository.ts";

interface ExpiredMovie {
    title: string;
    expired_date: string;
    the_movie_db_id: string;
}

interface NetflixExpiredResponse {
    id: string;
    title: string;
    posterPath: string;
    expiredDate: string;
}


export async function getStreamingMoives(query: string, page: string): Promise<StreamingPageResponse[]> {
    const providerId = query === "netflix" ? 1 : query === "disney" ? 2 : 0;
    const streamingHorrorKr = await filterStreamingHorror(providerId, parseInt(page));
    return streamingHorrorKr;
}

export async function getTotalPage(query: string): Promise<number> {
    const providerId = query === "netflix" ? 1 : query === "disney" ? 2 : 0;
    const totalPages = await countStreamingAllHorror(providerId);
    return totalPages;
}

export async function getNetflixDetailResponse(id: string): Promise<StreamingDetailResponse> {
    const netflixHorrorKrById = await findStreamingHorrorKrById(id);
    if (netflixHorrorKrById.id === "Unknown") {
        return {
            id: "Unknown",
            title: "Unknown",
            posterPath: "Unknown",
            overview: "Unknown",
            releaseDate: "Unknown",
            voteAverage: "Unknown",
            voteCount: "Unknown",
            the_movie_db_id: "Unknown",
            providers: [],
            reviews: []
        };
    }
    return {
        id: netflixHorrorKrById.id,
        title: netflixHorrorKrById.title,
        posterPath: netflixHorrorKrById.posterPath,
        overview: netflixHorrorKrById.overview,
        releaseDate: netflixHorrorKrById.releaseDate,
        voteAverage: netflixHorrorKrById.voteAverage,
        voteCount: netflixHorrorKrById.voteCount,
        providers: netflixHorrorKrById.providers,
        the_movie_db_id: netflixHorrorKrById.the_movie_db_id,
        reviews: netflixHorrorKrById.reviews
    };
}


export async function getExpiringResponse(today: string = new Date().toISOString()): Promise<Array<NetflixExpiredResponse>> {
    // 오늘 이후 만료되는 넷플릭스 영화를 찾는다.
    const expiringMovies = await findByExpiredDateAfter(today);
    // 만료되는 영화가 없으면 빈 배열을 반환한다.
    if (!expiringMovies) {
        return [];
    }
    // 만료되는 영화의 the_movie_db_id를 가져온다.
    const expiringMoviesIds = expiringMovies.map((movie: ExpiredMovie) => movie.the_movie_db_id);
    // 만료되는 영화의 한국어 정보를 가져온다.
    const netflixHorrorKr = await findStreamingHorror(expiringMoviesIds);
    if (!netflixHorrorKr) {
        return [];
    }
    // 만료되는 영화의 정보를 만든다.
    const movies: NetflixExpiredResponse[] = makeNetflixResponse(expiringMovies, netflixHorrorKr);
    // 정보가 있는 영화만 반환한다.
    const validMovies = movies.filter((movie: NetflixExpiredResponse) => movie.id !== "Unknown");
    return validMovies;
}

function makeNetflixResponse(expiringMovies: ExpiredMovie[], netflixHorrorKr: StreamingHorrorExpiring[]): NetflixExpiredResponse[] {
    return expiringMovies.map((movie: ExpiredMovie) => {
        const netflixHorror = netflixHorrorKr.find((netflixHorror: StreamingHorrorExpiring) => netflixHorror.the_movie_db_id === movie.the_movie_db_id);
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
