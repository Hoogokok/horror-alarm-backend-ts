import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertSpyCalls, spy } from "https://deno.land/std/testing/mock.ts";
import { countStreamingAllHorror, filterStreamingHorror, findByExpiredDateAfter, setTestSupabase, findStreamingHorror, findStreamingHorrorKrById, findStremingHorrorPage } from "../streamingRepository.ts";
import { setMockSql, clearMockSql } from "../db.ts";
import { mockSupabaseClient, mockSupabaseClientForMovie, mockSupabaseClientForStreamingPage } from "./mocks/supabaseMock.ts";

Deno.test("countStreamingAllHorror", async (t) => {
  const mockSql = spy((strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    if (query.includes("the_provider_id")) {
      return Promise.resolve([{ count: 15 }]);
    } else {
      return Promise.resolve([{ count: 30 }]);
    }
  });

  setMockSql(mockSql);

  await t.step("providerId가 0이 아닐 때", async () => {
    const result = await countStreamingAllHorror(1);

    // 결과 검증
    assertEquals(result, 3); // 15 / 6 (itemPerPage) = 2.5, 올림하여 3

    // sql 함수 호출 검증
    assertSpyCalls(mockSql, 1);
    assertEquals(
      mockSql.calls[0].args[0][0],
      "\n        SELECT COUNT(*) FROM movie_providers WHERE the_provider_id = "
    );
    assertEquals(mockSql.calls[0].args[1], 1);
  });

  await t.step("providerId가 0일 때", async () => {
    const result = await countStreamingAllHorror(0);

    // 결과 검증
    assertEquals(result, 5); // 30 / 6 (itemPerPage) = 5

    // sql 함수 호출 검증
    assertSpyCalls(mockSql, 2); // 이전 테스트와 합쳐서 2번 호출
    assertEquals(
      mockSql.calls[1].args[0][0],
      "\n        SELECT COUNT(*) FROM movie_providers"
    );
  });

  clearMockSql();
});

Deno.test("filterStreamingHorror", async (t) => {
  const mockMovies = [
    { title: "영화1", poster_path: "/path1.jpg", movie_id: "1", release_date: "2023-01-01", the_provider_id: "1" },
    { title: "영화2", poster_path: "/path2.jpg", movie_id: "2", release_date: "2023-02-01", the_provider_id: "2" },
  ];

  const mockSql = spy((strings: TemplateStringsArray, ...values: any[]) => {
    return Promise.resolve(mockMovies);
  });

  setMockSql(mockSql);

  await t.step("모든 프로바이더 (id가 0일 때)", async () => {
    const result = await filterStreamingHorror(0, 1);

    assertEquals(result.length, 2);
    assertEquals(result[0], {
      title: "영화1",
      poster_path: "/path1.jpg",
      id: "1",
      release_date: "2023-01-01",
      providers: "넷플릭스"
    });
    assertEquals(result[1], {
      title: "영화2",
      poster_path: "/path2.jpg",
      id: "2",
      release_date: "2023-02-01",
      providers: "디즈니플러스"
    });

    assertSpyCalls(mockSql, 1);
    assertEquals(
      mockSql.calls[0].args[0][0],
      "\n        SELECT movie.title, movie.poster_path, movie.id AS movie_id, movie.release_date, movie.vote_average, movie.vote_count, movie_providers.the_provider_id        \n        FROM movie\n        JOIN movie_providers \n        ON movie.id = movie_providers.movie_id\n        ORDER BY movie.release_date DESC   \n        LIMIT "
    );
  });

  await t.step("특정 프로바이더 (id가 1일 때)", async () => {
    const result = await filterStreamingHorror(1, 1);

    assertEquals(result.length, 2);
    assertEquals(result[0], {
      title: "영화1",
      poster_path: "/path1.jpg",
      id: "1",
      release_date: "2023-01-01",
      providers: "넷플릭스"
    });

    assertSpyCalls(mockSql, 2);
    assertEquals(
      mockSql.calls[1].args[0][0],
      "\n        SELECT movie.title, movie.poster_path, movie.id AS movie_id, movie.release_date, movie.vote_average, movie.vote_count, movie_providers.the_provider_id        \n        FROM movie\n        JOIN movie_providers \n        ON movie.id = movie_providers.movie_id\n        WHERE movie_providers.the_provider_id = "
    );
    assertEquals(mockSql.calls[1].args[1], 1);
  });

  clearMockSql();
});

Deno.test("findByExpiredDateAfter", async (t) => {
  const mockData = [
    { title: "영화1", expired_date: "2023-12-31", the_movie_db_id: "1" },
    { title: "영화2", expired_date: "2024-01-15", the_movie_db_id: "2" },
    { title: "영화3", expired_date: "2024-02-01", the_movie_db_id: "3" },
  ];

  const mockClient = mockSupabaseClient(mockData);
  setTestSupabase(mockClient);

  await t.step("오늘 날짜 이후의 영화 반환", async () => {
    const result = await findByExpiredDateAfter("2024-01-01");

    assertEquals(result, [
      { title: "영화2", expired_date: "2024-01-15", the_movie_db_id: "2" },
      { title: "영화3", expired_date: "2024-02-01", the_movie_db_id: "3" },
    ]);
  });

  await t.step("모든 영화 반환 (오늘 날짜가 가장 이른 경우)", async () => {
    const result = await findByExpiredDateAfter("2023-01-01");

    assertEquals(result, mockData);
  });

  await t.step("빈 배열 반환 (오늘 날짜가 가장 늦은 경우)", async () => {
    const result = await findByExpiredDateAfter("2024-03-01");

    assertEquals(result, []);
  });

  await t.step("에러 발생 시 빈 배열 반환", async () => {
    const errorClient = {
      from: () => ({
        select: () => ({
          gte: () => ({
            data: null,
            error: new Error("Database error")
          })
        })
      })
    };
    setTestSupabase(errorClient);

    const result = await findByExpiredDateAfter("2024-01-01");

    assertEquals(result, []);
  });
});

const mockMovies = [
  { title: "공포영화1", poster_path: "/path1.jpg", id: "1", vote_average: 7.5, vote_count: 1000, the_movie_db_id: "tmdb1" },
  { title: "공포영화2", poster_path: "/path2.jpg", id: "2", vote_average: 8.0, vote_count: 1500, the_movie_db_id: "tmdb2" },
  { title: "공포영화3", poster_path: "/path3.jpg", id: "3", vote_average: 6.5, vote_count: 800, the_movie_db_id: "tmdb3" },
];

Deno.test("findStreamingHorror", async (t) => {
  const mockClient = mockSupabaseClient(mockMovies);
  setTestSupabase(mockClient);

  await t.step("존재하는 영화 ID로 검색", async () => {
    const result = await findStreamingHorror(["tmdb1", "tmdb2"]);

    assertEquals(result, [
      { title: "공포영화1", poster_path: "/path1.jpg", id: "1", vote_average: 7.5, vote_count: 1000, the_movie_db_id: "tmdb1" },
      { title: "공포영화2", poster_path: "/path2.jpg", id: "2", vote_average: 8.0, vote_count: 1500, the_movie_db_id: "tmdb2" },
    ]);
  });

  await t.step("존재하지 않는 영화 ID로 검색", async () => {
    const result = await findStreamingHorror(["tmdb4"]);

    assertEquals(result, []);
  });

  await t.step("빈 ID 목록으로 검색", async () => {
    const result = await findStreamingHorror([]);

    assertEquals(result, []);
  });

  await t.step("에러 발생 시 빈 배열 반환", async () => {
    const errorClient = {
      from: () => ({
        select: () => ({
          in: () => ({
            data: null,
            error: new Error("Database error")
          })
        })
      })
    };
    setTestSupabase(errorClient);

    const result = await findStreamingHorror(["tmdb1"]);

    assertEquals(result, []);
  });
});

const mockMovieData = [
  {
    title: "테스트 영화",
    poster_path: "/test_path.jpg",
    id: "test_id",
    overview: "테스트 개요",
    release_date: "2023-01-01",
    vote_average: 7.5,
    vote_count: 1000,
    the_movie_db_id: "tmdb_test_id"
  }
];

const mockProviderData = [
  { the_provider_id: 1 },
  { the_provider_id: 2 }
];

const mockReviewData = [
  { id: 1, review_content: "좋은 영화였습니다." },
  { id: 2, review_content: "재미있었어요!" }
];

Deno.test("findStreamingHorrorKrById", async (t) => {
  const mockClient = mockSupabaseClientForMovie(mockMovieData, mockProviderData, mockReviewData);
  setTestSupabase(mockClient);

  await t.step("영화 정보 정상 조회", async () => {
    const result = await findStreamingHorrorKrById("test_id");

    assertEquals(result, {
      title: "테스트 영화",
      poster_path: "/test_path.jpg",
      id: "test_id",
      overview: "테스트 개요",
      release_date: "2023-01-01",
      providers: ["넷플릭스", "Disney+"],
      vote_average: 7.5,
      vote_count: 1000,
      the_movie_db_id: "tmdb_test_id",
      reviews: ["좋은 영화였습니다.", "재미있었어요!"]
    });
  });

  await t.step("존재하지 않는 영화 ID로 조회", async () => {
    const errorClient = mockSupabaseClientForMovie([], [], []);
    setTestSupabase(errorClient);

    const result = await findStreamingHorrorKrById("non_existent_id");

    assertEquals(result, {
      title: "Unknown",
      poster_path: "Unknown",
      id: "Unknown",
      overview: "Unknown",
      release_date: "Unknown",
      providers: [],
      vote_average: 0,
      vote_count: 0,
      the_movie_db_id: "Unknown",
      reviews: []
    });
  });

  await t.step("리뷰 데이터 없을 때", async () => {
    const noReviewClient = mockSupabaseClientForMovie(mockMovieData, mockProviderData, []);
    setTestSupabase(noReviewClient);

    const result = await findStreamingHorrorKrById("test_id");

    assertEquals(result.reviews, []);
  });
});


Deno.test("findStremingHorrorPage", async (t) => {
  const mockMovieProviders = [
    { movie_id: "1", the_provider_id: "1" },
    { movie_id: "2", the_provider_id: "1" },
    { movie_id: "3", the_provider_id: "1" },
  ];

  const mockMovies = [
    { title: "영화1", poster_path: "/path1.jpg", id: "1", release_date: "2023-01-01" },
    { title: "영화2", poster_path: "/path2.jpg", id: "2", release_date: "2023-02-01" },
    { title: "영화3", poster_path: "/path3.jpg", id: "3", release_date: "2023-03-01" },
  ];

  const mockClient = mockSupabaseClientForStreamingPage(mockMovieProviders, mockMovies);
  setTestSupabase(mockClient);

  await t.step("정상적인 페이지 조회", async () => {
    const result = await findStremingHorrorPage("1", 0);

    assertEquals(result, mockMovies);
  });

  await t.step("존재하지 않는 프로바이더 ID로 조회", async () => {
    const result = await findStremingHorrorPage("999", 0);

    assertEquals(result, []);
  });

  await t.step("범위를 벗어난 페이지 조회", async () => {
    const result = await findStremingHorrorPage("1", 100);

    assertEquals(result, []);
  });

  await t.step("에러 발생 시 빈 배열 반환", async () => {
    const errorClient = {
      from: () => ({
        select: () => ({
          eq: () => ({ data: null, error: new Error("Database error") }),
          in: () => ({
            range: () => ({ data: null, error: new Error("Database error") })
          })
        })
      })
    };
    setTestSupabase(errorClient);

    const result = await findStremingHorrorPage("1", 0);

    assertEquals(result, []);
  });
});