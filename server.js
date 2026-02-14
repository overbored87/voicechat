import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

let anthropic;
try {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} catch (e) {
  console.warn("Anthropic SDK init deferred — ANTHROPIC_API_KEY not set yet");
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

app.use(express.json());

const publicPath = join(__dirname, "public");
const indexPath = join(publicPath, "index.html");

console.log("__dirname:", __dirname);
console.log("publicPath:", publicPath);
console.log("index.html exists:", fs.existsSync(indexPath));

app.use(express.static(publicPath));

function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// POST /api/chat — Send text to Claude Sonnet and get a response
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const messages = [
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system:
        "You are a friendly, concise AI voice assistant. Keep every response under 50 words. Never use lists, bullet points, or numbered items. Speak in natural, conversational sentences. Be warm and helpful.",
      messages,
    });

    const reply =
      response.content[0]?.text || "Sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed", details: error.message });
  }
});

// POST /api/speak — Convert text to speech via ElevenLabs
app.post("/api/speak", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs error:", errText);
      return res
        .status(response.status)
        .json({ error: "TTS failed", details: errText });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "TTS failed", details: error.message });
  }
});

// Catch-all: serve index.html
app.get("*", (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`index.html not found at ${indexPath}`);
  }
});

app.listen(PORT, () => {
  console.log(`Voice chatbot server running on port ${PORT}`);
});
