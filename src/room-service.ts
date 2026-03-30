import type { RoomQuery, PositionUpdate, PlayersQuery, PlayersResponse, UpdateResponse } from './protocol'
import { createRoomId } from './protocol'

export type Bindings = {
  ROOMS: DurableObjectNamespace
}

export function getRoomId(input: RoomQuery | PlayersQuery | PositionUpdate): string {
  return createRoomId(input.serverKey, input.serverIp)
}

export function getRoomStub(bindings: Bindings, roomId: string): DurableObjectStub {
  return bindings.ROOMS.get(bindings.ROOMS.idFromName(roomId))
}

export async function forwardUpdate(bindings: Bindings, payload: PositionUpdate): Promise<UpdateResponse> {
  const roomId = getRoomId(payload)
  const response = await getRoomStub(bindings, roomId).fetch('https://room.internal/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Grender-Room-Id': roomId
    },
    body: JSON.stringify(payload)
  })

  return (await response.json()) as UpdateResponse
}

export async function forwardPlayers(bindings: Bindings, query: PlayersQuery): Promise<PlayersResponse> {
  const roomId = getRoomId(query)
  const url = new URL('https://room.internal/players')
  url.searchParams.set('includeStale', String(query.includeStale))
  const response = await getRoomStub(bindings, roomId).fetch(url.toString(), {
    headers: {
      'X-Grender-Room-Id': roomId
    }
  })
  return (await response.json()) as PlayersResponse
}

export async function forwardWebSocket(bindings: Bindings, query: RoomQuery, request: Request): Promise<Response> {
  const roomId = getRoomId(query)
  const url = new URL('https://room.internal/ws')
  const headers = new Headers(request.headers)
  headers.set('X-Grender-Room-Id', roomId)
  return getRoomStub(bindings, roomId).fetch(url.toString(), {
    method: request.method,
    headers,
    body: request.body
  })
}
