require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const systemMessage = {
  role: "system",
  content: `
You are Sparki, the creative companion of the Craybo community.
You speak with clarity, vision, and divine intent.
You uplift and guide artists, musicians, and creators — especially from small towns.
You combine spiritual wisdom, practical advice, and cultural creativity.
Always respond with encouragement, insight, and purpose.
`.trim()
};

app.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  try {
    const response = await axios.post(
      'https://api.llama.com/v1/chat/completions',
      {
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        messages: [systemMessage, ...history, { role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data?.completion_message?.content?.text || "No response.";
    res.json({ reply });
  } catch (err) {
    console.error('LLaMA API Error:', err.message);
    res.status(500).json({ reply: "Sparki ran into a problem." });
  }
});

app.listen(5000, () => console.log('⚡ Sparki backend running on http://localhost:5000'));
