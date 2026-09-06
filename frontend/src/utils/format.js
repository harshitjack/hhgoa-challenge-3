/**
 * Formatting helpers for hashes, similarity scores, timestamps, and numbers
 */

export const truncateHash = (hash, startLen = 8, endLen = 6) => {
  if (!hash || typeof hash !== "string") return "—";
  if (hash.length <= startLen + endLen) return hash;
  return `${hash.slice(0, startLen)}...${hash.slice(-endLen)}`;
};

export const formatSimilarity = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "0.0%";
  const num = typeof val === "number" ? val : parseFloat(val);
  // If val is already in percentage format (e.g. 82.4), keep it; otherwise multiply by 100
  const pct = num <= 1.0 ? num * 100 : num;
  return `${pct.toFixed(1)}%`;
};

export const formatTimestamp = (ts) => {
  if (!ts) return "—";
  try {
    // Check if unix seconds or ISO string or ms
    const date = typeof ts === "number" && ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);
    if (isNaN(date.getTime())) return String(ts);
    return date.toISOString().replace("T", " ").replace("Z", " UTC");
  } catch (err) {
    return String(ts);
  }
};

export const formatTimeOnly = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toTimeString().split(" ")[0];
};
