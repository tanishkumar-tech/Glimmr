const express = require('express');
const Product = require('../models/Product');
const axios = require('axios');

const router = express.Router();

// Prefer environment variable; fallback to provided key
const AI_API_KEY = process.env.GOOGLE_AI_KEY || "AIzaSyA5mLdJMNUdxvPIkjRXkkMtBSsWZqy20AY";

// -------------------------------
//   FIXED GEMINI REQUEST
// -------------------------------
async function askAIContent(systemInstruction, historyMessages) {
  try {
    // 1. Map messages to Gemini API Format
    // Gemini ONLY accepts roles: 'user' or 'model'.
    const formattedContents = historyMessages.map(m => ({
      role: m.role === 'assistant' || m.role === 'bot' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // 2. Prepare the Payload
    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: formattedContents,
      generationConfig: {
        responseMimeType: "text/plain", // Use "application/json" if you want ONLY JSON, but text/plain is safer for mixed chat
      }
    };

    // 3. Send Request
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`,
      payload,
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    );

  } catch (err) {
    // Log detailed error for debugging
    console.error("AI API Error Details:", err.response?.data?.error || err.message);
    throw err;
  }
}

// ------------------------------------------
// UNIVERSAL /api/recommend ENDPOINT
// ------------------------------------------
router.post("/", async (req, res) => {
  const { preferences, messages } = req.body;

  try {
    let recommendations = [];
    let chatResponse = "";

    let analysis = {
      categories: [],
      materials: [],
      budget_min: null,
      budget_max: null,
      style: []
    };

    // 1. Define the System Prompt (The Rules)
    const systemPrompt = `
      You are Glimmr's AI assistant. Help with ANY topic.
      
      CRITICAL INSTRUCTION:
      If the user implies they want to buy products, search, or browse, you MUST output a JSON block at the end of your response.
      
      Format:
      \`\`\`json
      {"search":{"categories":["rings", "necklaces"],"materials":["gold"],"budget_max":5000}}
      \`\`\`
      
      If the user is just saying "hello" or asking general questions, do NOT output JSON.
    `;

    // 2. Build Conversation History
    const history = [];

    // If existing chat history exists, format it
    if (Array.isArray(messages)) {
      messages.forEach(m => {
        if (m?.text) {
          history.push({
            role: m.sender === "bot" ? "assistant" : "user",
            content: m.text
          });
        }
      });
    } 
    // If no history, but we have initial preferences (e.g. from a quiz)
    else if (preferences) {
      history.push({ role: "user", content: preferences });
    }

    // Ensure we have at least one message to send
    if (history.length === 0) {
      history.push({ role: "user", content: "Hello, what can you help me with?" });
    }

    // 3. CALL GEMINI AI
    let aiReply = '';
    try {
      aiReply = await askAIContent(systemPrompt, history);
      chatResponse = aiReply;
    } catch (e) {
      console.error("Gemini Failure:", e.message);
      chatResponse = "I'm having trouble connecting to my brain right now, but I'll look for products for you.";
      // Fallback: If AI fails, we can't extract JSON, but we proceed gracefully
    }

    // 4. Extract JSON (Robust Regex)
    // specific regex to find JSON inside markdown blocks
    const jsonMatch = aiReply.match(/```json\s*(\{[\s\S]*?\})\s*```/) || aiReply.match(/```\s*(\{[\s\S]*?\})\s*```/);

    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[1]);
        if (extracted.search) {
          const s = extracted.search;

          analysis.categories = s.categories || [];
          analysis.materials = s.materials || [];
          analysis.budget_min = s.budget_min || null;
          analysis.budget_max = s.budget_max || null;

          // Remove the JSON block from the text shown to the user
          chatResponse = aiReply.replace(/```json[\s\S]*?```/g, "").replace(/```[\s\S]*?```/g, "").trim();
        }
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }

    // 5. Build MongoDB Query
    const q = {};
    if (analysis.categories.length) {
      // Case-insensitive regex match for better results
      q.category = { $in: analysis.categories.map(c => new RegExp(c, 'i')) };
    }
    
    if (analysis.materials.length) {
       q.material = { $in: analysis.materials.map(m => new RegExp(m, 'i')) };
    }

    if (analysis.budget_min || analysis.budget_max) {
      q.price = {};
      if (analysis.budget_min) q.price.$gte = analysis.budget_min;
      if (analysis.budget_max) q.price.$lte = analysis.budget_max;
    }

    // 6. Execute Query
    if (Object.keys(q).length > 0) {
      recommendations = await Product.find(q)
        .sort({ createdAt: -1 })
        .limit(12);

      // Fallback: If strict search yields nothing, relax the price constraint
      if (recommendations.length === 0 && q.price) {
        delete q.price;
        recommendations = await Product.find(q)
          .sort({ createdAt: -1 })
          .limit(8);
      }
    } else {
      // Default / "New Arrivals" if no specific query
      recommendations = await Product.find()
        .sort({ createdAt: -1 })
        .limit(4);
    }

    res.json({ recommendations, analysis, chatResponse });

  } catch (err) {
    console.error("Recommend endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;