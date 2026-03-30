
import type { ViewerBootstrap } from './protocol'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderViewerPage(bootstrap: ViewerBootstrap): string {
  const serverKey = escapeHtml(bootstrap.defaultServerKey)
  const serverIp = escapeHtml(bootstrap.defaultServerIp)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Grender Viewer</title>
  <style>
    :root {
      color-scheme: dark;
      --page: #111416;
      --panel: #ebe6dc;
      --panel-border: #d3cabc;
      --ink: #1a1e21;
      --muted: #6e746d;
      --soft: #8b9188;
      --brand: #2f6f7c;
      --brand-soft: #dbe8eb;
      --ok: #2d8f63;
      --warn: #b86f1c;
      --danger: #a64739;
      --line: rgba(26, 30, 33, 0.12);
      --line-strong: rgba(26, 30, 33, 0.22);
      --surface: rgba(255, 255, 255, 0.56);
    }
    * {
      box-sizing: border-box;
    }
    html,
    body {
      height: 100%;
      overflow: hidden;
    }
    body {
      margin: 0;
      min-height: 100%;
      font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      background: var(--page);
      color: var(--ink);
    }
    button,
    input {
      font: inherit;
    }
    .shell {
      height: 100vh;
    }
    .workspace {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
    .setup-screen,
    .viewer-screen {
      min-height: calc(100vh - 72px);
    }
    .setup-screen {
      display: grid;
      place-items: center;
      padding: 24px;
      background: var(--page);
    }
    .setup-card {
      width: min(760px, 100%);
      display: grid;
      gap: 20px;
      padding: 28px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.03);
    }
    .setup-card h2 {
      margin: 0;
      color: #f3f6f7;
      font-size: 32px;
      line-height: 1.05;
    }
    .setup-card p {
      margin: 0;
      color: #a4b1b5;
      font-size: 14px;
      line-height: 1.6;
    }
    .setup-form {
      display: grid;
      gap: 12px;
    }
    .setup-grid {
      display: grid;
      grid-template-columns: minmax(180px, 220px) minmax(240px, 1fr);
      gap: 12px;
    }
    .brand {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: #d8e3e6;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .brand h1 {
      margin: 0;
      color: #f3f6f7;
      font-size: clamp(28px, 3.4vw, 42px);
      line-height: 1;
      font-weight: 700;
    }
    .brand p {
      margin: 0;
      max-width: 34rem;
      color: #a4b1b5;
      font-size: 14px;
      line-height: 1.55;
    }
    .surface {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.035);
      padding: 14px;
    }
    .connect-panel {
      display: grid;
      gap: 12px;
    }
    .connect-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }
    .connect-header strong {
      color: #f3f6f7;
      font-size: 14px;
      font-weight: 600;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: #dce8ea;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-badge::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--warn);
      box-shadow: 0 0 0 3px rgba(184, 111, 28, 0.16);
    }
    .status-badge[data-state="connected"]::before {
      background: var(--ok);
      box-shadow: 0 0 0 3px rgba(45, 143, 99, 0.18);
    }
    .status-badge[data-state="loading"]::before {
      background: var(--brand);
      box-shadow: 0 0 0 3px rgba(51, 111, 127, 0.18);
    }
    .status-badge[data-state="error"]::before {
      background: var(--danger);
      box-shadow: 0 0 0 3px rgba(166, 71, 57, 0.18);
    }
    .connect-form {
      display: grid;
      grid-template-columns: minmax(160px, 220px) minmax(220px, 1fr) auto auto;
      gap: 10px;
      align-items: end;
    }
    .field {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    .field span {
      font-size: 12px;
      color: #a7b1b5;
      font-weight: 500;
    }
    .field input {
      width: 100%;
      min-width: 0;
      height: 44px;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(10, 13, 15, 0.34);
      color: #f0f4f4;
    }
    .field input:focus {
      outline: 2px solid rgba(101, 171, 192, 0.48);
      outline-offset: 1px;
    }
    .button {
      height: 40px;
      border: 0;
      border-radius: 8px;
      padding: 0 16px;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .button--primary {
      background: linear-gradient(180deg, #4e94a7 0%, #2b6f80 100%);
      color: white;
    }
    .button--ghost {
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .button--ghost strong {
      font-weight: 700;
    }
    .map-shell {
      position: relative;
      height: 100vh;
      background: var(--panel);
      padding-right: 342px;
      overflow: hidden;
    }
    .map-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 10px 14px;
      margin-right: 0;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.18);
    }
    .map-meta {
      display: grid;
      gap: 12px;
      min-width: 0;
    }
    .map-summary {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      min-width: 0;
    }
    .map-summary h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
    }
    .meta-line {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      min-width: 0;
      font-size: 13px;
      color: var(--muted);
    }
    .viewport-strip {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      padding: 8px 14px;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.08);
      color: var(--muted);
      font-size: 12px;
    }
    .viewport-strip strong {
      color: var(--ink);
      font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
      font-size: 12px;
      font-weight: 600;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      border-radius: 0;
      border: 0;
      background: transparent;
      color: var(--ink);
      font-size: 12px;
      font-weight: 500;
    }
    .pill b {
      font-weight: 700;
    }
    .dimension-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .dimension-tab {
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.42);
      color: var(--ink);
      border-radius: 8px;
      padding: 7px 10px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .dimension-tab[data-active="true"] {
      border-color: var(--brand);
      background: var(--brand);
      color: #f5fafb;
    }
    .dimension-tab small {
      display: inline-block;
      min-width: 22px;
      padding: 2px 6px;
      border-radius: 999px;
      background: rgba(26, 30, 33, 0.08);
      color: inherit;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
    }
    .map-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .zoom-readout {
      min-width: 70px;
      justify-content: center;
    }
    .map-stage {
      position: relative;
      height: calc(100vh - 64px);
      background: var(--panel);
      touch-action: none;
      cursor: grab;
      user-select: none;
    }
    .map-stage[data-dragging="true"] {
      cursor: grabbing;
    }
    .map-canvas,
    .markers {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .map-canvas {
      display: block;
    }
    .markers {
      pointer-events: none;
    }
    .player-token {
      position: absolute;
      transform: translate(-50%, -50%);
      display: grid;
      gap: 8px;
      justify-items: center;
      pointer-events: auto;
      z-index: 2;
      background: transparent;
      border: 0;
      padding: 0;
    }
    .player-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      max-width: min(240px, 28vw);
      padding: 6px 8px 6px 6px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.9);
      color: var(--ink);
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }
    .avatar {
      flex: 0 0 auto;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #d9e7ec;
      border: 1px solid var(--line);
      overflow: hidden;
      display: grid;
      place-items: center;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .avatar-fallback {
      font-size: 11px;
      font-weight: 800;
      color: #2f3b43;
      text-transform: uppercase;
    }
    .player-text {
      min-width: 0;
      display: grid;
      gap: 3px;
      align-items: center;
    }
    .player-text strong,
    .roster-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .player-text strong {
      font-size: 12px;
      font-weight: 700;
    }
    .player-text span,
    .roster-meta {
      color: var(--muted);
      font-size: 11px;
      font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
    }
    .roster-meta + .roster-meta {
      margin-top: 2px;
    }
    .roster-dimension {
      text-transform: none;
    }
    .roster-time {
      opacity: 0.9;
    }
    .marker-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.92);
      background: currentColor;
    }
    .map-overlay {
      position: absolute;
      display: grid;
      gap: 8px;
      z-index: 3;
      pointer-events: none;
    }
    .map-overlay--bottom-right {
      right: 16px;
      bottom: 16px;
      justify-items: end;
      max-width: min(260px, calc(100% - 32px));
    }
    .overlay-card {
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid rgba(32, 38, 45, 0.1);
      background: rgba(250, 248, 242, 0.9);
      box-shadow: 0 10px 24px rgba(32, 38, 45, 0.12);
      color: var(--ink);
    }
    .overlay-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--soft);
    }
    .overlay-value {
      margin-top: 4px;
      font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
      word-break: break-word;
    }
    .overlay-subtle {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
    }
    .empty-state {
      position: absolute;
      inset: 50% auto auto 50%;
      transform: translate(-50%, -50%);
      width: min(420px, calc(100% - 32px));
      padding: 18px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.92);
      z-index: 4;
    }
    .empty-state strong {
      display: block;
      font-size: 15px;
      margin-bottom: 6px;
    }
    .empty-state p,
    .drawer-meta p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }
    .roster-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 320px;
      border-radius: 0;
      border-top: 0;
      border-right: 0;
      border-bottom: 0;
      border-left: 1px solid var(--line-strong);
      background: #f1ecdf;
      z-index: 10;
      display: grid;
      grid-template-rows: auto auto 1fr;
      overflow: hidden;
    }
    .drawer-header,
    .drawer-meta {
      padding: 16px 18px;
      border-bottom: 1px solid var(--line);
    }
    .drawer-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }
    .drawer-header h3 {
      margin: 0;
      font-size: 18px;
      color: var(--ink);
    }
    .drawer-meta {
      display: grid;
      gap: 8px;
      background: rgba(255, 255, 255, 0.12);
    }
    .roster-list {
      overflow: auto;
      padding: 14px 18px 18px;
      display: grid;
      gap: 10px;
      align-content: start;
    }
    .roster-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      width: 100%;
      text-align: left;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
    }
    .roster-card:hover {
      border-color: var(--line);
      background: rgba(255, 255, 255, 0.36);
    }
    .roster-card--muted {
      opacity: 0.56;
    }
    .roster-card--active {
      border-color: rgba(47, 111, 124, 0.28);
      background: rgba(255, 255, 255, 0.52);
      box-shadow: inset 3px 0 0 var(--brand);
    }
    .roster-name {
      color: #11181e;
    }
    .roster-card .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }
    .roster-body {
      min-width: 0;
      display: grid;
      gap: 5px;
    }
    .hidden {
      display: none !important;
    }
    .truncate {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (max-width: 1080px) {
      .setup-grid,
      .map-header,
      .connect-form {
        grid-template-columns: 1fr;
      }
      .map-actions {
        justify-content: flex-start;
      }
      .player-chip {
        max-width: min(220px, 62vw);
      }
      .map-shell {
        padding-right: 0;
        height: 100vh;
      }
      .roster-panel {
        position: relative;
        top: auto;
        right: auto;
        bottom: auto;
        width: auto;
        border-top: 1px solid rgba(32, 38, 45, 0.08);
        border-left: 0;
        border-right: 0;
        border-bottom: 0;
        border-radius: 0;
        box-shadow: none;
      }
    }
    @media (max-width: 720px) {
      .shell {
        padding: 12px;
      }
      .workspace {
        min-height: calc(100vh - 24px);
        padding: 12px;
        border-radius: 20px;
      }
      .map-stage {
        min-height: 56vh;
      }
      .map-overlay--bottom-right {
        left: 16px;
        right: 16px;
        justify-items: stretch;
      }
      .roster-panel {
        max-height: 42vh;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="workspace">
      <section id="setupScreen" class="setup-screen">
        <div class="setup-card">
          <div class="eyebrow">Room Connection</div>
          <h2>Connect to a live room</h2>
          <p>Enter the shared room information first. After the snapshot loads, the map screen opens with live player positions and the cross-dimension roster.</p>
          <form id="room-form" class="setup-form">
            <div class="setup-grid">
              <label class="field">
                <span>Server key</span>
                <input id="serverKey" name="serverKey" value="${serverKey}" placeholder="shared-room-key" required />
              </label>
              <label class="field">
                <span>Server IP</span>
                <input id="serverIp" name="serverIp" value="${serverIp}" placeholder="example.net:25565" required />
              </label>
            </div>
            <button type="submit" class="button button--primary">Open map</button>
          </form>
          <div id="status" class="status-badge" data-state="idle">Disconnected</div>
        </div>
      </section>
      <section id="viewerScreen" class="viewer-screen hidden">
      <section class="map-shell">
        <div class="map-header">
          <div class="map-meta">
            <div class="map-summary">
              <h2 id="mapHeading">Overworld</h2>
              <div class="pill"><b id="visibleCount">0</b> visible</div>
              <div class="pill"><b id="totalCount">0</b> total</div>
            </div>
            <div class="meta-line">
              <span class="truncate" id="roomIdPill">room unavailable</span>
              <span id="updatedAtPill">updated -</span>
            </div>
          </div>
          <div class="map-actions">
            <button type="button" id="fitViewButton" class="button button--ghost">Fit view</button>
            <div id="zoomReadout" class="pill zoom-readout">100%</div>
            <div id="dimensionTabs" class="dimension-tabs"></div>
          </div>
        </div>
        <div class="map-stage" id="mapStage">
          <canvas id="mapCanvas" class="map-canvas" width="1600" height="1000"></canvas>
          <div id="markers" class="markers"></div>
          <div id="emptyState" class="empty-state hidden">
            <strong>No players in this dimension</strong>
            <p id="emptyMessage">Connect a room or switch to another dimension to inspect the latest snapshot.</p>
          </div>
        </div>
        <div class="viewport-strip">
          <span>Viewport</span>
          <strong id="viewportValue">x 0..0 | z 0..0</strong>
          <span id="viewportHint">Grid auto-fits to the active dimension.</span>
        </div>
        <aside id="rosterPanel" class="roster-panel" aria-hidden="true">
          <div class="drawer-header">
            <h3>Players</h3>
          </div>
          <div class="drawer-meta">
            <p id="drawerSummary">No active room.</p>
            <p id="drawerDimensionSummary">Click a player to center the map on them.</p>
          </div>
          <div id="rosterList" class="roster-list"></div>
        </aside>
      </section>
      </section>
    </div>
  </div>
  <script>
    const CANONICAL_DIMENSIONS = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end'];
    const DIMENSION_META = {
      'minecraft:overworld': { label: 'Overworld', accent: '#3d7f5f', soft: 'rgba(61, 127, 95, 0.16)' },
      'minecraft:the_nether': { label: 'Nether', accent: '#9f4f39', soft: 'rgba(159, 79, 57, 0.16)' },
      'minecraft:the_end': { label: 'The End', accent: '#6d5ca5', soft: 'rgba(109, 92, 165, 0.16)' }
    };
    const state = {
      socket: null,
      roomId: '',
      players: [],
      activeDimension: new URLSearchParams(window.location.search).get('dimension') || 'minecraft:overworld',
      lastUpdatedAt: null,
      cameras: {},
      interactionState: {},
      statusMode: 'idle',
      drag: null,
      avatarCache: {},
      avatarLoading: {},
      markerNodes: {},
      rosterNodes: {}
    };
    const form = document.getElementById('room-form');
    const setupScreen = document.getElementById('setupScreen');
    const viewerScreen = document.getElementById('viewerScreen');
    const serverKeyInput = document.getElementById('serverKey');
    const serverIpInput = document.getElementById('serverIp');
    const statusEl = document.getElementById('status');
    const rosterPanel = document.getElementById('rosterPanel');
    const visibleCountEl = document.getElementById('visibleCount');
    const totalCountEl = document.getElementById('totalCount');
    const roomIdPill = document.getElementById('roomIdPill');
    const updatedAtPill = document.getElementById('updatedAtPill');
    const mapHeading = document.getElementById('mapHeading');
    const dimensionTabs = document.getElementById('dimensionTabs');
    const fitViewButton = document.getElementById('fitViewButton');
    const zoomReadout = document.getElementById('zoomReadout');
    const rosterList = document.getElementById('rosterList');
    const drawerSummary = document.getElementById('drawerSummary');
    const drawerDimensionSummary = document.getElementById('drawerDimensionSummary');
    const viewportValue = document.getElementById('viewportValue');
    const viewportHint = document.getElementById('viewportHint');
    const emptyState = document.getElementById('emptyState');
    const emptyMessage = document.getElementById('emptyMessage');
    const markersEl = document.getElementById('markers');
    const canvas = document.getElementById('mapCanvas');
    const mapStage = document.getElementById('mapStage');
    const ctx = canvas.getContext('2d');
    function escapeInline(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    function simplifyDimensionName(dimension) {
      if (!dimension) return 'Unknown';
      const raw = String(dimension).split(':').pop() || String(dimension);
      return raw.replace(/[_-]+/g, ' ').replace(/\b\w/g, function (char) { return char.toUpperCase(); });
    }
    function formatDimensionLabel(dimension) {
      if (!dimension) return 'unknown';
      const raw = String(dimension).split(':').pop() || String(dimension);
      return raw.replace(/_/g, ' ');
    }
    function metaForDimension(dimension) {
      return DIMENSION_META[dimension] || { label: simplifyDimensionName(dimension), accent: '#69707a', soft: 'rgba(105, 112, 122, 0.16)' };
    }
    function formatTime(value) {
      return value ? new Date(value).toLocaleTimeString() : '-';
    }
    function formatCoord(value) {
      const rounded = Math.round(value);
      return Number.isFinite(rounded) ? rounded.toLocaleString() : '0';
    }
    function getAvatarCacheKey(player) {
      return player.uuid || player.playerName || 'default';
    }
    function getAvatarCandidates(player) {
      const playerName = player.playerName ? String(player.playerName) : '';
      const candidates = [];
      if (playerName) candidates.push('/api/avatar/' + encodeURIComponent(playerName));
      candidates.push('/api/avatar/MHF_Steve');
      return candidates;
    }
    function ensureAvatarLoaded(player) {
      const cacheKey = getAvatarCacheKey(player);
      if (state.avatarCache[cacheKey] || state.avatarLoading[cacheKey]) return;
      const candidates = getAvatarCandidates(player);
      let index = 0;
      state.avatarLoading[cacheKey] = true;
      function tryNext() {
        const image = new Image();
        image.decoding = 'async';
        image.loading = 'eager';
        image.onload = function () {
          state.avatarCache[cacheKey] = candidates[index];
          delete state.avatarLoading[cacheKey];
          render();
        };
        image.onerror = function () {
          index += 1;
          if (index >= candidates.length) {
            state.avatarCache[cacheKey] = candidates[candidates.length - 1];
            delete state.avatarLoading[cacheKey];
            render();
            return;
          }
          tryNext();
        };
        image.src = candidates[index];
      }
      tryNext();
    }
    function getAvatarUrl(player) {
      const cacheKey = getAvatarCacheKey(player);
      ensureAvatarLoaded(player);
      return state.avatarCache[cacheKey] || '';
    }
    function getInitials(name) {
      return String(name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) { return part[0]; }).join('').slice(0, 2).toUpperCase() || '?';
    }
    function setStatus(message, mode) {
      state.statusMode = mode || 'idle';
      statusEl.textContent = message;
      statusEl.dataset.state = state.statusMode;
    }
    function getDimensionCounts() {
      const counts = {};
      for (const player of state.players) {
        counts[player.dimension] = (counts[player.dimension] || 0) + 1;
      }
      return counts;
    }
    function getKnownDimensions() {
      const present = new Set(state.players.map(function (player) { return player.dimension; }));
      const ordered = CANONICAL_DIMENSIONS.slice();
      for (const dimension of Array.from(present).sort()) {
        if (!ordered.includes(dimension)) ordered.push(dimension);
      }
      return ordered;
    }
    function ensureActiveDimension() {
      const known = getKnownDimensions();
      const counts = getDimensionCounts();
      if (known.includes(state.activeDimension)) return;
      const firstWithPlayers = known.find(function (dimension) { return (counts[dimension] || 0) > 0; });
      state.activeDimension = firstWithPlayers || known[0] || 'minecraft:overworld';
    }
    function getFilteredPlayers() {
      return state.players.filter(function (player) { return player.dimension === state.activeDimension; });
    }
    function dedupePlayers(players) {
      const latestByUuid = new Map();
      for (const player of players || []) {
        const existing = latestByUuid.get(player.uuid);
        if (!existing || existing.updatedAt < player.updatedAt) latestByUuid.set(player.uuid, player);
      }
      return Array.from(latestByUuid.values());
    }
    function sortPlayers(players) {
      return players.slice().sort(function (left, right) {
        return comparePlayerNames(left.playerName, right.playerName) || left.uuid.localeCompare(right.uuid);
      });
    }
    function sortRosterPlayers(players) {
      return players.slice().sort(function (left, right) {
        return comparePlayerNames(left.playerName, right.playerName) || left.uuid.localeCompare(right.uuid);
      });
    }
    function rankNameCharacter(char) {
      if (!char) return 10_000;
      const code = char.charCodeAt(0);
      if (code >= 48 && code <= 57) return code - 48;
      if (char === '_') return 10;
      const upper = char.toUpperCase();
      const upperCode = upper.charCodeAt(0);
      if (upperCode >= 65 && upperCode <= 90) return 11 + (upperCode - 65);
      return 1_000 + code;
    }
    function comparePlayerNames(leftName, rightName) {
      const left = String(leftName || '');
      const right = String(rightName || '');
      const length = Math.max(left.length, right.length);
      for (let index = 0; index < length; index += 1) {
        const delta = rankNameCharacter(left[index]) - rankNameCharacter(right[index]);
        if (delta !== 0) return delta;
      }
      return left.length - right.length;
    }
    function showSetupScreen() {
      setupScreen.classList.remove('hidden');
      viewerScreen.classList.add('hidden');
    }
    function showViewerScreen() {
      setupScreen.classList.add('hidden');
      viewerScreen.classList.remove('hidden');
    }
    function syncViewerUrl() {
      const viewerUrl = new URL('/viewer', window.location.origin);
      const serverKey = serverKeyInput.value.trim();
      const serverIp = serverIpInput.value.trim();
      if (serverKey) viewerUrl.searchParams.set('serverKey', serverKey);
      if (serverIp) viewerUrl.searchParams.set('serverIp', serverIp);
      if (state.activeDimension) viewerUrl.searchParams.set('dimension', state.activeDimension);
      window.history.replaceState({}, '', viewerUrl);
    }
    function updateDimensionTabs() {
      const counts = getDimensionCounts();
      const dimensions = getKnownDimensions();
      dimensionTabs.innerHTML = '';
      for (const dimension of dimensions) {
        const meta = metaForDimension(dimension);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dimension-tab';
        button.dataset.active = dimension === state.activeDimension ? 'true' : 'false';
        button.style.color = meta.accent;
        button.style.background = dimension === state.activeDimension ? meta.soft : 'rgba(255, 255, 255, 0.5)';
        button.innerHTML = '<span>' + escapeInline(meta.label) + '</span><small>' + String(counts[dimension] || 0) + '</small>';
        button.addEventListener('click', function () {
          state.activeDimension = dimension;
          syncViewerUrl();
          render();
        });
        dimensionTabs.appendChild(button);
      }
    }
    function updateHeader() {
      const filtered = sortPlayers(getFilteredPlayers());
      const meta = metaForDimension(state.activeDimension);
      const total = state.players.length;
      const roomLabel = state.roomId || 'room unavailable';
      mapHeading.textContent = meta.label;
      visibleCountEl.textContent = String(filtered.length);
      totalCountEl.textContent = String(total);
      roomIdPill.textContent = roomLabel;
      roomIdPill.title = roomLabel;
      updatedAtPill.textContent = 'updated ' + formatTime(state.lastUpdatedAt);
      drawerSummary.textContent = state.roomId ? roomLabel + ' | ' + total + ' player' + (total === 1 ? '' : 's') : 'No active room.';
      drawerDimensionSummary.textContent = meta.label + ' | ' + filtered.length + ' visible on map | ' + total + ' total';
    }
    function updateAvatarElement(avatar, player, size) {
      avatar.style.width = size + 'px';
      avatar.style.height = size + 'px';
      let fallback = avatar.querySelector('.avatar-fallback');
      if (!fallback) {
        fallback = document.createElement('span');
        fallback.className = 'avatar-fallback';
        avatar.appendChild(fallback);
      }
      fallback.textContent = getInitials(player.playerName);

      let image = avatar.querySelector('img');
      if (!image) {
        image = document.createElement('img');
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('load', function () {
          fallback.classList.add('hidden');
        });
        image.addEventListener('error', function () {
          image.remove();
        });
        avatar.appendChild(image);
      }

      image.alt = player.playerName + ' avatar';
      const avatarUrl = getAvatarUrl(player);
      if (avatarUrl && image.dataset.src !== avatarUrl) {
        fallback.classList.remove('hidden');
        image.dataset.src = avatarUrl;
        image.src = avatarUrl;
      }
    }
    function createAvatarElement(player, size) {
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      updateAvatarElement(avatar, player, size);
      return avatar;
    }
    function focusPlayer(player) {
      state.activeDimension = player.dimension;
      syncViewerUrl();
      const camera = ensureCamera(getFilteredPlayers());
      camera.centerX = player.x;
      camera.centerZ = player.z;
      camera.spanX = Math.min(camera.spanX, 768);
      camera.spanZ = Math.min(camera.spanZ, 768);
      setCameraInteractionState({ hasCustomView: true });
      render();
    }
    function getPlayerKey(player) {
      return player.uuid || player.playerName;
    }
    function createRosterCard(player) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'roster-card';
      card.dataset.playerKey = getPlayerKey(player);
      const avatar = createAvatarElement(player, 36);
      const body = document.createElement('div');
      body.className = 'roster-body';
      const name = document.createElement('strong');
      name.className = 'roster-name';
      const coords = document.createElement('div');
      coords.className = 'roster-meta';
      const meta = document.createElement('div');
      meta.className = 'roster-meta';
      body.appendChild(name);
      body.appendChild(coords);
      body.appendChild(meta);
      card.appendChild(avatar);
      card.appendChild(body);
      return card;
    }
    function updateRosterCard(card, player) {
      const isActiveDimension = player.dimension === state.activeDimension;
      card.className = 'roster-card' + (isActiveDimension ? ' roster-card--active' : ' roster-card--muted');
      card.onclick = function () { focusPlayer(player); };

      const avatar = card.querySelector('.avatar');
      updateAvatarElement(avatar, player, 36);

      const name = card.querySelector('.roster-name');
      name.textContent = player.playerName;
      name.title = player.playerName;

      const metas = card.querySelectorAll('.roster-meta');
      metas[0].innerHTML = '<span>x ' + formatCoord(player.x) + '</span><span>y ' + formatCoord(player.y) + '</span><span>z ' + formatCoord(player.z) + '</span>';
      metas[1].innerHTML = '<span class="roster-dimension">' + escapeInline(formatDimensionLabel(player.dimension)) + '</span>';
      metas[1].innerHTML += '<span class="roster-time">' + formatTime(player.updatedAt) + '</span>';
    }
    function updateRoster() {
      const rosterPlayers = sortRosterPlayers(state.players);
      const seen = new Set();
      rosterList.innerHTML = '';
      if (!rosterPlayers.length) {
        const empty = document.createElement('div');
        empty.className = 'roster-card';
        empty.innerHTML = '<div class="roster-body"><strong class="roster-name">No players in this room</strong><div class="roster-meta">Waiting for the next snapshot from connected clients.</div></div>';
        rosterList.appendChild(empty);
        return;
      }
      for (const player of rosterPlayers) {
        const playerKey = getPlayerKey(player);
        seen.add(playerKey);
        const card = state.rosterNodes[playerKey] || createRosterCard(player);
        state.rosterNodes[playerKey] = card;
        updateRosterCard(card, player);
        rosterList.appendChild(card);
      }
      for (const playerKey of Object.keys(state.rosterNodes)) {
        if (!seen.has(playerKey)) {
          delete state.rosterNodes[playerKey];
        }
      }
    }
    function resizeCanvas() {
      const rect = mapStage.getBoundingClientRect();
      const width = Math.max(800, Math.round(rect.width * (window.devicePixelRatio || 1)));
      const height = Math.max(520, Math.round(rect.height * (window.devicePixelRatio || 1)));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    function getAspectRatio() {
      return Math.max(1, canvas.width) / Math.max(1, canvas.height);
    }
    function chooseStep(min, max, targetPixels) {
      const span = Math.max(1, max - min);
      const candidates = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
      for (const step of candidates) {
        const projected = (step / span) * canvas.width;
        if (projected >= targetPixels) return step;
      }
      return candidates[candidates.length - 1];
    }
    function projectX(x, minX, maxX) {
      if (maxX === minX) return canvas.width / 2;
      return ((x - minX) / (maxX - minX)) * canvas.width;
    }
    function projectZ(z, minZ, maxZ) {
      if (maxZ === minZ) return canvas.height / 2;
      return canvas.height - ((z - minZ) / (maxZ - minZ)) * canvas.height;
    }
    function getBaseExtents(players) {
      if (!players.length) {
        return { minX: -256, maxX: 256, minZ: -256, maxZ: 256 };
      }
      const xs = players.map(function (player) { return player.x; });
      const zs = players.map(function (player) { return player.z; });
      const minX = Math.min.apply(null, xs);
      const maxX = Math.max.apply(null, xs);
      const minZ = Math.min.apply(null, zs);
      const maxZ = Math.max.apply(null, zs);
      const spanX = Math.max(96, maxX - minX);
      const spanZ = Math.max(96, maxZ - minZ);
      const padX = Math.max(64, spanX * 0.22);
      const padZ = Math.max(64, spanZ * 0.22);
      return { minX: Math.floor(minX - padX), maxX: Math.ceil(maxX + padX), minZ: Math.floor(minZ - padZ), maxZ: Math.ceil(maxZ + padZ) };
    }
    function createCameraFromExtents(extents) {
      const centerX = (extents.minX + extents.maxX) / 2;
      const centerZ = (extents.minZ + extents.maxZ) / 2;
      const spanX = Math.max(128, extents.maxX - extents.minX);
      const spanZ = Math.max(128, extents.maxZ - extents.minZ);
      const aspect = getAspectRatio();
      const adjustedSpanX = Math.max(spanX, spanZ * aspect);
      const adjustedSpanZ = Math.max(spanZ, adjustedSpanX / aspect);
      return { centerX, centerZ, spanX: adjustedSpanX, spanZ: adjustedSpanZ };
    }
    function getCameraInteractionState() {
      return state.interactionState[state.activeDimension] || { hasCustomView: false };
    }
    function setCameraInteractionState(nextState) {
      state.interactionState[state.activeDimension] = nextState;
    }
    function resetCameraToFit(players) {
      state.cameras[state.activeDimension] = createCameraFromExtents(getBaseExtents(players));
      setCameraInteractionState({ hasCustomView: false });
    }
    function ensureCamera(players) {
      const existing = state.cameras[state.activeDimension];
      if (!existing) {
        resetCameraToFit(players);
      } else {
        const aspect = getAspectRatio();
        existing.spanZ = Math.max(existing.spanZ, existing.spanX / aspect);
        existing.spanX = Math.max(existing.spanX, existing.spanZ * aspect);
      }
      return state.cameras[state.activeDimension];
    }
    function getExtents(players) {
      const camera = ensureCamera(players);
      return {
        minX: camera.centerX - camera.spanX / 2,
        maxX: camera.centerX + camera.spanX / 2,
        minZ: camera.centerZ - camera.spanZ / 2,
        maxZ: camera.centerZ + camera.spanZ / 2
      };
    }
    function zoomCamera(multiplier, anchorClientX, anchorClientY) {
      const players = getFilteredPlayers();
      const camera = ensureCamera(players);
      const rect = mapStage.getBoundingClientRect();
      const px = Math.min(Math.max(anchorClientX - rect.left, 0), rect.width);
      const py = Math.min(Math.max(anchorClientY - rect.top, 0), rect.height);
      const anchorWorldX = camera.centerX - camera.spanX / 2 + (px / rect.width) * camera.spanX;
      const anchorWorldZ = camera.centerZ + camera.spanZ / 2 - (py / rect.height) * camera.spanZ;
      const nextSpanX = Math.min(200000, Math.max(32, camera.spanX * multiplier));
      const nextSpanZ = Math.min(200000, Math.max(32, camera.spanZ * multiplier));
      camera.centerX = anchorWorldX - (px / rect.width - 0.5) * nextSpanX;
      camera.centerZ = anchorWorldZ + (py / rect.height - 0.5) * nextSpanZ;
      camera.spanX = nextSpanX;
      camera.spanZ = nextSpanZ;
      setCameraInteractionState({ hasCustomView: true });
    }
    function panCamera(deltaClientX, deltaClientY) {
      const players = getFilteredPlayers();
      const camera = ensureCamera(players);
      const rect = mapStage.getBoundingClientRect();
      camera.centerX -= (deltaClientX / rect.width) * camera.spanX;
      camera.centerZ += (deltaClientY / rect.height) * camera.spanZ;
      setCameraInteractionState({ hasCustomView: true });
    }
    function drawGrid(extents) {
      const minorStep = chooseStep(extents.minX, extents.maxX, 26);
      const majorStep = Math.max(minorStep, chooseStep(extents.minX, extents.maxX, 92));
      const regionStep = Math.max(majorStep, chooseStep(extents.minX, extents.maxX, 180));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f1ede3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const wash = ctx.createLinearGradient(0, 0, 0, canvas.height);
      wash.addColorStop(0, 'rgba(255,255,255,0.38)');
      wash.addColorStop(1, 'rgba(0,0,0,0.02)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const startX = Math.floor(extents.minX / minorStep) * minorStep;
      const endX = Math.ceil(extents.maxX / minorStep) * minorStep;
      const startZ = Math.floor(extents.minZ / minorStep) * minorStep;
      const endZ = Math.ceil(extents.maxZ / minorStep) * minorStep;
      for (let x = startX; x <= endX; x += minorStep) {
        const px = projectX(x, extents.minX, extents.maxX);
        ctx.strokeStyle = x % regionStep === 0 ? 'rgba(56, 63, 69, 0.32)' : (x % majorStep === 0 ? 'rgba(56, 63, 69, 0.22)' : 'rgba(56, 63, 69, 0.12)');
        ctx.lineWidth = x % regionStep === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();
      }
      for (let z = startZ; z <= endZ; z += minorStep) {
        const pz = projectZ(z, extents.minZ, extents.maxZ);
        ctx.strokeStyle = z % regionStep === 0 ? 'rgba(56, 63, 69, 0.32)' : (z % majorStep === 0 ? 'rgba(56, 63, 69, 0.22)' : 'rgba(56, 63, 69, 0.12)');
        ctx.lineWidth = z % regionStep === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, pz);
        ctx.lineTo(canvas.width, pz);
        ctx.stroke();
      }
      if (extents.minX <= 0 && extents.maxX >= 0) {
        const axisX = projectX(0, extents.minX, extents.maxX);
        ctx.strokeStyle = 'rgba(15, 91, 109, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(axisX, 0);
        ctx.lineTo(axisX, canvas.height);
        ctx.stroke();
      }
      if (extents.minZ <= 0 && extents.maxZ >= 0) {
        const axisZ = projectZ(0, extents.minZ, extents.maxZ);
        ctx.strokeStyle = 'rgba(15, 91, 109, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, axisZ);
        ctx.lineTo(canvas.width, axisZ);
        ctx.stroke();
      }
      ctx.font = Math.max(12, Math.round(canvas.width / 115)) + 'px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(64, 70, 76, 0.74)';
      ctx.textBaseline = 'top';
      const minLabelGap = 84;
      const xStepMultiplier = Math.max(1, Math.ceil(minLabelGap / ((majorStep / (extents.maxX - extents.minX)) * canvas.width)));
      const zStepMultiplier = Math.max(1, Math.ceil(56 / ((majorStep / (extents.maxZ - extents.minZ)) * canvas.height)));
      for (let x = Math.floor(extents.minX / majorStep) * majorStep; x <= extents.maxX; x += majorStep * xStepMultiplier) {
        const px = projectX(x, extents.minX, extents.maxX);
        ctx.fillText('x ' + formatCoord(x), px + 6, 8);
      }
      for (let z = Math.floor(extents.minZ / majorStep) * majorStep; z <= extents.maxZ; z += majorStep * zStepMultiplier) {
        const pz = projectZ(z, extents.minZ, extents.maxZ);
        ctx.fillText('z ' + formatCoord(z), 10, pz + 6);
      }
    }
    function createMarkerNode(player) {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'player-token';
      marker.dataset.playerKey = getPlayerKey(player);
      const chip = document.createElement('div');
      chip.className = 'player-chip';
      chip.appendChild(createAvatarElement(player, 28));
      const text = document.createElement('div');
      text.className = 'player-text';
      const name = document.createElement('strong');
      const coords = document.createElement('span');
      text.appendChild(name);
      text.appendChild(coords);
      chip.appendChild(text);
      const dot = document.createElement('div');
      dot.className = 'marker-dot';
      marker.appendChild(chip);
      marker.appendChild(dot);
      return marker;
    }
    function updateMarkerNode(marker, player, extents, meta, stageWidth, stageHeight) {
      marker.style.left = projectX(player.x, extents.minX, extents.maxX) / canvas.width * stageWidth + 'px';
      marker.style.top = projectZ(player.z, extents.minZ, extents.maxZ) / canvas.height * stageHeight + 'px';
      marker.style.color = meta.accent;
      marker.title = player.playerName + ' | x ' + formatCoord(player.x) + ' z ' + formatCoord(player.z);
      marker.setAttribute('aria-label', marker.title);

      const avatar = marker.querySelector('.avatar');
      updateAvatarElement(avatar, player, 28);

      const name = marker.querySelector('.player-text strong');
      const coords = marker.querySelector('.player-text span');
      name.textContent = player.playerName;
      name.title = player.playerName;
      coords.textContent = 'x ' + formatCoord(player.x) + ' | z ' + formatCoord(player.z);
    }
    function renderMarkers(extents) {
      const filtered = getFilteredPlayers();
      const seen = new Set();
      emptyState.classList.toggle('hidden', filtered.length > 0);
      if (!filtered.length) {
        markersEl.replaceChildren();
        emptyMessage.textContent = 'No players are currently visible in ' + metaForDimension(state.activeDimension).label + '. Try another dimension or wait for the next update.';
        return;
      }
      const meta = metaForDimension(state.activeDimension);
      const stageWidth = mapStage.clientWidth;
      const stageHeight = mapStage.clientHeight;
      for (const player of sortPlayers(filtered)) {
        const playerKey = getPlayerKey(player);
        seen.add(playerKey);
        const marker = state.markerNodes[playerKey] || createMarkerNode(player);
        state.markerNodes[playerKey] = marker;
        updateMarkerNode(marker, player, extents, meta, stageWidth, stageHeight);
        markersEl.appendChild(marker);
      }
      for (const playerKey of Object.keys(state.markerNodes)) {
        if (!seen.has(playerKey)) {
          state.markerNodes[playerKey].remove();
          delete state.markerNodes[playerKey];
        }
      }
    }
    function render() {
      resizeCanvas();
      updateDimensionTabs();
      updateHeader();
      updateRoster();
      const filtered = getFilteredPlayers();
      const extents = getExtents(filtered);
      drawGrid(extents);
      renderMarkers(extents);
      const camera = ensureCamera(filtered);
      const baseExtents = createCameraFromExtents(getBaseExtents(filtered));
      zoomReadout.textContent = Math.round((baseExtents.spanX / camera.spanX) * 100) + '%';
      viewportValue.textContent = 'x ' + formatCoord(extents.minX) + ' .. ' + formatCoord(extents.maxX) + ' | z ' + formatCoord(extents.minZ) + ' .. ' + formatCoord(extents.maxZ);
      viewportHint.textContent = filtered.length ? 'Auto-fit keeps every visible player inside the active dimension.' : 'Viewport stays centered so empty rooms do not collapse into noise.';
    }
    function applySnapshot(message) {
      state.roomId = message.roomId;
      state.players = dedupePlayers(Array.isArray(message.players) ? message.players : []);
      for (const player of state.players) ensureAvatarLoaded(player);
      state.lastUpdatedAt = message.serverTime;
      ensureActiveDimension();
      if (!getCameraInteractionState().hasCustomView) {
        resetCameraToFit(getFilteredPlayers());
      } else {
        ensureCamera(getFilteredPlayers());
      }
      render();
    }
    async function fetchSnapshot(serverKey, serverIp) {
      const url = new URL('/api/players', window.location.origin);
      url.searchParams.set('serverKey', serverKey);
      url.searchParams.set('serverIp', serverIp);
      const response = await fetch(url);
      const json = await response.json();
      if (!response.ok || json.ok === false) throw new Error(json.error || 'Failed to load players');
      applySnapshot({ roomId: json.roomId, serverTime: json.serverTime, players: json.players });
    }
    function closeSocket() {
      if (state.socket) {
        state.socket.close();
        state.socket = null;
      }
    }
    function openSocket(serverKey, serverIp) {
      closeSocket();
      const url = new URL('/ws', window.location.origin);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      url.searchParams.set('serverKey', serverKey);
      url.searchParams.set('serverIp', serverIp);
      const socket = new WebSocket(url);
      state.socket = socket;
      socket.addEventListener('open', function () { setStatus('Connected', 'connected'); });
      socket.addEventListener('close', function () { setStatus('Disconnected', 'idle'); });
      socket.addEventListener('error', function () { setStatus('WebSocket error', 'error'); });
      socket.addEventListener('message', function (event) {
        const json = JSON.parse(event.data);
        if (json.type === 'snapshot') applySnapshot(json);
      });
    }
    async function connect(event) {
      if (event) event.preventDefault();
      const serverKey = serverKeyInput.value.trim();
      const serverIp = serverIpInput.value.trim();
      if (!serverKey || !serverIp) {
        setStatus('Server key and IP are required', 'error');
        return;
      }
      syncViewerUrl();
      setStatus('Loading snapshot...', 'loading');
      try {
        await fetchSnapshot(serverKey, serverIp);
        openSocket(serverKey, serverIp);
        showViewerScreen();
      } catch (error) {
        setStatus(error && error.message ? error.message : 'Failed to connect', 'error');
        showSetupScreen();
      }
    }
    function startDrag(event) {
      if (event.target && event.target.closest && event.target.closest('.player-token')) return;
      state.drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY };
      mapStage.dataset.dragging = 'true';
      mapStage.setPointerCapture(event.pointerId);
    }
    function moveDrag(event) {
      if (!state.drag || state.drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - state.drag.clientX;
      const deltaY = event.clientY - state.drag.clientY;
      state.drag.clientX = event.clientX;
      state.drag.clientY = event.clientY;
      panCamera(deltaX, deltaY);
      render();
    }
    function endDrag(event) {
      if (!state.drag || state.drag.pointerId !== event.pointerId) return;
      mapStage.releasePointerCapture(event.pointerId);
      state.drag = null;
      mapStage.dataset.dragging = 'false';
    }
    form.addEventListener('submit', connect);
    fitViewButton.addEventListener('click', function () {
      resetCameraToFit(getFilteredPlayers());
      render();
    });
    mapStage.addEventListener('wheel', function (event) {
      event.preventDefault();
      const multiplier = event.deltaY < 0 ? 0.86 : 1.16;
      zoomCamera(multiplier, event.clientX, event.clientY);
      render();
    }, { passive: false });
    mapStage.addEventListener('pointerdown', startDrag);
    mapStage.addEventListener('pointermove', moveDrag);
    mapStage.addEventListener('pointerup', endDrag);
    mapStage.addEventListener('pointercancel', endDrag);
    window.addEventListener('beforeunload', closeSocket);
    window.addEventListener('resize', render);
    render();
    if (serverKeyInput.value.trim() && serverIpInput.value.trim()) {
      connect();
    } else {
      showSetupScreen();
    }
  </script>
</body>
</html>`
}
