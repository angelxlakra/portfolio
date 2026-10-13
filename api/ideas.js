import { db, hasDb, pairs } from "./_db.js";
import { who } from "./_auth.js";
import { limiter } from "./_limit.js";

export const config = { runtime: "edge" };

// Ideas: live renders that signed-in visitors sent to Angel. Each starts as
// "pending", which only Angel sees on /review/. Approved ones go on the wall
// as proposed cards and can be voted on. Stored in Redis as:
//   render:<id>      a finished render, kept for a day (written by render.js)
//   idea:<id>        { id, prompt, model, name, email, status, at }
//   html:<id>        the page itself
//   ideas:pending    ids by time sent
//   ideas:approved   ids by votes
//   voted:<email>    the ids this person has voted for
// GET                    the wall: approved ideas, who you are, the client id
// GET ?id=               one idea with its page
// GET ?admin=1           (Angel) pending ideas and the render log
// POST {do:"submit",id}  send a render in        (signed in)
// POST {do:"vote",id}    vote or take it back    (signed in)
// POST {do:"review",id,status}                   (Angel)
const DAILY = 5; // ideas one person may send in a day
const ID = /^[0-9a-f-]{36}$/;
const limited = limiter(60);
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
// what anyone may see of an idea: never the email
const pub = (m, votes, voted) => ({
  id: m.id,
  prompt: m.prompt,
  name: m.name,
  status: m.status,
  votes: Number(votes) || 0,
  voted: !!voted,
});
const metas = async (ids) =>
  ids.length
    ? (await db(["MGET", ...ids.map((id) => `idea:${id}`)]))[0]
        .filter(Boolean)
        .map(JSON.parse)
    : [];

export default async function handler(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID || null;
  const on = hasDb() && !!clientId;
  const q = new URL(req.url).searchParams;
  // without a database and a client id the pages just hide these features
  if (!on)
    return req.method === "GET" && !q.has("id") && !q.has("admin")
      ? json({ on, ideas: [] })
      : json({ error: "ideas are not switched on" }, 503);
  if (limited(req)) return json({ error: "slow down" }, 429);
  const me = await who(req);

  if (req.method === "GET") {
    if (q.has("admin")) {
      if (!me?.admin) return json({ error: "not yours" }, 403);
      const [pending, log, totals, top] = await db(
        ["ZRANGE", "ideas:pending", 0, 99, "REV"],
        ["LRANGE", "renders", 0, 199],
        ["HGETALL", "totals"],
        ["ZRANGE", "prompts", 0, 19, "REV", "WITHSCORES"],
      );
      return json({
        pending: await metas(pending),
        log: log.map(JSON.parse),
        totals: Object.fromEntries(pairs(totals).map(([k, v]) => [k, +v])),
        top: pairs(top),
      });
    }
    const id = q.get("id");
    if (id) {
      if (!ID.test(id)) return json({ error: "no such idea" }, 404);
      const [raw, html, votes, voted] = await db(
        ["GET", `idea:${id}`],
        ["GET", `html:${id}`],
        ["ZSCORE", "ideas:approved", id],
        ["SISMEMBER", `voted:${me?.email}`, id],
      );
      const m = raw && JSON.parse(raw);
      // unapproved ideas are for Angel and whoever sent them
      if (
        !m ||
        (m.status !== "approved" && !me?.admin && me?.email !== m.email)
      )
        return json({ error: "no such idea" }, 404);
      return json({ ...pub(m, votes, voted), html });
    }
    const [top, mine] = await db(
      ["ZRANGE", "ideas:approved", 0, 49, "REV", "WITHSCORES"],
      ["SMEMBERS", `voted:${me?.email}`],
    );
    const votes = Object.fromEntries(pairs(top));
    return json({
      on,
      clientId,
      me,
      ideas: (await metas(Object.keys(votes))).map((m) =>
        pub(m, votes[m.id], mine.includes(m.id)),
      ),
    });
  }

  if (req.method !== "POST") return json({ error: "GET or POST" }, 405);
  if (!me) return json({ error: "sign in first" }, 401);
  let body = {};
  try {
    body = await req.json();
  } catch {}
  const { id, status } = body;
  if (typeof id !== "string" || !ID.test(id))
    return json({ error: "id required" }, 400);

  if (body.do === "submit") {
    const day = new Date().toISOString().slice(0, 10);
    const [raw, sent] = await db(
      ["GET", `render:${id}`],
      ["EXISTS", `idea:${id}`],
    );
    if (sent) return json({ id });
    // only a page the model really wrote here can be sent in
    if (!raw) return json({ error: "that render has expired" }, 404);
    const [n] = await db(
      ["INCR", `sent:${me.email}:${day}`],
      ["EXPIRE", `sent:${me.email}:${day}`, 172800],
    );
    if (n > DAILY) return json({ error: "that's enough for today" }, 429);
    const { html, ...r } = JSON.parse(raw);
    const idea = {
      id,
      prompt: r.prompt,
      model: r.model,
      name: me.name,
      email: me.email,
      status: "pending",
      at: Date.now(),
    };
    await db(
      ["SET", `idea:${id}`, JSON.stringify(idea)],
      ["SET", `html:${id}`, html],
      ["ZADD", "ideas:pending", idea.at, id],
    );
    return json({ id });
  }

  if (body.do === "vote") {
    const [votes] = await db(["ZSCORE", "ideas:approved", id]);
    if (votes == null) return json({ error: "no such idea" }, 404);
    // a second vote takes the first one back
    const [added] = await db(["SADD", `voted:${me.email}`, id]);
    if (!added) await db(["SREM", `voted:${me.email}`, id]);
    const [now] = await db(["ZINCRBY", "ideas:approved", added ? 1 : -1, id]);
    return json({ votes: +now, voted: !!added });
  }

  if (body.do === "review") {
    if (!me.admin) return json({ error: "not yours" }, 403);
    if (status !== "approved" && status !== "rejected")
      return json({ error: "approved or rejected" }, 400);
    const [raw] = await db(["GET", `idea:${id}`]);
    if (!raw) return json({ error: "no such idea" }, 404);
    await db(
      ["SET", `idea:${id}`, JSON.stringify({ ...JSON.parse(raw), status })],
      ["ZREM", "ideas:pending", id],
      status === "approved"
        ? ["ZADD", "ideas:approved", "NX", 0, id] // NX keeps earlier votes
        : ["ZREM", "ideas:approved", id],
    );
    return json({ id, status });
  }
  return json({ error: "unknown action" }, 400);
}
