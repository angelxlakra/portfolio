import "../content.js";

// Sign in with Google. The browser gets an ID token from Google and sends it
// as "Authorization: Bearer <token>". who(req) returns { email, name, admin }
// when Google signed that token for this site, and null otherwise.
// Needs GOOGLE_CLIENT_ID. ADMIN_EMAILS (comma separated) says who may review;
// it defaults to the email in content.js.
const CERTS = "https://www.googleapis.com/oauth2/v3/certs";
let keys = [],
  keysAt = 0;
const bytes = (b64url) =>
  Uint8Array.from(atob(b64url.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0),
  );
const parse = (b64url) => JSON.parse(new TextDecoder().decode(bytes(b64url)));

export async function who(req) {
  const aud = process.env.GOOGLE_CLIENT_ID;
  const [h, p, sig] = (req.headers.get("authorization") || "")
    .replace(/^Bearer /, "")
    .split(".");
  if (!aud || !sig) return null;
  try {
    const head = parse(h),
      claims = parse(p);
    // Google rotates its signing keys: refetch hourly, or for an unknown key
    let jwk = keys.find((k) => k.kid === head.kid);
    if (!jwk || Date.now() - keysAt > 3600_000) {
      keys = (await (await fetch(CERTS)).json()).keys;
      keysAt = Date.now();
      jwk = keys.find((k) => k.kid === head.kid);
    }
    if (!jwk || head.alg !== "RS256") return null;
    const alg = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
    const key = await crypto.subtle.importKey("jwk", jwk, alg, false, [
      "verify",
    ]);
    const signed = await crypto.subtle.verify(
      alg,
      key,
      bytes(sig),
      new TextEncoder().encode(`${h}.${p}`),
    );
    if (
      !signed ||
      claims.aud !== aud ||
      !/^(https:\/\/)?accounts\.google\.com$/.test(claims.iss) ||
      !(claims.exp * 1000 > Date.now()) ||
      claims.email_verified !== true
    )
      return null;
    const email = claims.email.toLowerCase();
    const admins = (process.env.ADMIN_EMAILS || globalThis.CONTENT.email)
      .toLowerCase()
      .split(/[\s,]+/);
    return {
      email,
      name: claims.given_name || claims.name || "Someone",
      admin: admins.includes(email),
    };
  } catch {
    return null;
  }
}
