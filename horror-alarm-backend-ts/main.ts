import { Hono } from 'hono'
import { getReleasedResponse, getUpcomingResponse } from './movieService.ts'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.get('/api/releasing', async (c) => {
  return c.json(await getReleasedResponse())
})

app.get('/api/upcoming', async (c) => {
  return c.json(await getUpcomingResponse())
})

Deno.serve(app.fetch)
