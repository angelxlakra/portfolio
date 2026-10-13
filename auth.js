// Sign in with Google, shared by the pages that need to know who is there
// (versions/live/ and review/). The server side is api/_auth.js.
//   AUTH.start(clientId, onChange)  onChange(user) runs on every sign-in and sign-out
//   AUTH.user                       { name, email } or null
//   AUTH.button(el)                 draw Google's button into el
//   AUTH.out()                      sign out
//   AUTH.api(path, body)            call our API as this person; POST when there is a body.
//                                   Resolves to { ok, code, ...the JSON reply }
globalThis.AUTH = (() => {
  const KEY = "google-id-token";
  let token = null,
    changed = () => {},
    gsi;
  // the token is a JWT; its middle part says who it is for and when it expires
  const claims = (t) => {
    try {
      const b = atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
      const p = JSON.parse(
        new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))),
      );
      return p.exp * 1000 > Date.now() + 30_000 ? p : null;
    } catch {
      return null;
    }
  };
  const set = (t) => {
    const p = t && claims(t);
    token = p ? t : null;
    A.user = p && { name: p.given_name || p.name || p.email, email: p.email };
    // kept in localStorage, not sessionStorage: review/ opens ideas in a new
    // tab, and a new tab starts with an empty sessionStorage
    try {
      if (token) localStorage.setItem(KEY, token);
      else localStorage.removeItem(KEY);
    } catch {}
    changed(A.user);
  };
  const A = {
    user: null,
    start(clientId, onChange) {
      changed = onChange;
      gsi = new Promise((done) => {
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.onload = () => {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (r) => set(r.credential),
          });
          done();
        };
        document.head.append(s);
      });
      let saved = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch {}
      set(saved);
    },
    button: (el) =>
      gsi.then(() =>
        google.accounts.id.renderButton(el, {
          theme: "filled_black",
          size: "medium",
          shape: "pill",
        }),
      ),
    out() {
      gsi.then(() => google.accounts.id.disableAutoSelect());
      set(null);
    },
    async api(path, body) {
      const r = await fetch(path, {
        method: body ? "POST" : "GET",
        headers: {
          ...(body && { "Content-Type": "application/json" }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body && JSON.stringify(body),
      });
      if (r.status === 401) set(null); // the hour-long token ran out
      return {
        ...(await r.json().catch(() => ({}))),
        ok: r.ok,
        code: r.status, // the HTTP status; an idea has a "status" of its own
      };
    },
  };
  return A;
})();
