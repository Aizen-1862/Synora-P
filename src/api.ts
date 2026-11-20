export type LyricLine = { time: number; text: string };

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function fetchLyrics(track: string, artist: string): Promise<LyricLine[]> {
  const query = new URLSearchParams({ track, artist });
  const response = await fetch(`${API_BASE}/api/lyrics?${query.toString()}`);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Lyrics unavailable");
  }

  const data = await response.json();
  return Array.isArray(data.lines) ? data.lines : [];
}
