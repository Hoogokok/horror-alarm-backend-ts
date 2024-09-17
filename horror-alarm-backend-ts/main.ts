import { Hono } from 'hono'
import { getReleasedResponse, getUpcomingResponse, getMovieDetailResponse } from './movieService.ts'
import { getExpiringResponse, getNetflixDetailResponse, getStreamingMoives, getTotalPage } from './streamingService.ts'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(cors({
  origin: ['http://localhost:3000', Deno.env.get('FRONTEND_URL')],
  methods: ['GET'],
  headers: ['Content-Type', 'Authorization', 'X-Requested-With', "X-Custom-Header"],
  credentials: true,
  maxAge: 86400,
}))

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

app.get('/api/streaming', async (c) => {
  const query = c.req.query('query')
  return c.json(await getTotalPage(query))
})

app.get('/api/streaming/page', async (c) => {
  const query = c.req.query('query')
  const page = c.req.query('page')
  return c.json(await getStreamingMoives(query, page))
})

app.get('/api/movie/:id', async (c) => {
  const id = c.req.param('id')
  const category = c.req.query('category')
  if (category === 'streaming') {
    return c.json(await getNetflixDetailResponse(id))
  }
  return c.json(await getMovieDetailResponse(id))
})


Deno.serve(app.fetch)
