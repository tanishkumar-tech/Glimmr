const blacklist = new Map();

function addToken(token, expiresAt) {
  const ttl = Math.max(0, expiresAt - Date.now());
  blacklist.set(token, Date.now() + ttl);
}

function isBlacklisted(token) {
  const until = blacklist.get(token);
  if (!until) return false;
  if (Date.now() > until) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [t, until] of blacklist.entries()) {
    if (now > until) blacklist.delete(t);
  }
}, 60 * 1000).unref();

module.exports = { addToken, isBlacklisted };
