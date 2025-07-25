require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

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

const { saveMessage, getRecentMessages } = require('./memory');

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  // 🧠 Pull from MongoDB memory
  const history = await getRecentMessages(sessionId);

  const messages = [
    systemMessage,
    ...history.reverse().map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: message }
  ];

  // 🔥 Call LLaMA with full chat context
 const llamaResponse = await axios.post(
  "https://api.llama.com/v1/chat/completions",
  {
    messages: messages,
    model: "Llama-4-Maverick-17B-128E-Instruct-FP8", // or whatever model you’re using
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
);

  const reply = llamaResponse.data.completion_message.content.text;

  await saveMessage(sessionId, "user", message);
  await saveMessage(sessionId, "assistant", reply);

  res.json({ reply });
});

app.listen(5000, () => console.log('⚡ Sparki backend running on http://localhost:5000'));
