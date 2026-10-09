// node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/route.js";

const post = (q, ip = "1.1.1.1") =>
  handler(
    new Request("http://x/api/route", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify({ q }),
    }),
  );
// make the "model" reply with whatever the test wants
const model = (content) =>
  (globalThis.fetch = async (_url, init) => {
    model.sent = JSON.parse(init.body);
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }));
  });

test("503 until the key and model are configured", async () => {
  assert.equal((await post("hi")).status, 503);
});

test("only a known card id and a boolean ever leave the endpoint", async () => {
  process.env.OPENAI_API_KEY = "test";
  process.env.OPENAI_MODEL = "test-model";

  model('{"card":"lily","hinglish":true}');
  assert.deepEqual(await (await post("billing software?")).json(), {
    card: "lily",
    hinglish: true,
  });

  model('{"card":"<script>","hinglish":"yes","answer":"Angel won a Nobel"}');
  assert.deepEqual(await (await post("x")).json(), { card: "none", hinglish: false });

  model("I think the answer is...");
  assert.deepEqual(await (await post("x")).json(), { card: "none", hinglish: false });

  model('{"card":"constructor"}');
  assert.equal((await (await post("x")).json()).card, "none");
});

test("question is capped at 200 characters", async () => {
  model('{"card":"none"}');
  await post("a".repeat(500));
  assert.equal(model.sent.messages[1].content.length, 200);
});

test("rejects non-POST and empty questions, and rate limits per IP", async () => {
  assert.equal((await handler(new Request("http://x/api/route"))).status, 405);
  assert.equal((await post("  ", "2.2.2.2")).status, 400);
  model('{"card":"none"}');
  let last;
  for (let i = 0; i < 11; i++) last = await post("q", "3.3.3.3");
  assert.equal(last.status, 429);
});
