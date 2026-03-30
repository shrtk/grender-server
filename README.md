# Grender-Server

`grender-server` is a Cloudflare Workers backend for `grender-client`.
It receives position updates from the Fabric client mod, stores the latest player state per room in a Durable Object, returns room snapshots to clients, and serves a browser viewer for live inspection.

The repository is intended to be published at:

- [Grender-Server](https://github.com/shrtk/grender-server)

## License

This project is licensed under the GNU General Public License v3.0 or later.
See `LICENSE` for the full text.

The paired client project uses ideas and integration techniques derived from MapLink:

- [MapLink](https://github.com/thebuildcraft/MapLink)

## Stack

- Cloudflare Workers
- Hono
- Durable Objects
- TypeScript
- Zod

## Related Mods

`grender-server` is designed to work with `grender-client`, which targets:

- [Fabric API](https://modrinth.com/mod/fabric-api)
- [YACL](https://modrinth.com/mod/yacl)

Optional client-side mods:

- [Mod Menu](https://modrinth.com/mod/modmenu)
- [Xaero's Minimap](https://www.curseforge.com/minecraft/mc-mods/xaeros-minimap)
- [Xaero's World Map](https://www.curseforge.com/minecraft/mc-mods/xaeros-world-map)

## Room Specification

Rooms are derived from:

```txt
roomId = serverKey.trim() + "::" + normalize(serverIp)
normalize(serverIp) = serverIp.trim().toLowerCase().replace(/\.+$/, "")
```

Important notes:

- room identity is based on `serverKey + normalizedServerIp`
- rooms are not split by dimension
- dimension stays inside each `PlayerState`

The shared protocol and room helpers live in `src/protocol.ts`.

## Current Behavior

- keeps only the latest state per player UUID
- excludes the caller from `/api/update` responses
- prunes stale players before list, update, websocket snapshot, and broadcast
- ignores extremely old client timestamps
- serves a built-in browser viewer at `/viewer`
- proxies and caches player head images from MineSkin through `/api/avatar/:identifier`

Current stale timeout:

```txt
90 seconds
```

## API

### `POST /api/update`

Stores one player update and returns other players in the same room.

Request body:

```json
{
  "protocolVersion": 1,
  "modVersion": "1.0.0",
  "serverKey": "shared-room",
  "serverIp": "example.net",
  "dimension": "minecraft:overworld",
  "playerUuid": "00000000-0000-0000-0000-000000000000",
  "playerName": "Player",
  "x": 123.4,
  "y": 64,
  "z": -55.2,
  "yaw": 180,
  "pitch": 15,
  "timestamp": 1767225600000
}
```

Success response:

```json
{
  "ok": true,
  "roomId": "shared-room::example.net",
  "serverTime": 1767225601000,
  "players": [
    {
      "uuid": "11111111-1111-1111-1111-111111111111",
      "playerName": "OtherPlayer",
      "serverIp": "example.net",
      "dimension": "minecraft:overworld",
      "x": 10,
      "y": 64,
      "z": 20,
      "yaw": 90,
      "pitch": 0,
      "updatedAt": 1767225600000
    }
  ]
}
```

Behavior:

- request validation is handled with Zod
- stale players are pruned before response generation
- the caller is excluded from the returned `players`
- timestamps older than the allowed max age are ignored

### `GET /api/players`

Returns the current room snapshot.

Query parameters:

- `serverKey` required
- `serverIp` required
- `includeStale` optional, defaults to `false`

Success response:

```json
{
  "ok": true,
  "roomId": "shared-room::example.net",
  "normalizedServerIp": "example.net",
  "includeStale": false,
  "serverTime": 1767225601000,
  "players": []
}
```

### `GET /ws`

WebSocket endpoint for the browser viewer.

Query parameters:

- `serverKey` required
- `serverIp` required

Behavior:

- sends a full snapshot immediately on connect
- broadcasts a new snapshot after accepted updates
- snapshots only include non-stale players

Snapshot payload:

```json
{
  "type": "snapshot",
  "roomId": "shared-room::example.net",
  "serverTime": 1767225601000,
  "players": []
}
```

### `GET /api/avatar/:identifier`

Fetches a player head image through the Worker and caches it.

Behavior:

- proxies `https://mineskin.eu/helm/:identifier/80.png`
- adds a server-side `User-Agent`
- stores the result in Cloudflare cache
- is used by the viewer so browser-side image requests stay stable

## Viewer

Open:

```txt
/viewer?serverKey=...&serverIp=...
```

Current viewer behavior:

- full-screen x/z map plus fixed player roster
- dimension switching in the top utility row
- draggable map with wheel zoom
- player clicks in the roster re-center the map on that player
- active dimension is the map focus
- other-dimension players stay visible in the roster
- roster order is fixed using `0-9`, `_`, `A-Z`

The viewer fetches `/api/players` first, then connects to `/ws`.

## Error Format

All API errors use:

```json
{
  "ok": false,
  "error": "..."
}
```

Validation errors return `400`.
Internal errors return `500`.

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Useful local URLs:

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/viewer?serverKey=test&serverIp=localhost`
- `http://127.0.0.1:8787/api/players?serverKey=test&serverIp=localhost`

Type-check:

```bash
npm run check
```

## Deploy

Deploy:

```bash
npm run deploy
```

Dry run:

```bash
npm run deploy -- --dry-run
```

## Project Layout

- app entry: `src/index.ts`
- durable object: `src/room-do.ts`
- routing helpers: `src/room-service.ts`
- shared protocol: `src/protocol.ts`
- browser viewer: `src/viewer.ts`

## Scope

Current scope is intentionally limited to latest-position sharing and a debug/live viewer.

Not included yet:

- authentication
- history storage
- path trails
- terrain tiles
- production access control
