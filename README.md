# SYNORA:P

A cross-platform live-lyrics visualizer. This is the first MVP foundation: React + TypeScript UI, Node.js lyrics API, LRCLIB lookup, animated visual scene, and a Tauri 2 scaffold.

## MVP
- Responsive mobile/desktop interface
- Animated cosmic visualizer with Cosmic/Ocean/Aurora themes
- LRCLIB synchronized-lyrics lookup
- Demo playback clock for testing
- Backend health, lyrics and search endpoints
- Tauri 2 packaging configuration scaffold

## Important audio limitation
No application can universally read every other app's audio on every OS. Windows can use native loopback capture and media-session metadata; Android requires supported media-session/notification access and audio-capture restrictions apply; iOS does not permit unrestricted capture of other apps' audio. Universal detection is not implemented in this starter. Native adapters must be implemented and tested per platform.

## Run
Node.js 20+ required.

```bash
npm install
npm run dev
```

In another terminal:
```bash
npm run server
```

Vite: http://localhost:5173. API: http://localhost:8787.

## Backend
- GET /api/health
- GET /api/lyrics?track=...&artist=...
- GET /api/lyrics/search?track=...&artist=...

## Desktop / Android
Tauri 2 configuration is in `src-tauri/`. Install Rust and the relevant platform SDKs before building. Android native media-session integration remains platform-specific work.

Lyrics availability and redistribution are subject to provider terms and rights. Review LRCLIB documentation before production use.
