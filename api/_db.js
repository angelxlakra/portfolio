// The site's database: Upstash Redis over its REST API (added from Vercel's
// Storage tab, which sets the KV_REST_API_* variables). Everything that needs
// it checks hasDb() first and switches itself off without one.
const url = () =>
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () =>
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const hasDb = () => !!(url() && token());

// db(["GET", "a"], ["INCR", "b"]) runs the commands in one round trip and
// returns their results in order. Throws if the database or a command fails.
export async function db(...cmds) {
  const r = await fetch(url() + "/pipeline", {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: JSON.stringify(cmds),
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) throw new Error("db " + r.status);
  return (await r.json()).map((x) => {
    if (x.error) throw new Error(x.error);
    return x.result;
  });
}
// Redis answers HGETALL and ZRANGE WITHSCORES as [key, value, key, value, ...]
export const pairs = (flat = []) =>
  flat.flatMap((x, i) => (i % 2 ? [] : [[x, flat[i + 1]]]));
