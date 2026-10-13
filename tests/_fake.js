// Stand-ins for the three services the API calls: Upstash Redis, Google's
// signing keys and the model. install() replaces fetch with a router to them
// and returns { store, token(claims), model }.
const { subtle } = globalThis.crypto;
const b64url = (x) =>
  Buffer.from(typeof x === "string" ? x : new Uint8Array(x)).toString(
    "base64url",
  );

function redis(store) {
  const z = (k) => (store[k] ??= new Map()),
    set = (k) => (store[k] ??= new Set()),
    list = (k) => (store[k] ??= []),
    hash = (k) => (store[k] ??= {});
  const run = {
    GET: (k) => store[k] ?? null,
    SET: (k, v) => ((store[k] = v), "OK"),
    MGET: (...ks) => ks.map((k) => store[k] ?? null),
    EXISTS: (k) => +(k in store),
    INCR: (k) => (store[k] = (+store[k] || 0) + 1),
    EXPIRE: () => 1,
    LPUSH: (k, v) => list(k).unshift(v),
    LTRIM: (k, a, b) => ((store[k] = list(k).slice(a, b + 1)), "OK"),
    LRANGE: (k, a, b) => list(k).slice(a, b + 1),
    HINCRBY: (k, f, n) => (hash(k)[f] = (hash(k)[f] || 0) + n),
    HGETALL: (k) => Object.entries(hash(k)).flat().map(String),
    ZADD: (k, ...a) => {
      const nx = a[0] === "NX" && a.shift();
      if (nx && z(k).has(a[1])) return 0;
      z(k).set(a[1], +a[0]);
      return 1;
    },
    ZREM: (k, m) => +z(k).delete(m),
    ZSCORE: (k, m) => (z(k).has(m) ? String(z(k).get(m)) : null),
    ZINCRBY: (k, n, m) => (
      z(k).set(m, (z(k).get(m) || 0) + n),
      String(z(k).get(m))
    ),
    ZRANGE: (k, a, b, ...opt) => {
      let rows = [...z(k)].sort((x, y) => x[1] - y[1]);
      if (opt.includes("REV")) rows.reverse();
      rows = rows.slice(a, b + 1);
      return opt.includes("WITHSCORES")
        ? rows.flatMap(([m, s]) => [m, String(s)])
        : rows.map(([m]) => m);
    },
    SADD: (k, m) => (set(k).has(m) ? 0 : (set(k).add(m), 1)),
    SREM: (k, m) => +set(k).delete(m),
    SISMEMBER: (k, m) => +set(k).has(m),
    SMEMBERS: (k) => [...set(k)],
  };
  return (cmds) =>
    cmds.map(([name, ...args]) => ({ result: run[name](...args) }));
}

export async function install() {
  process.env.KV_REST_API_URL = "http://redis.test";
  process.env.KV_REST_API_TOKEN = "t";
  process.env.GOOGLE_CLIENT_ID = "client.test";
  process.env.ADMIN_EMAILS = "angel@test.dev";
  process.env.OPENAI_API_KEY = "test";

  const alg = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
  const pair = await subtle.generateKey(
    { ...alg, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ["sign", "verify"],
  );
  const jwk = { ...(await subtle.exportKey("jwk", pair.publicKey)), kid: "k1" };
  // a Google ID token for this person; pass claims to break it on purpose
  const token = async (email, claims = {}, key = pair.privateKey) => {
    const body = [
      { alg: "RS256", kid: "k1" },
      {
        iss: "https://accounts.google.com",
        aud: "client.test",
        exp: Math.floor(Date.now() / 1000) + 600,
        email,
        email_verified: true,
        given_name: email.split("@")[0],
        ...claims,
      },
    ]
      .map((o) => b64url(JSON.stringify(o)))
      .join(".");
    return `${body}.${b64url(await subtle.sign(alg, key, Buffer.from(body)))}`;
  };

  const store = {};
  const exec = redis(store);
  const model = { page: "<!doctype html><html><body>a page</body></html>" };
  globalThis.fetch = async (url, init) => {
    url = String(url);
    if (url.startsWith("http://redis.test"))
      return Response.json(exec(JSON.parse(init.body)));
    if (url.includes("googleapis.com/oauth2"))
      return Response.json({ keys: [jwk] });
    const ev = (o) => `data: ${JSON.stringify(o)}\n\n`;
    return new Response(
      ev({ choices: [{ delta: { content: model.page } }] }) +
        ev({ choices: [{ delta: {}, finish_reason: "stop" }] }) +
        ev({
          choices: [],
          usage: { prompt_tokens: 900, completion_tokens: 50 },
        }),
    );
  };
  return {
    store,
    token,
    model,
    pair: () =>
      subtle.generateKey(
        {
          ...alg,
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
        },
        true,
        ["sign", "verify"],
      ),
  };
}
