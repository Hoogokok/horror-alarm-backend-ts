import postgres from 'https://deno.land/x/postgresjs/mod.js'

let sqlInstance: ReturnType<typeof postgres> | null = null;
let mockSql: ((...args: any[]) => Promise<any>) | null = null;

export function getSql() {
  if (mockSql) return mockSql;
  if (sqlInstance) return sqlInstance;

  const postgresUrl = Deno.env.get('POSTGRES_URL');

  if (!postgresUrl) {
    throw new Error('POSTGRES_URL 가 설정되지 않았습니다.');
  }

  sqlInstance = postgres(postgresUrl, {
    user: Deno.env.get('POSTGRES_USER') ?? 'default',
    database: Deno.env.get('POSTGRES_DB') ?? 'defaultdb',
    hostname: Deno.env.get('POSTGRES_HOST') ?? 'localhost',
    password: Deno.env.get('POSTGRES_PASSWORD') ?? 'default',
    port: parseInt(Deno.env.get('POSTGRES_PORT') ?? '5432')
  });

  return sqlInstance;
}

export const sql = (...args: Parameters<ReturnType<typeof postgres>>) => {
  const result = getSql()(...args);
  if (result instanceof Promise) {
    return result;
  }
  return Promise.resolve(result);
};

// 테스트용 함수 추가
export function setMockSql(mock: (...args: any[]) => Promise<any>) {
  mockSql = mock;
}

export function clearMockSql() {
  mockSql = null;
}
