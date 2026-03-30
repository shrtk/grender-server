import { z } from 'zod'

export const PROTOCOL_VERSION = 1
export const DEFAULT_STALE_TIMEOUT_MS = 90_000
export const MAX_CLIENT_TIMESTAMP_AGE_MS = 5 * 60_000
export const ROOM_ID_SEPARATOR = '::'

const trimmedString = z.string().trim()
const requiredString = trimmedString.min(1)

export function normalizeServerIp(serverIp: string): string {
  return serverIp.trim().toLowerCase().replace(/\.+$/, '')
}

export function normalizeServerKey(serverKey: string): string {
  return serverKey.trim()
}

export function createRoomId(serverKey: string, serverIp: string): string {
  return `${normalizeServerKey(serverKey)}${ROOM_ID_SEPARATOR}${normalizeServerIp(serverIp)}`
}

export function parseRoomId(roomId: string): { serverKey: string; normalizedServerIp: string } {
  const separatorIndex = roomId.indexOf(ROOM_ID_SEPARATOR)
  if (separatorIndex === -1) {
    return { serverKey: roomId, normalizedServerIp: '' }
  }

  return {
    serverKey: roomId.slice(0, separatorIndex),
    normalizedServerIp: roomId.slice(separatorIndex + ROOM_ID_SEPARATOR.length)
  }
}

export function isTimestampTooOld(timestamp: number, now = Date.now()): boolean {
  return timestamp < now - MAX_CLIENT_TIMESTAMP_AGE_MS
}

export const positionUpdateSchema = z.object({
  protocolVersion: z.number().int().positive(),
  modVersion: requiredString.max(64),
  serverKey: requiredString.max(128).transform(normalizeServerKey),
  serverIp: requiredString.max(255).transform(normalizeServerIp),
  dimension: requiredString.max(255),
  playerUuid: z.string().uuid(),
  playerName: requiredString.max(32),
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
  yaw: z.number().finite(),
  pitch: z.number().finite(),
  timestamp: z.number().int().nonnegative()
})

export const roomQuerySchema = z.object({
  serverKey: requiredString.max(128).transform(normalizeServerKey),
  serverIp: requiredString.max(255).transform(normalizeServerIp)
})

export const playersQuerySchema = roomQuerySchema.extend({
  includeStale: z
    .union([z.string(), z.boolean(), z.undefined()])
    .transform((value) => value === true || value === 'true')
    .default(false)
})

export type PositionUpdate = z.infer<typeof positionUpdateSchema>
export type RoomQuery = z.infer<typeof roomQuerySchema>
export type PlayersQuery = z.infer<typeof playersQuerySchema>

export interface PlayerState {
  uuid: string
  playerName: string
  serverIp: string
  dimension: string
  x: number
  y: number
  z: number
  yaw: number
  pitch: number
  updatedAt: number
}

export interface ErrorResponse {
  ok: false
  error: string
  details?: unknown
}

export interface UpdateResponse {
  ok: true
  roomId: string
  serverTime: number
  players: PlayerState[]
}

export interface PlayersResponse {
  ok: true
  roomId: string
  normalizedServerIp: string
  includeStale: boolean
  serverTime: number
  players: PlayerState[]
}

export interface ViewerBootstrap {
  protocolVersion: number
  defaultServerKey: string
  defaultServerIp: string
}

export interface WebSocketSnapshotMessage {
  type: 'snapshot'
  roomId: string
  serverTime: number
  players: PlayerState[]
}

export type WebSocketMessage = WebSocketSnapshotMessage

export function createPlayerState(update: PositionUpdate, serverTime: number): PlayerState {
  return {
    uuid: update.playerUuid,
    playerName: update.playerName,
    serverIp: update.serverIp,
    dimension: update.dimension,
    x: update.x,
    y: update.y,
    z: update.z,
    yaw: update.yaw,
    pitch: update.pitch,
    updatedAt: serverTime
  }
}

export function createSnapshotMessage(roomId: string, players: PlayerState[], serverTime: number): WebSocketSnapshotMessage {
  return {
    type: 'snapshot',
    roomId,
    serverTime,
    players
  }
}
