// Pure hostname/domain-matching helpers extracted from the background
// script's hostname logic (src/js/background.js).

export function normalizeHostname(hostname) {
  if (typeof hostname !== "string") return "";
  return hostname.trim().toLowerCase().replace(/\.+$/, "");
}

// Does `hostname` match `domain`? Yes when it is the domain itself or a
// subdomain of it: a dot-boundary, case-insensitive comparison, so
// "notmobiliar.ch" and "mobiliar.ch.evil.com" do not match "mobiliar.ch".
export function hostnameMatchesDomain(hostname, domain) {
  const h = normalizeHostname(hostname);
  const d = normalizeHostname(domain);
  if (!h || !d) return false;
  return h === d || h.endsWith("." + d);
}

// The extension's "tld+1" (second-level/registrable domain): the last two
// labels of a valid multi-label, non-IP hostname; the hostname otherwise.
export function getRegistrableDomain(hostname) {
  const h = normalizeHostname(hostname);
  if (!h || !h.includes(".") || /^\d+(\.\d+)*$/.test(h)) return h;
  const tldPlusOne = h.split(".").slice(-2).join(".");
  return tldPlusOne === h ? h : tldPlusOne;
}
