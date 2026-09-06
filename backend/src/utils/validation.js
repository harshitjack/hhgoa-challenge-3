/**
 * Helper validation utilities
 */

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof uuid === "string" && uuidRegex.test(uuid);
};

const isValidHexHash = (hash) => {
  const hashRegex = /^(0x)?[0-9a-f]{64}$/i;
  return typeof hash === "string" && hashRegex.test(hash);
};

const isSafeUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    // Disallow dangerous or local protocols (SSRF protection)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    // Block localhost, 127.0.0.1, internal metadata IPs (169.254.169.254)
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "169.254.169.254" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  isValidUUID,
  isValidHexHash,
  isSafeUrl,
};
