import type { PlayerState, PlayersResponse, PositionUpdate, UpdateResponse, WebSocketMessage } from './protocol'
import {
  createPlayerState,
  createSnapshotMessage,
  DEFAULT_STALE_TIMEOUT_MS,
  isTimestampTooOld,
  parseRoomId
} from './protocol'

export class RoomDurableObject implements DurableObject {
  private readonly ctx: DurableObjectState
  private players = new Map<string, PlayerState>()
  private hydrated = false
  private roomId = ''

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx
  }

  async fetch(request: Request): Promise<Response> {
    await this.ensureHydrated()
    this.assignRoomId(request)

    const url = new URL(request.url)
    if (url.pathname === '/update' && request.method === 'POST') {
      const payload = (await request.json()) as PositionUpdate
      return Response.json(await this.handleUpdateRequest(payload))
    }

    if (url.pathname === '/players' && request.method === 'GET') {
      const includeStale = url.searchParams.get('includeStale') === 'true'
      return Response.json(await this.handlePlayersRequest(includeStale))
    }

    if (url.pathname === '/ws' && request.method === 'GET') {
      return this.handleWebSocketRequest()
    }

    return Response.json({ ok: false, error: 'Route not found' }, { status: 404 })
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (message === 'ping') {
      socket.send('pong')
    }
  }

  async webSocketClose(socket: WebSocket): Promise<void> {
    socket.close(1000, 'closed')
  }

  private async handleUpdateRequest(payload: PositionUpdate): Promise<UpdateResponse> {
    const serverTime = Date.now()
    await this.pruneStalePlayers(serverTime)

    if (!isTimestampTooOld(payload.timestamp, serverTime)) {
      await this.storePlayerState(createPlayerState(payload, serverTime))
    }

    await this.pruneStalePlayers(serverTime)
    await this.broadcastSnapshot(serverTime)

    return {
      ok: true,
      roomId: this.getRoomId(),
      serverTime,
      players: this.listPlayers({ includeStale: false, excludeUuid: payload.playerUuid })
    }
  }

  private async handlePlayersRequest(includeStale: boolean): Promise<PlayersResponse> {
    const serverTime = Date.now()
    await this.pruneStalePlayers(serverTime)

    const players = this.listPlayers({ includeStale, excludeUuid: undefined })
    return {
      ok: true,
      roomId: this.getRoomId(),
      normalizedServerIp: parseRoomId(this.getRoomId()).normalizedServerIp,
      includeStale,
      serverTime,
      players
    }
  }

  private async handleWebSocketRequest(): Promise<Response> {
    const serverTime = Date.now()
    await this.pruneStalePlayers(serverTime)

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.ctx.acceptWebSocket(server)
    server.send(JSON.stringify(this.createSnapshotPayload(serverTime)))
    return new Response(null, { status: 101, webSocket: client })
  }

  private async ensureHydrated(): Promise<void> {
    if (this.hydrated) {
      return
    }

    const storedPlayers = await this.ctx.storage.list<PlayerState>()
    this.players = new Map(storedPlayers)
    this.hydrated = true
    await this.pruneStalePlayers(Date.now())
  }

  private async storePlayerState(player: PlayerState): Promise<void> {
    this.players.set(player.uuid, player)
    await this.ctx.storage.put(player.uuid, player)
  }

  private listPlayers(options: { includeStale: boolean; excludeUuid?: string }): PlayerState[] {
    const staleThreshold = Date.now() - DEFAULT_STALE_TIMEOUT_MS
    return [...this.players.values()]
      .filter((player) => options.includeStale || player.updatedAt >= staleThreshold)
      .filter((player) => !options.excludeUuid || player.uuid !== options.excludeUuid)
      .sort((left, right) => left.playerName.localeCompare(right.playerName))
  }

  private async pruneStalePlayers(serverTime: number): Promise<void> {
    const staleBefore = serverTime - DEFAULT_STALE_TIMEOUT_MS
    const staleKeys: string[] = []

    for (const [uuid, player] of this.players.entries()) {
      if (player.updatedAt < staleBefore) {
        staleKeys.push(uuid)
      }
    }

    if (staleKeys.length === 0) {
      return
    }

    for (const key of staleKeys) {
      this.players.delete(key)
    }
    await this.ctx.storage.delete(staleKeys)
  }

  private async broadcastSnapshot(serverTime: number): Promise<void> {
    await this.pruneStalePlayers(serverTime)
    const payload = JSON.stringify(this.createSnapshotPayload(serverTime))

    for (const socket of this.ctx.getWebSockets()) {
      socket.send(payload)
    }
  }

  private createSnapshotPayload(serverTime: number): WebSocketMessage {
    return createSnapshotMessage(this.getRoomId(), this.listPlayers({ includeStale: false }), serverTime)
  }

  private getRoomId(): string {
    return this.roomId
  }

  private assignRoomId(request: Request): void {
    const headerValue = request.headers.get('X-Grender-Room-Id')
    if (headerValue && !this.roomId) {
      this.roomId = headerValue
    }
  }
}
