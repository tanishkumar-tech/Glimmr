const axios = require('axios');
const { exec } = require('child_process');

// Helper to safely stringify messages for curl without allowing command injection.
function buildJsonPayload(messages, model = 'deepseek-chat') {
  return JSON.stringify({ model, messages });
}

// Primary axios-based implementation
async function axiosAskAI(messages, { timeout = 12000, temperature = 0.3, max_tokens = 256 } = {}) {
  const token = process.env.DEEPSEEK_API_KEY;
  if (!token) throw new Error('DEEPSEEK_API_KEY not set');
  const resp = await axios.post('https://api.deepseek.com/chat/completions', {
    model: 'deepseek-chat',
    messages,
    temperature,
    max_tokens,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout,
  });
  return resp.data;
}

// curl/exec fallback (opt-in with DEEPSEEK_USE_CURL=true)
function curlAskAI(messages, { temperature = 0.3, max_tokens = 256 } = {}) {
  return new Promise((resolve, reject) => {
    const token = process.env.DEEPSEEK_API_KEY;
    if (!token) return reject(new Error('DEEPSEEK_API_KEY not set'));
    const payload = buildJsonPayload({ model: 'deepseek-chat', messages, temperature, max_tokens });
    // Escape single quotes for safe embedding in single-quoted -d string
    const safe = payload.replace(/'/g, "'\\''");
    const cmd = `curl -s https://api.deepseek.com/chat/completions \\n+      -H 'Content-Type: application/json' \\n+      -H 'Authorization: Bearer ${token}' \\n+      -d '${safe}'`;
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      try { resolve(JSON.parse(stdout)); } catch (e) { reject(e); }
    });
  });
}

async function askAI(messages, options = {}) {
  const useCurl = String(process.env.DEEpSEEK_USE_CURL || process.env.DEEPSEEK_USE_CURL || '').toLowerCase() === 'true';
  try {
    return useCurl ? await curlAskAI(messages, options) : await axiosAskAI(messages, options);
  } catch (primaryErr) {
    // Fallback to curl if axios fails or vice versa
    if (!useCurl) {
      try { return await curlAskAI(messages, options); } catch (secondaryErr) { throw secondaryErr; }
    }
    throw primaryErr;
  }
}

module.exports = { askAI };
