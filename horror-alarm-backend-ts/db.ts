import postgres from 'https://deno.land/x/postgresjs/mod.js'
const url = Deno.env.get('POSTGRES_URL')
if (!url) {
    throw new Error('POSTGRES_URL 가 설정되지 않았습니다.');
}
export const sql = postgres(url, {
    user: Deno.env.get('POSTGRES_USER'),
    database: Deno.env.get('POSTGRES_DB'),
    hostname: Deno.env.get('POSTGRES_HOST'),
    password: Deno.env.get('POSTGRES_PASSWORD'),
    port: parseInt(Deno.env.get('POSTGRES_PORT') || '5432')
})
