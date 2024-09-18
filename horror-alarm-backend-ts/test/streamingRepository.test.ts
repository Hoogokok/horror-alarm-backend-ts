import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { countStreamingAllHorror, initSupabase, setTestSupabase, filterStreamingHorror } from "../streamingRepository.ts";
import { setMockSql, clearMockSql } from "../db.ts";
import { StreamingPageResponse } from "../streamingDatabseTypes.ts";

// Supabase 클라이언트 목업
const mockSupabaseClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        data: null,
        error: null,
      }),
      in: () => ({
        data: null,
        error: null,
      }),
      gte: () => ({
        data: null,
        error: null,
      }),
      range: () => ({
        data: null,
        error: null,
      }),
    }),
  }),
};

Deno.test("countStreamingAllHorror 테스트", async (t) => {
  const originalEnv = Deno.env.get;

  // 환경 변수 목업
  Deno.env.get = (key: string): string | undefined => {
    const envVars: { [key: string]: string } = {
      'POSTGRES_URL': 'mock_url',
      'POSTGRES_USER': 'mock_user',
      'POSTGRES_DB': 'mock_db',
      'POSTGRES_HOST': 'mock_host',
      'POSTGRES_PASSWORD': 'mock_password',
      'POSTGRES_PORT': '5432',
      'SUPABASE_URL' : 'https://example.com',
      'SUPABASE_ANON_KEY': 'mock_supabase_anon_key',
      'DENO_ENV': 'test'
    };
    return envVars[key];
  };

  // Supabase 초기화
  initSupabase();

  // Supabase 클라이언트 목업 설정
  setTestSupabase(mockSupabaseClient);

  await t.step("providerId가 0이 아닐 때", async () => {
    setMockSql(() => Promise.resolve([{ count: "30" }]));
    
    const result = await countStreamingAllHorror(1);
    assertEquals(result, 5); // 30 / 6 = 5 (올림)
    
    clearMockSql();
  });

  await t.step("providerId가 0일 때", async () => {
    setMockSql(() => Promise.resolve([{ count: "60" }]));
    
    const result = await countStreamingAllHorror(0);
    assertEquals(result, 10); // 60 / 6 = 10 (올림)
    
    clearMockSql();
  });

  // 테스트 후 원래 환경 변수 함수 복원
  Deno.env.get = originalEnv;
});

Deno.test("filterStreamingHorror 테스트", async (t) => {
  const originalEnv = Deno.env.get;

  // 환경 변수 목업
  Deno.env.get = (key: string): string | undefined => {
    const envVars: { [key: string]: string } = {
      'POSTGRES_URL': 'mock_url',
      'POSTGRES_USER': 'mock_user',
      'POSTGRES_DB': 'mock_db',
      'POSTGRES_HOST': 'mock_host',
      'POSTGRES_PASSWORD': 'mock_password',
      'POSTGRES_PORT': '5432',
      'SUPABASE_URL' : 'https://example.com',
      'SUPABASE_ANON_KEY': 'mock_supabase_anon_key',
      'DENO_ENV': 'test'
    };
    return envVars[key];
  };

  // Supabase 초기화
  initSupabase();

  // Supabase 클라이언트 목업 설정
  setTestSupabase(mockSupabaseClient);

  await t.step("id가 0일 때 (모든 프로바이더)", async () => {
    const mockMovies = [
      { title: "Horror Movie 1", poster_path: "/path1.jpg", movie_id: "1", release_date: "2023-01-01", the_provider_id: "1" },
      { title: "Horror Movie 2", poster_path: "/path2.jpg", movie_id: "2", release_date: "2023-02-01", the_provider_id: "2" },
    ];

    setMockSql(() => Promise.resolve(mockMovies));
    
    const result = await filterStreamingHorror(0, 1);
    assertEquals(result.length, 2);
    assertEquals(result[0].title, "Horror Movie 1");
    assertEquals(result[0].providers, "넷플릭스");
    assertEquals(result[1].title, "Horror Movie 2");
    assertEquals(result[1].providers, "디즈니플러스");
    
    clearMockSql();
  });

  await t.step("특정 프로바이더 (id가 1일 때)", async () => {
    const mockMovies = [
      { title: "Netflix Horror", poster_path: "/path3.jpg", movie_id: "3", release_date: "2023-03-01", the_provider_id: "1" },
    ];

    setMockSql(() => Promise.resolve(mockMovies));
    
    const result = await filterStreamingHorror(1, 1);
    assertEquals(result.length, 1);
    assertEquals(result[0].title, "Netflix Horror");
    assertEquals(result[0].providers, "넷플릭스");
    
    clearMockSql();
  });

  // 테스트 후 원래 환경 변수 함수 복원
  Deno.env.get = originalEnv;
});

