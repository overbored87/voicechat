# Voice Chatbot

A web-based voice assistant powered by **Claude Sonnet** (LLM + speech-to-text) and **ElevenLabs** (text-to-speech). Fully iOS-compatible with a push-to-talk interface.

## Architecture

```
User speaks → MediaRecorder (WebM/MP4) → Claude STT → Claude Sonnet chat → ElevenLabs TTS → Audio playback
```

**Backend** (Express.js):
- `POST /api/transcribe` — sends audio to Claude for transcription
- `POST /api/chat` — sends text to Claude Sonnet, returns ≤50-word response
- `POST /api/speak` — converts text to speech via ElevenLabs

**Frontend** (vanilla HTML/CSS/JS):
- Push-to-talk button with real-time audio visualizer
- Chat bubble display for conversation history
- iOS Safari compatible (uses `audio/mp4` fallback)

## Local Development

1. Clone and install:
   ```bash
   git clone <your-repo-url>
   cd voice-chatbot
   npm install
   ```

2. Create a `.env` file (or export variables):
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   export ELEVENLABS_API_KEY=xi-...
   export ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb  # optional, has default
   ```

3. Start:
   ```bash
   node server.js
   ```

4. Open `http://localhost:3000`

## Deploy to Render

### Option A: Blueprint (recommended)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo — Render reads `render.yaml` automatically
5. Set environment variables when prompted:
   - `ANTHROPIC_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID` (optional)

### Option B: Manual Web Service

1. Push to GitHub
2. Render → **New** → **Web Service**
3. Connect repo
4. Settings:
   - **Runtime**: Node
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
5. Add env vars under **Environment**:
   - `ANTHROPIC_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID` (optional)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `ELEVENLABS_API_KEY` | Yes | Your ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | No | ElevenLabs voice ID (default: George) |
| `PORT` | No | Server port (default: 3000) |

## ElevenLabs Voice IDs

Some popular voices to use:
- `JBFqnCBsd6RMkjVDRZzb` — George (default)
- `21m00Tcm4TlvDq8ikWAM` — Rachel
- `EXAVITQu4vr4xnSDxMaL` — Bella
- `ErXwobaYiN019PkySvjV` — Antoni

Find more at [ElevenLabs Voice Library](https://elevenlabs.io/voice-library).

## Notes

- The chatbot's responses are capped at 50 words for natural voice conversation
- iOS Safari uses `audio/mp4` recording format; desktop browsers use `audio/webm`
- Conversation history is maintained in-browser (last 10 exchanges)
