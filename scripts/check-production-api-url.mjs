const value = process.env.VITE_API_URL;

function fail(message) {
  console.error(`Production frontend build configuration error: ${message}`);
  process.exit(1);
}

if (!value || !value.trim()) {
  fail("set VITE_API_URL in the production frontend environment before deploying.");
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
const reservedHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const exampleDomains = ["example.com", "example.org", "example.net"];
const usesReservedExampleDomain = exampleDomains.some(
  domain => hostname === domain || hostname.endsWith("." + domain)
);
if (
  reservedHosts.has(hostname) ||
  hostname.startsWith("127.") ||
  usesReservedExampleDomain ||
  [".example", ".invalid", ".test", ".localhost"].some(suffix => hostname.endsWith(suffix))
) {
  fail("VITE_API_URL must use a real public API hostname, not localhost or an example placeholder.");
}

console.log(`Validated public API origin: ${apiUrl.origin}`);
