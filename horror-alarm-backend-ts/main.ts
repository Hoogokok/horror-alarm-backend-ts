import { Hono } from 'hono'
import { getReleasedResponse, getUpcomingResponse } from './movieService.ts'
import { getExpiringResponse, getNetflixDetailResponse } from './netflixService.ts'
import { cors } from 'hono/cors'

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

app.get('/api/streaming/expired/detail/:id', async (c) => {
  const id = c.req.param('id')
  return c.json(await getNetflixDetailResponse(id))
})

Deno.serve(app.fetch)
