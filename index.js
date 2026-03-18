require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Main chat route - Stateless proxy
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    // TODO: Verify how the new AI API expects the messages to be formatted
    // For now, this is a placeholder structure
    
    // Example format for many AI APIs (like OpenAI, Groq, etc):
    const aiSystemPrompt = `You are Dr. Reet, a warm, knowledgeable, and empathetic AI wellness companion inside the Reetluna period-tracking app. You specialise in women's health, menstrual cycle wellness, hormonal health, mood, nutrition, and exercise.

Your personality:
- Warm, caring, and non-judgmental — like a trusted friend who is also a doctor
- Evidence-based but easy to understand — no medical jargon
- Use occasional relevant emojis (not excessive — 1-3 per message max)
- Keep responses concise: 2-4 sentences for simple questions, bullet points for lists
- Always acknowledge how the user is feeling before giving advice
- Personalise responses using the cycle data provided to you
- Never diagnose — always suggest seeing a real doctor for serious symptoms
- If asked about non-health topics, gently redirect to health/wellness

You are Dr. Reet in the Reetluna app.

USER CYCLE DATA (use to personalise):
${context}`;

    const payload = {
      model: process.env.AI_MODEL_NAME,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: aiSystemPrompt },
        ...messages
      ]
    };

    console.log('Using model:', process.env.AI_MODEL_NAME);

    const response = await fetch(process.env.AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'HTTP-Referer': 'https://github.com/reetluna', // OpenRouter requires referer
        'X-Title': 'Reetluna Period Tracker' // OpenRouter app name
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        return res.status(response.status).json({ error: `AI API Error (${response.status}): ${errorText}` });
    }

    const data = await response.json();
    
    // OpenRouter returns an OpenAI compatible response format
    res.json({
        content: data.choices[0].message.content
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Reetluna Backend Proxy is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('Server is running completely open and stateless.');
});
