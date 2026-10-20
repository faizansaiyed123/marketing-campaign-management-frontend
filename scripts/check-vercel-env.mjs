const value = process.env.VITE_API_URL;

function fail(message) {
  console.error(`Vercel production build configuration error: ${message}`);
  process.exit(1);
}

if (!value || !value.trim()) {
  fail("set VITE_API_URL in the Vercel Production environment before deploying.");
}

let apiUrl;
try {
  apiUrl = new URL(value);
} catch {
  fail("VITE_API_URL must be an absolute HTTPS API origin.");
}

if (
  apiUrl.protocol !== "https:" ||
  !apiUrl.hostname ||
  apiUrl.username ||
  apiUrl.password ||
  !["", "/"].includes(apiUrl.pathname) ||
  apiUrl.search ||
  apiUrl.hash
) {
  fail("VITE_API_URL must be an HTTPS origin without credentials, path, query, or fragment.");
}

const hostname = apiUrl.hostname.toLowerCase().replace(/\.$/, "");
const reservedHosts = new Set([
  "localhost",
  "example.com",
  "example.org",
  "example.net",
  "127.0.0.1",
  "[::1]",
]);
if (
  reservedHosts.has(hostname) ||
  hostname.startsWith("127.") ||
  [".example", ".invalid", ".test", ".localhost"].some(suffix => hostname.endsWith(suffix))
) {
  fail("VITE_API_URL must use the real public API hostname, not a localhost or example placeholder.");
}

console.log(`Validated public API origin: ${apiUrl.origin}`);
