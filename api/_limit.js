// Per-IP rate limit shared by the API functions. limiter(n) allows n requests
// per IP per minute.
// ponytail: per-instance memory, so the limit is per edge instance, not global.
// Move to Upstash or Vercel KV if an endpoint gets abused.
export function limiter(max) {
  const hits = new Map();
  return (req) => {
    const ip = (req.headers.get("x-forwarded-for") || "?").split(",")[0].trim();
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > max;
  };
}
