import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import type { ErrorResponse } from './protocol'
import { roomQuerySchema, playersQuerySchema, positionUpdateSchema, PROTOCOL_VERSION } from './protocol'
import { forwardPlayers, forwardUpdate, forwardWebSocket, type Bindings } from './room-service'
import { RoomDurableObject } from './room-do'
import { renderViewerPage } from './viewer'

export { RoomDurableObject }

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type']
  })
)

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'grender-server',
    protocolVersion: PROTOCOL_VERSION,
    viewerPath: '/viewer'
  })
)

app.get('/viewer', (c) => {
  const defaultServerKey = c.req.query('serverKey') ?? ''
  const defaultServerIp = c.req.query('serverIp') ?? ''
  return c.html(
    renderViewerPage({
      protocolVersion: PROTOCOL_VERSION,
      defaultServerKey,
      defaultServerIp
    })
  )
})

app.get('/api/avatar/:identifier', async (c) => {
  const identifier = (c.req.param('identifier') ?? '').trim()
  if (!identifier) {
    throw new HTTPException(400, { message: 'Avatar identifier is required' })
  }

  const targetUrl = new URL(`https://mineskin.eu/helm/${encodeURIComponent(identifier)}/80.png`)
  const cache = caches.default
  const cacheKey = new Request(targetUrl.toString(), { method: 'GET' })
  const cached = await cache.match(cacheKey)
  if (cached) {
    return new Response(cached.body, cached)
  }

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': `grender-server/${PROTOCOL_VERSION} (+https://grender.viewer)`
    }
  })

  if (!response.ok) {
    throw new HTTPException(response.status === 404 ? 404 : 502, { message: 'Avatar fetch failed' })
  }

  const proxied = new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Access-Control-Allow-Origin': '*'
    }
  })
  c.executionCtx.waitUntil(cache.put(cacheKey, proxied.clone()))
  return proxied
})

app.post('/api/update', async (c) => {
  const payload = positionUpdateSchema.parse(await c.req.json())
  return c.json(await forwardUpdate(c.env, payload))
})

app.get('/api/players', async (c) => {
  const query = playersQuerySchema.parse({
    serverKey: c.req.query('serverKey'),
    serverIp: c.req.query('serverIp'),
    includeStale: c.req.query('includeStale')
  })
  return c.json(await forwardPlayers(c.env, query))
})

app.get('/ws', async (c) => {
  const query = roomQuerySchema.parse({
    serverKey: c.req.query('serverKey'),
    serverIp: c.req.query('serverIp')
  })
  return forwardWebSocket(c.env, query, c.req.raw)
})

app.all('*', () => {
  throw new HTTPException(404, { message: 'Route not found' })
})

function createErrorResponse(error: string, details?: unknown): ErrorResponse {
  return details === undefined ? { ok: false, error } : { ok: false, error, details }
}

app.onError((error, c) => {
  if (error instanceof z.ZodError) {
    return c.json(createErrorResponse('Validation error', error.issues), 400)
  }

  if (error instanceof HTTPException) {
    return c.json(createErrorResponse(error.message), error.status)
  }

  console.error(error)
  return c.json(createErrorResponse('Internal server error'), 500)
})

export default app
