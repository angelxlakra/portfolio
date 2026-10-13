// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { install } from "./_fake.js";

const { store, token, pair } = await install();
const { default: ideas } = await import("../api/ideas.js");
const { default: render } = await import("../api/render.js");
console.log = () => {}; // the render log line

let ip = 0; // a fresh address per call keeps the rate limiter out of the way
const call = async (handler, path, { as, body } = {}) => {
  const r = await handler(
    new Request("http://x" + path, {
      method: body ? "POST" : "GET",
      headers: {
        "x-forwarded-for": `10.0.0.${ip++ % 250}`,
        ...(as && { authorization: `Bearer ${as}` }),
      },
      body: body && JSON.stringify(body),
    }),
  );
  return { status: r.status, id: r.headers.get("X-Render-Id"), r };
};
const api = async (path, opts) => {
  const { status, r } = await call(ideas, path, opts);
  return { ...(await r.json()), status }; // status is the HTTP one
};
// render a page the way a visitor would, returning its id
const rendered = async (prompt) => {
  const { id, r } = await call(render, "/api/render", { body: { c: prompt } });
  await r.text();
  return id;
};
const angel = await token("angel@test.dev"),
  ria = await token("ria@test.dev"),
  sam = await token("sam@test.dev");

test("a render is logged with its tokens and kept so it can be sent in", async () => {
  const id = await rendered("Angel as a Mixtape");
  assert.equal(JSON.parse(store[`render:${id}`]).prompt, "Angel as a Mixtape");
  const line = JSON.parse(store.renders[0]);
  assert.deepEqual(
    [line.prompt, line.in, line.out],
    ["Angel as a Mixtape", 900, 50],
  );
  assert.deepEqual(store.totals, { renders: 1, in: 900, out: 50 });
  assert.equal(store.prompts.get("angel as a mixtape"), 1);
});

test("only a token Google signed for this site counts as signed in", async () => {
  const id = await rendered("Angel as a kolam");
  const send = (as) => api("/api/ideas", { as, body: { do: "submit", id } });
  assert.equal((await send(undefined)).status, 401);
  assert.equal((await send("a.b.c")).status, 401);
  assert.equal(
    (await send(await token("ria@test.dev", { aud: "another.site" }))).status,
    401,
  );
  assert.equal(
    (await send(await token("ria@test.dev", { exp: 1 }))).status,
    401,
  );
  assert.equal(
    (await send(await token("ria@test.dev", { email_verified: false }))).status,
    401,
  );
  // right claims, signed with somebody else's key
  const forged = await token("angel@test.dev", {}, (await pair()).privateKey);
  assert.equal((await send(forged)).status, 401);
  assert.equal((await send(ria)).status, 200);
});

test("submit, review, vote: an idea reaches the wall only once Angel approves it", async () => {
  const id = await rendered("Angel as a cricket scorecard");
  // only pages rendered here can be sent in
  const made = "00000000-0000-4000-8000-000000000000";
  assert.equal(
    (await api("/api/ideas", { as: ria, body: { do: "submit", id: made } }))
      .status,
    404,
  );
  assert.equal(
    (await api("/api/ideas", { as: ria, body: { do: "submit", id } })).status,
    200,
  );

  // pending: off the wall, hidden from strangers, visible to its sender and Angel
  assert.ok(!(await api("/api/ideas")).ideas.some((i) => i.id === id));
  assert.equal((await api(`/api/ideas?id=${id}`)).status, 404);
  assert.equal((await api(`/api/ideas?id=${id}`, { as: sam })).status, 404);
  assert.equal((await api(`/api/ideas?id=${id}`, { as: ria })).status, 200);
  assert.equal(
    (await api("/api/ideas", { as: sam, body: { do: "vote", id } })).status,
    404,
  );

  // only Angel reviews, and only Angel sees who sent what
  const review = { do: "review", id, status: "approved" };
  assert.equal(
    (await api("/api/ideas", { as: ria, body: review })).status,
    403,
  );
  assert.equal((await api("/api/ideas?admin=1", { as: ria })).status, 403);
  const desk = await api("/api/ideas?admin=1", { as: angel });
  assert.equal(desk.pending.find((i) => i.id === id).email, "ria@test.dev");
  assert.ok(desk.log.length && desk.totals.renders && desk.top.length);
  assert.equal(
    (await api("/api/ideas", { as: angel, body: review })).status,
    200,
  );

  // approved: public, with the page, never the email
  const one = await api(`/api/ideas?id=${id}`);
  assert.match(one.html, /a page/);
  assert.deepEqual([one.name, one.votes, one.email], ["ria", 0, undefined]);

  // one vote each; voting again takes it back
  const vote = (as) => api("/api/ideas", { as, body: { do: "vote", id } });
  assert.deepEqual((({ votes, voted }) => [votes, voted])(await vote(sam)), [
    1,
    true,
  ]);
  assert.equal((await vote(ria)).votes, 2);
  assert.deepEqual((({ votes, voted }) => [votes, voted])(await vote(sam)), [
    1,
    false,
  ]);
  const wall = await api("/api/ideas", { as: ria });
  assert.deepEqual(
    wall.ideas
      .filter((i) => i.id === id)
      .map((i) => [i.prompt, i.votes, i.voted]),
    [["Angel as a cricket scorecard", 1, true]],
  );
  assert.ok(!JSON.stringify(wall.ideas).includes("@"));

  // rejecting takes it down again
  await api("/api/ideas", {
    as: angel,
    body: { ...review, status: "rejected" },
  });
  assert.equal((await api(`/api/ideas?id=${id}`)).status, 404);
});

test("one person can send five ideas a day", async () => {
  const sent = [];
  for (let i = 0; i < 6; i++) {
    const id = await rendered(`Angel as idea ${i}`);
    sent.push(
      (await api("/api/ideas", { as: sam, body: { do: "submit", id } })).status,
    );
  }
  assert.deepEqual(sent, [200, 200, 200, 200, 200, 429]);
});

test("without a database or client id the features are simply off", async () => {
  delete process.env.GOOGLE_CLIENT_ID;
  assert.deepEqual(await api("/api/ideas"), {
    status: 200,
    on: false,
    ideas: [],
  });
  assert.equal(
    (await api("/api/ideas", { as: ria, body: { do: "vote", id: "x" } }))
      .status,
    503,
  );
  process.env.GOOGLE_CLIENT_ID = "client.test";
});
