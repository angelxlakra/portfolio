import "../content.js";
import "../versions.js";
import { limiter } from "./_limit.js";

export const config = { runtime: "edge" };

// SPIKE: live-rendered versions. Input { c } is the title of an unwritten
// card ("Angel as a boarding pass"). The model writes a whole HTML page for
// it from the facts in content.js and the page streams back as text/html.
// Unlike api/route.js, the model writes the words here, so the page that
// shows this (versions/live/) runs it with scripts off and says it may be wrong.
const C = globalThis.CONTENT;
const { forms, verbs } = globalThis.UNWRITTEN;
// only titles the hub itself can produce are ever sent to the model
const known = (c) =>
  typeof c === "string" &&
  verbs.some(
    (v) =>
      c.startsWith(`Angel ${v} `) &&
      forms.includes(c.slice(`Angel ${v} `.length)),
  );

const FACTS = JSON.stringify({
  profile: C.profile,
  email: C.email,
  links: C.links,
  highlights: C.highlights,
  experience: C.experience,
  education: C.education,
  projects: C.projects.map(({ image, ...p }) => p),
  toolbox: C.toolbox,
});

const SYSTEM = `You design and write one page of a developer's portfolio. The portfolio is a wall of versions: the same person, Angel Lakra, presented each time as a different object. You are given the object; build the whole page as that object.

Output
- One complete HTML document, starting with <!doctype html> and ending with </html>. No markdown, no code fences, no commentary.
- All CSS inline in one <style> tag. No JavaScript: scripts and event handlers are disabled where this runs. Use CSS for all motion and interaction (:hover, :target, :checked, <details>, @keyframes), and respect prefers-reduced-motion.
- No external requests of any kind: no web fonts, no remote images, no CDNs. They are blocked. Use system font stacks, inline SVG, CSS shapes and gradients.
- Works at 360px wide and on a desktop. Text contrast must be readable.
- Links: the email as a mailto: link, and the LinkedIn and GitHub URLs, each with target="_blank" rel="noopener".

Design
- Commit to the object. Its real-world structure, materials, typography and conventions should organise the page: a boarding pass has a stub, a gate and a barcode; a crossword has a grid and clues. A visitor should recognise the object before reading a word.
- Map Angel's real information onto the object's own parts, instead of placing a generic portfolio next to a picture of the object.
- Pick a palette and type treatment that belong to the object. Avoid the default look of AI-made pages: purple gradients, glass cards, emoji as icons, centred hero plus three feature cards.
- Cover: who he is, the projects (the client work most of all), experience, what he works with, and how to reach him.

Facts
- Every statement about Angel must come from the FACTS JSON below. Do not invent employers, clients, dates, numbers, metrics, awards, testimonials, skills or links. If the object needs a field the facts do not cover, leave it out or fill it with something plainly about the object (a seat number, a serial), never with a claim about him.
- "months" on an experience entry is its length in months. Use "when" or "years" for dates.

FACTS
${FACTS}`;

const limited = limiter(3);
const fail = (error, status) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export default async function handler(req) {
  if (req.method !== "POST") return fail("POST only", 405);
  const key = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_RENDER_MODEL || "gpt-6-luna";
  if (!key) return fail("renderer not configured", 503);

  let c;
  try {
    c = (await req.json()).c;
  } catch {}
  if (!known(c)) return fail("unknown concept", 400);
  if (limited(req)) return fail("slow down", 429);

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      stream: true,
      max_completion_tokens: 12000, // caps what one click can cost
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `The object: ${c}` },
      ],
    }),
  }).catch((e) => e);
  if (!r.ok) {
    // shows up in Vercel's function logs; never sent to the visitor
    console.error(
      "render upstream:",
      r.status || r,
      r.text ? (await r.text()).slice(0, 300) : "",
    );
    return fail("renderer unavailable", 502);
  }

  // OpenAI's event stream in, bare HTML out. Anything before the first "<" is
  // dropped and a short tail is held back, so a stray code fence at either
  // end never reaches the page.
  const enc = new TextEncoder();
  let sse = "",
    tail = "",
    started = false;
  const html = new TransformStream({
    transform(chunk, ctl) {
      sse += chunk;
      const lines = sse.split("\n");
      sse = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        let text;
        try {
          text = JSON.parse(line.slice(6)).choices[0]?.delta?.content;
        } catch {}
        if (!text) continue;
        tail += text;
        if (!started) {
          const at = tail.indexOf("<");
          if (at < 0) continue;
          tail = tail.slice(at);
          started = true;
        }
        if (tail.length > 16) {
          ctl.enqueue(enc.encode(tail.slice(0, -16)));
          tail = tail.slice(-16);
        }
      }
    },
    flush(ctl) {
      if (started) ctl.enqueue(enc.encode(tail.replace(/\s*`+\s*$/, "")));
    },
  });
  return new Response(
    r.body.pipeThrough(new TextDecoderStream()).pipeThrough(html),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Model": model,
      },
    },
  );
}
