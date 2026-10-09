// The one place facts about Angel live. Every page and the share image
// (api/og.js) read from here. Edit a value and it changes everywhere.
// Loaded as a plain <script> in pages and as a side-effect import in api/og.js.
globalThis.CONTENT = {
  profile: {
    name: "Angel Lakra",
    initials: "AL",
    role: "Full-stack engineer",
    roleLine: "Full-stack engineer, Python first.",
    city: "Bengaluru",
    timezone: "IST",
    where: "remote or hybrid",
    status: "Open to work",
    roles: ["contract", "freelance", "full-time"],
  },
  email: "ngellakra@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/ngllakra",
    github: "https://github.com/angelxlakra",
  },
  // Newest first. start/end are YYYY-MM; end: null means current.
  experience: [
    {
      id: "now",
      company: "Chain Labs",
      title: "Senior Software Developer",
      type: "Freelance",
      place: "remote",
      start: "2025-06",
      end: null,
      note: "Python and LLM work, freelance",
      text: "Python and LLM work for Chain Labs on a freelance basis, alongside systems I build for my own clients.",
    },
    {
      id: "lead",
      company: "Chain Labs",
      title: "Frontend Tech Lead",
      type: "Full-time",
      start: "2021-07",
      end: "2025-02",
      note: "dApp frontends, minting and event pages",
      text: "Led frontend for a blockchain product studio: minting pages, event platforms and dApp frontends in TypeScript, React and Next.js.",
      repos: [
        {
          id: "mint",
          name: "Simplr collection mint",
          text: "The minting page for the Simplr collection dApp.",
        },
        {
          id: "events",
          name: "Simplr events",
          text: "Event platform server work for Simplr.",
        },
        {
          id: "smac",
          name: "SMAC website",
          text: "Frontend for the SMAC website.",
        },
        {
          id: "anti",
          name: "Antigravity Era 3",
          text: "The beta repository for Antigravity Era 3.",
        },
        { id: "dsafe", name: "dSafe", text: "Frontend for dSafe." },
        {
          id: "wagmi",
          name: "wagmi Magic connector",
          text: "A wagmi connector for signing in with the Magic SDK.",
        },
      ],
    },
    {
      id: "intern",
      company: "Yellow Class",
      title: "Frontend Developer",
      type: "Internship",
      start: "2021-01",
      end: "2021-06",
      note: "Internship",
      text: "Frontend internship at an ed-tech startup.",
    },
  ],
  education: {
    school: "Birla Institute of Technology, Mesra",
    short: "BIT Mesra",
  },
  // kind + status make the label ("Point of sale · in daily use").
  // live: true gives the status a green "live" look where a page has one.
  // hi (Devanagari) and hinglish are used by the signboard and Ask pages.
  projects: [
    {
      id: "lily",
      group: "Client work",
      name: "Lily Cafe POS",
      kind: "Point of sale",
      status: "In daily use",
      live: true,
      client: "Lily Cafe by Mary's Kitchen, Ranchi",
      short:
        "Waiters order from phones, the kitchen gets a printed chit, the owner closes the day with a cash count.",
      text: "The cafe's whole counter in one system: waiters take orders on their phones, the kitchen gets a printed chit, and the owner closes the day with a cash count and a report.",
      facts: [
        "Table orders, partial serving, and split payments across UPI, cash and card",
        "GST billing with a CGST/SGST split; every amount stored in paise",
        "A Windows print agent drives 80mm receipts and kitchen chits from the cloud backend",
        "“Ask” answers questions in English, Hindi or Hinglish. The model only picks the report and the period; the backend computes every figure, so it can't invent a number",
        "A deploy script that refuses to ship anything except a clean origin/main, then checks production is running that exact commit",
      ],
      stack: [
        "FastAPI",
        "SQLAlchemy 2",
        "React 18",
        "TypeScript",
        "Tailwind v4",
        "Fly.io",
        "Vercel",
        "MCP",
      ],
      links: [
        ["Source on GitHub", "https://github.com/angelxlakra/lily-cafe-pos"],
      ],
      hi: "लिली कैफ़े, राँची",
      hinglish: "Ek cafe ka poora counter, ek system mein.",
    },
    {
      id: "salon",
      group: "Client work",
      name: "Aasan",
      kind: "Salon management",
      status: "In daily use",
      live: true,
      short:
        "Local-first billing, appointments and stock that keep working when the internet doesn't.",
      text: "A local-first POS, appointments, inventory and accounting system for unisex salons. It runs entirely on the salon's own network, so a bad internet day doesn't stop billing.",
      facts: [
        "Owner, receptionist and staff roles with different powers",
        "Appointment conflict detection and nightly backups",
        "Reports generated on a schedule by background workers",
      ],
      stack: [
        "FastAPI",
        "PostgreSQL",
        "Redis + RQ",
        "Next.js 14",
        "Docker Compose",
        "Nginx",
      ],
      links: [
        ["Source on GitHub", "https://github.com/angelxlakra/efs-salon-os"],
      ],
      hinglish: "Salon ke liye billing aur appointments, bina internet ke bhi.",
    },
    {
      id: "marys",
      group: "Client work",
      name: "Mary's Kitchen",
      kind: "Brand website",
      status: "Prototypes live",
      live: true,
      client: "Mary's Kitchen and Lily Cafe, Ranchi",
      short:
        "A scroll story for two Ranchi cafes, drawn in pen and ink, with a ramen bowl that comes apart as you scroll.",
      text: "A scroll-driven site for two Ranchi cafes. The story opens at night at the roadside stall and turns to sunrise inside the second cafe, drawn as generated pen-and-ink linework.",
      facts: [
        "Ink illustrations generated in Python and layered as SVG",
        "An “exploded” ramen bowl that comes apart as you scroll",
        "A 3D model of the stall under the trees",
      ],
      stack: ["GSAP", "SVG", "Python", "Vercel"],
      links: [
        ["Ramen bowl", "https://marys-ramen-unfolded.vercel.app"],
        ["3D stall", "https://marys-kitchen-3d.vercel.app"],
      ],
      hi: "विद लव फ़्रॉम मैरी",
      hinglish: "Do cafe ki kahani, ink drawing mein.",
    },
    {
      id: "sop",
      group: "Client work",
      name: "Staff SOP checklists",
      kind: "Operations",
      status: null,
      text: "Daily, weekly and monthly checklists for every post at both cafes, in English and Hindi, so new staff know exactly what their shift owes.",
      facts: [],
      stack: ["Excel", "Process design"],
      links: [],
      hi: "रोज़ का काम",
    },
    {
      id: "disk",
      group: "My own",
      name: "DiskMap",
      kind: "macOS app",
      status: "Side project",
      text: "My own DaisyDisk: a visual map of what's filling a Mac's drive, built in Python and pywebview because I didn't want to pay for one.",
      facts: [],
      stack: ["Python", "pywebview"],
      links: [],
    },
    {
      id: "notch",
      group: "My own",
      name: "Notch app",
      kind: "macOS app",
      status: "Side project",
      text: "A take on Boring Notch, built with my brother, that turns the MacBook notch into a small live surface.",
      facts: [],
      stack: ["macOS"],
      links: [],
    },
    {
      id: "aanka",
      group: "My own",
      name: "Aanka",
      kind: "Personal startup project",
      status: "Early stage",
      text: "My personal startup project: a business partner for shop and salon owners that lives in WhatsApp. It reads the numbers, tells you this week's figure first, points out one thing and suggests one action, in warm Hinglish.",
      facts: [],
      stack: ["WhatsApp", "LLM"],
      links: [],
      image: { src: "/assets/aanka.jpg", alt: "The Aanka brand identity page" },
      hi: "आपका हिसाब, समझ में",
      hinglish: "Aapke business ka partner, WhatsApp par.",
    },
  ],
  toolbox: [
    {
      name: "Backend",
      items: [
        "Python 3.11+",
        "FastAPI, Pydantic",
        "SQLAlchemy, Alembic",
        "PostgreSQL, SQLite, Redis",
      ],
    },
    {
      name: "Frontend",
      items: [
        "TypeScript, React",
        "Next.js, Vite",
        "Tailwind CSS",
        "GSAP, SVG animation",
      ],
    },
    {
      name: "AI",
      items: [
        "LLM routing and tool use",
        "Agents and MCP servers",
        "n8n automation",
      ],
    },
    {
      name: "Shipping",
      items: ["Docker Compose, Nginx", "Fly.io, Vercel", "uv, pytest, ruff"],
    },
  ],
};

// Everything below is derived from the facts above. Don't edit values here.
// It runs once on load; api/og.js runs it again per request for a fresh date.
globalThis.CONTENT.derive = () => {
  const C = globalThis.CONTENT;
  const MON = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  const ym = (s) => s.split("-").map(Number);
  const today = new Date();
  const nowYM = [today.getFullYear(), today.getMonth() + 1];

  C.esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  // dur(44) -> "3 yrs 8 mo"; "short" -> "3y 8m"; "long" -> "3 years 8 months"
  C.dur = (months, style) => {
    const y = Math.floor(months / 12),
      m = months % 12;
    const [yu, mu] = {
      short: ["y", "m"],
      long: [y === 1 ? " year" : " years", m === 1 ? " month" : " months"],
    }[style] || [y === 1 ? " yr" : " yrs", " mo"];
    return [y && y + yu, m && m + mu].filter(Boolean).join(" ");
  };

  C.experience.forEach((e) => {
    const [sy, sm] = ym(e.start),
      [ey, em] = e.end ? ym(e.end) : nowYM;
    e.months = (ey - sy) * 12 + (em - sm) + 1; // both ends inclusive
    const end = e.end ? `${MON[em - 1]} ${ey}` : "now";
    // "Jun 2025 – now", "Jul 2021 – Feb 2025", "Jan – Jun 2021"
    e.when =
      e.end && sy === ey
        ? `${MON[sm - 1]} – ${end}`
        : `${MON[sm - 1]} ${sy} – ${end}`;
    // "2025 – now", "2021 – 2025", "2021"
    e.years = !e.end ? `${sy} – now` : sy === ey ? `${sy}` : `${sy} – ${ey}`;
  });
  C.exp = Object.fromEntries(C.experience.map((e) => [e.id, e]));
  C.project = Object.fromEntries(C.projects.map((p) => [p.id, p]));
  C.projects.forEach((p) => {
    // "Point of sale · in daily use"
    p.label = p.status ? `${p.kind} · ${p.status.toLowerCase()}` : p.kind;
  });

  const P = C.profile;
  C.months = C.experience.reduce((n, e) => n + e.months, 0);
  P.years = Math.floor(C.months / 12) + "+"; // "5+"
  P.rolesLine = `${P.roles.slice(0, -1).join(", ")} or ${P.roles.at(-1)}`; // "contract, freelance or full-time"
  P.rolesDots = P.roles.join(" · "); // "contract · freelance · full-time"
  P.asOf = `${MON[nowYM[1] - 1]} ${nowYM[0]}`; // "Oct 2026"
  C.lead = {
    short: C.dur(C.exp.lead.months, "short"),
    mid: C.dur(C.exp.lead.months),
    long: C.dur(C.exp.lead.months, "long"),
  };
  const bare = (u) => u.replace(/^https?:\/\/(www\.)?/, "");
  C.contacts = [
    { label: "Email", text: C.email, href: "mailto:" + C.email },
    { label: "LinkedIn", text: bare(C.links.linkedin), href: C.links.linkedin },
    { label: "GitHub", text: bare(C.links.github), href: C.links.github },
  ];
  // The headline numbers on the hub and the share image.
  C.highlights = [
    [`${P.years} yrs`, "shipping production software"],
    [C.lead.mid, `${C.exp.lead.title}, ${C.exp.lead.company}`],
    ["2 POS systems", "for a cafe and for salons"],
    ["LLM features", "with guardrails, in Hindi and English"],
  ];

  // Fill static markup: <span data-c="profile.city"></span>,
  // <a data-c-href="links.github">. Pages call CONTENT.bind() once.
  const get = (path) => path.split(".").reduce((o, k) => o?.[k], C);
  C.bind = (root = document) => {
    root
      .querySelectorAll("[data-c]")
      .forEach((el) => (el.textContent = get(el.dataset.c) ?? ""));
    root
      .querySelectorAll("[data-c-href]")
      .forEach((el) => (el.href = get(el.dataset.cHref)));
  };
  // <dl> rows for a contact block; extra is [[label, text], ...]
  C.contactRows = (extra = []) =>
    C.contacts
      .map(
        (c) =>
          `<dt>${c.label}</dt><dd><a href="${c.href}"${c.href.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>${C.esc(c.text)}</a></dd>`,
      )
      .join("") +
    extra.map(([k, v]) => `<dt>${k}</dt><dd>${C.esc(v)}</dd>`).join("");
};
globalThis.CONTENT.derive();
