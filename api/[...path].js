const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function backendOrigin() {
  const configured = process.env.BACKEND_API_URL?.trim();
  if (!configured) return null;

  let origin;
  try {
    origin = new URL(configured);
  } catch {
    throw new Error("BACKEND_API_URL must be a valid HTTPS origin.");
  }

  const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (
    (origin.protocol !== "https:" && !(localHost && origin.protocol === "http:")) ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error(
      "BACKEND_API_URL must be an HTTPS origin without credentials, path, query, or fragment."
    );
  }

  return origin;
}

function requestBody(req) {
  if (req.body === undefined || req.body === null) return undefined;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return req.body;
  return JSON.stringify(req.body);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const method = (req.method || "GET").toUpperCase();
  if (method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (!ALLOWED_METHODS.has(method)) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE, OPTIONS");
    return json(res, 405, { detail: "Method not allowed." });
  }

  let incoming;
  try {
    incoming = new URL(req.url || "/", `https://${req.headers.host || "vercel.local"}`);
  } catch {
    return json(res, 400, { detail: "Invalid API request path." });
  }

  if (!incoming.pathname.startsWith("/api/v1/")) {
    return json(res, 404, { detail: "API route not found." });
  }

  let origin;
  try {
    origin = backendOrigin();
  } catch (error) {
    return json(res, 500, { detail: error.message });
  }
  if (!origin) {
    return json(res, 503, {
      detail:
        "Campaign API is not configured. Deploy the campaign-management backend and set BACKEND_API_URL in Vercel."
    });
  }

  const target = new URL(`${incoming.pathname}${incoming.search}`, origin);
  const headers = new Headers();
  for (const name of [
    "accept",
    "content-type",
    "cookie",
    "origin",
    "sec-fetch-site",
    "user-agent"
  ]) {
    const value = req.headers[name];
    if (typeof value === "string" && value.length > 0) headers.set(name, value);
  }

  let upstream;
  try {
    const body = requestBody(req);
    upstream = await fetch(target, {
      method,
      headers,
      ...(body === undefined || method === "GET" ? {} : { body }),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    return json(res, 502, {
      detail:
        "Could not reach the campaign backend. Check BACKEND_API_URL and the backend service health."
    });
  }

  res.statusCode = upstream.status;
  for (const name of [
    "content-type",
    "cache-control",
    "pragma",
    "retry-after",
    "location",
    "www-authenticate",
    "clear-site-data"
  ]) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie")]
        : [];
  if (setCookies.length) res.setHeader("Set-Cookie", setCookies);

  const responseBytes = Buffer.from(await upstream.arrayBuffer());
  return res.end(responseBytes);
}
