// Safe placeholder seeder used by server during development.
// Keeps a minimal, synchronous-safe ensureSeed export so the server
// can require it without pulling in large code or risking side effects.

async function ensureSeed(minPerCategory = 50) {
  console.log(`Safe seeder: ensureSeed called with minPerCategory=${minPerCategory} (no-op).`);
}

module.exports = { ensureSeed };
