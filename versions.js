// The written versions, in wall order. To add one: put the page at
// versions/<id>/index.html and add an entry here. The hub builds its wall,
// numbering, filter pills and counts from this list.
//   tags  the filter pills this version appears under
//   line  the one-line description under the card
//   cls + html  optional animated preview (its CSS lives in index.html).
//               Leave both out and the card shows the title on a plain tile.
// Loaded after content.js, so previews can use CONTENT values.
globalThis.VERSIONS = [
  {
    id: "receipt",
    title: "The Receipt",
    tags: ["recruiters", "clients"],
    line: "An 80mm till receipt itemises the engineer. Calm, complete, editorial.",
    cls: "p-receipt",
    html: `<div class="slot"></div><div class="paper"><div class="c">ANGEL LAKRA</div><div class="c" style="font-size:8px;color:#666">Full-stack · Bengaluru</div><hr><div class="r"><span>Python · FastAPI</span><span>1</span></div><div class="r"><span>LLM features</span><span>1</span></div><div class="r"><span>React · TS</span><span>1</span></div><div class="r"><span>Team lead</span><span>${CONTENT.lead.short}</span></div><div class="r"><span>POS systems</span><span>2</span></div><hr><div class="r"><b>TOTAL</b><b>${CONTENT.profile.years} YRS</b></div><hr><div class="c" style="font-size:8px">Thank you. Visit again.</div><div class="bar"></div></div><div class="big">Software<br>small business <span>runs on</span></div>`,
  },
  {
    id: "desktop",
    title: "The Desktop",
    tags: ["recruiters", "interactive"],
    line: "The page is a Mac. A notch that opens, windows you drag, a dock.",
    cls: "p-desk",
    html: `<div class="mb">Angel Lakra <span style="font-weight:500">Projects</span><span style="font-weight:500">Experience</span></div><div class="notch"><span>● open to work</span></div><div class="win w1"><i></i><b>I build the software small businesses run on.</b><u></u><u style="width:70%"></u><u style="width:80%"></u></div><div class="win w2"><i></i><div class="s"><em></em><em></em><em></em><em></em><em></em></div><div class="d"><strong>Lily Cafe POS</strong><em></em><em style="width:80%"></em><em style="width:60%"></em><em style="width:75%"></em></div></div><div class="dock"><span style="background:linear-gradient(#F7C36B,#E8893B)"></span><span style="background:linear-gradient(#5FB8E8,#2D7FC1)"></span><span style="background:#fff"></span><span style="background:linear-gradient(#5A6270,#2E333B)"></span></div>`,
  },
  {
    id: "signboard",
    title: "Angel Lakra Software Works",
    tags: ["clients", "local"],
    line: "Hand-painted shop signs and chalkboards, in English and Hindi.",
    cls: "p-sign",
    html: `<div class="board"><div class="open">OPEN</div><span class="deva" lang="hi">एंजल लकड़ा सॉफ़्टवेयर वर्क्स</span><span class="en">Angel Lakra Software Works</span><span class="strip">BILLING · WEBSITES · AI</span></div><div class="chalk"><span>✓ POS with GST bills</span><span>✓ Websites for cafes</span><span>✓ Hindi mein poochiye</span></div>`,
  },
  {
    id: "scan",
    title: "Scanned",
    tags: ["recruiters", "interactive"],
    line: "The career as a DiskMap sunburst. Months to scale, click to dig in.",
    cls: "p-scan",
    html: `<div class="sun"></div><div class="list"><div><i style="background:#E9A23B"></i><span>Yellow Class</span><em>${CONTENT.exp.intern.months} mo</em></div><div><i style="background:#4FB3BF"></i><span>Chain Labs</span><em>${CONTENT.exp.lead.months} mo</em></div><div><i style="background:#E0607E"></i><span>Own clients</span><em>${CONTENT.exp.now.months} mo</em></div></div>`,
  },
  {
    id: "chat",
    title: "Chat with Angel",
    tags: ["clients", "mobile", "interactive"],
    line: "A WhatsApp chat you steer with quick replies. Built for phones.",
    cls: "p-chat",
    html: `<div class="h"><i></i><div>Angel Lakra<small>online</small></div></div><div class="log"><div class="m in">Hi! I'm Angel 👋</div><div class="m out">I run a business</div><div class="m in">Then we'll get along 😄 Billing, stock, cash counts…</div><div class="m in"><span class="lc">Lily Cafe POS</span>Running in a cafe right now.</div><div class="m out">Hindi mein baat karein?</div></div><div class="chips"><span>Show me your work</span><span>How do I reach you?</span></div>`,
  },
  {
    id: "ask",
    title: "Ask Angel",
    tags: ["recruiters", "interactive", "ai"],
    line: "Ask anything. The AI only picks which of Angel's own cards answers.",
    cls: "p-ask",
    html: `<div class="q">Ask me <em>anything</em> about my work.</div><div class="box"><div class="typed"><span>Have you built anything with FastAPI?</span><span>kya aap billing software bana sakte ho?</span><span>How do you stop an LLM making up numbers?</span></div><b>Ask</b></div><div class="ans"><div class="rt">routed by Claude → <i>card: lily</i> <i>hinglish</i></div><div class="bd"><strong>Lily Cafe POS</strong><u></u><u style="width:85%"></u><u style="width:65%"></u></div></div>`,
  },
  {
    id: "ink",
    title: "After Hours",
    tags: ["clients", "story"],
    line: "A pen-and-ink desk draws itself as you scroll, until the sun comes up.",
    cls: "p-ink",
    html: `<span class="t">after hours</span><svg viewBox="0 0 320 200" aria-hidden="true"><path pathLength="1" d="M10 160 L310 160 M10 168 L310 168 M30 168 L30 200 M290 168 L290 200"/><path pathLength="1" d="M70 158 L150 158 L158 168 L62 168 Z M76 158 L76 100 L146 100 L146 158"/><path pathLength="1" d="M90 115 L120 115 M90 125 L134 125 M90 135 L112 135 M90 145 L128 145"/><path pathLength="1" d="M30 158 L22 120 L52 92 L68 90 L76 108 L44 112 Z"/><path pathLength="1" d="M190 20 L300 20 L300 110 L190 110 Z M245 20 L245 110 M190 65 L300 65"/><path pathLength="1" d="M276 44 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0"/><path pathLength="1" d="M180 158 L214 158 L212 128 L182 128 Z M184 128 L184 104 Q186 96 198 94 L214 92 L212 128"/></svg>`,
  },
];
