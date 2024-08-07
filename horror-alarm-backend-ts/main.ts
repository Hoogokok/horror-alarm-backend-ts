import { Hono } from 'hono'
import { getReleasedResponse, getUpcomingResponse } from './movieService.ts'
import { getExpiringResponse, getNetflixDetailResponse } from './netflixService.ts'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.get('/api/releasing', async (c) => {
  return c.json(await getReleasedResponse())
})

app.get('/api/upcoming', async (c) => {
  return c.json(await getUpcomingResponse())
})

app.get('/api/streaming/expired', async (c) => {
  return c.json({ expiredMovies: await getExpiringResponse() })
})

Deno.serve(app.fetch)
