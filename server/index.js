import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 8787;

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "synora-p-api", lyricsProvider: "LRCLIB" });
});

app.get("/api/lyrics", async (req, res) => {
  const { track, artist, album, duration } = req.query;

  if (typeof track !== "string" || !track.trim() ||
      typeof artist !== "string" || !artist.trim()) {
    return res.status(400).json({ error: "track and artist are required" });
  }

  try {
    const url = new URL("https://lrclib.net/api/get");
    url.searchParams.set("track_name", track.trim());
    url.searchParams.set("artist_name", artist.trim());
    if (typeof album === "string" && album.trim()) url.searchParams.set("album_name", album.trim());
    if (typeof duration === "string" && duration.trim()) url.searchParams.set("duration", duration.trim());

    const response = await fetch(url, {
      headers: { "User-Agent": "SYNORA-P/0.1 (lyrics lookup)" },
      signal: AbortSignal.timeout(10000)
    });

    if (response.status === 404) {
      return res.status(404).json({ error: "No lyrics found for this track" });
    }
    if (!response.ok) {
      return res.status(502).json({ error: "Lyrics provider returned an error" });
    }

    const data = await response.json();
    const syncedLyrics = typeof data.syncedLyrics === "string" ? data.syncedLyrics : "";
    const lines = syncedLyrics
      .split(/\r?\n/)
      .map((line) => {
        const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/);
        return match
          ? { time: Number(match[1]) * 60 + Number(match[2]), text: match[3].trim() }
          : null;
      })
      .filter(Boolean);

    res.json({
      track: data.trackName,
      artist: data.artistName,
      plainLyrics: data.plainLyrics || "",
      lines
    });
  } catch (error) {
    console.error("Lyrics lookup failed:", error);
    res.status(502).json({ error: "Lyrics provider unavailable or request timed out" });
  }
});

app.get("/api/lyrics/search", async (req, res) => {
  const track = req.query.track;
  const artist = req.query.artist;

  if (typeof track !== "string" || !track.trim()) {
    return res.status(400).json({ error: "track is required" });
  }

  try {
    const url = new URL("https://lrclib.net/api/search");
    url.searchParams.set("track_name", track.trim());
    if (typeof artist === "string" && artist.trim()) url.searchParams.set("artist_name", artist.trim());

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.status(502).json({ error: "Lyrics search unavailable" });

    const data = await response.json();
    res.json(data.slice(0, 10).map((item) => ({
      id: item.id,
      track: item.trackName,
      artist: item.artistName,
      album: item.albumName,
      duration: item.duration,
      hasSyncedLyrics: Boolean(item.syncedLyrics)
    })));
  } catch (error) {
    console.error("Lyrics search failed:", error);
    res.status(502).json({ error: "Lyrics provider unavailable or request timed out" });
  }
});

app.listen(PORT, () => console.log(`SYNORA:P API listening on port ${PORT}`));
