// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/render.js";
import { readFileSync } from "node:fs";

const post = (c, ip = "1.1.1.1") =>
  handler(
    new Request("http://x/api/render", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify({ c }),
    }),
  );
// make the "model" stream these pieces back the way OpenAI does
const model = (...pieces) =>
  (globalThis.fetch = async (_url, init) => {
    model.sent = JSON.parse(init.body);
    if (model.status)
      return new Response("no such model", { status: model.status });
    const ev = (o) => `data: ${JSON.stringify(o)}\n\n`;
    return new Response(
      pieces
        .map((content) => ev({ choices: [{ delta: { content } }] }))
        .join("") +
        ev({
          choices: [{ delta: {}, finish_reason: model.finish || "stop" }],
        }) +
        ev({
          choices: [],
          usage: { prompt_tokens: 900, completion_tokens: 50 },
        }) +
        "data: [DONE]\n\n",
    );
  });
// what the endpoint wrote to the render log
const logged = [];
console.log = (line) =>
  logged.push(JSON.parse(String(line).replace(/^render /, "")));

test("503 until the key is configured", async () => {
  assert.equal((await post("Angel as a boarding pass")).status, 503);
});

test("needs a prompt, and caps it at 300 characters", async () => {
  process.env.OPENAI_API_KEY = "test";
  for (const c of ["", "  a ", 42, undefined]) {
    model.sent = null;
    model("<p>x</p>");
    assert.equal((await post(c)).status, 400);
    assert.equal(model.sent, null);
  }
  model("<p>x</p>");
  await (await post("a".repeat(500), "9.9.9.9")).text();
  assert.equal(
    model.sent.messages[1].content,
    `<brief>${"a".repeat(300)}</brief>`,
  );
});

test("streams the model's HTML with code fences stripped, facts in the prompt", async () => {
  model(
    "```html\n",
    "<!doctype html><ht",
    "ml><body>hi</body></html>",
    "\n```\n",
  );
  const r = await post("Angel folded into a train ticket", "2.2.2.2");
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "<!doctype html><html><body>hi</body></html>");
  assert.equal(model.sent.model, "gpt-6-luna");
  assert.match(model.sent.messages[0].content, /Lily Cafe POS/);
  assert.equal(
    model.sent.messages[1].content,
    "<brief>Angel folded into a train ticket</brief>",
  );
});

test("logs each render with its prompt and tokens, and flags a cut-off page", async () => {
  model.finish = "length";
  model("<!doctype html><html><body>half a pa");
  const r = await post("Angel as a mixtape", "4.4.4.4");
  assert.match(await r.text(), /half a pa<!--cut-->$/);
  const last = logged.at(-1);
  assert.equal(last.prompt, "Angel as a mixtape");
  assert.deepEqual([last.in, last.out, last.cut], [900, 50, true]);
  model.finish = null;
});

test("a model error ends the page empty and is logged", async () => {
  model.status = 404;
  model();
  const r = await post("Angel as a matchbox", "5.5.5.5");
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "");
  assert.match(logged.at(-1).error, /404 no such model/);
  model.status = null;
});

test("rejects non-POST and rate limits per IP", async () => {
  assert.equal((await handler(new Request("http://x/api/render"))).status, 405);
  model("<p>x</p>");
  let last;
  for (let i = 0; i < 4; i++) last = await post("Angel as a kolam", "3.3.3.3");
  assert.equal(last.status, 429);
});

test("the frame that runs the model's scripts is never same-origin", () => {
  const page = readFileSync(
    new URL("../versions/live/index.html", import.meta.url),
    "utf8",
  );
  const [sandbox] = page.match(/sandbox="[^"]*"/g);
  assert.match(sandbox, /allow-scripts/);
  assert.doesNotMatch(
    sandbox,
    /allow-same-origin|allow-top-navigation|allow-forms/,
  );
  assert.equal(page.match(/sandbox="[^"]*"/g).length, 1);
});
