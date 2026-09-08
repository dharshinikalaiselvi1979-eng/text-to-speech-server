
**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to convert. Max length set by `MAX_TEXT_LENGTH` (default 500). |
| `language` | string | Yes | Language code, e.g. `en`, `hi`, `gu`, `mr`, `es`, `fr`, `de`. |
| `voice` | string | No | Voice name, e.g. `"English Voice 1"`. Must belong to the selected language if provided. |

**Example Request**
```json
{
  "text": "Hello, welcome to the app.",
  "language": "en",
  "voice": "English Voice 1"
}
```

### Responses

**200 OK** — speech generated successfully
```json
{
  "success": true,
  "audioUrl": "/audio/speech-1788860491602.mp3",
  "filename": "speech-1788860491602.mp3"
}
```

**400 Bad Request** — Content-Type is not `application/json`
```json
{ "success": false, "error": "Content-Type must be application/json." }
```

**400 Bad Request** — text missing or empty
```json
{ "success": false, "error": "Text must not be empty." }
```

**400 Bad Request** — text exceeds max length
```json
{ "success": false, "error": "Text exceeds max length of 500 characters." }
```

**400 Bad Request** — unsupported language
```json
{ "success": false, "error": "Language 'xx' is not supported." }
```

**400 Bad Request** — voice does not exist
```json
{ "success": false, "error": "Voice 'Unknown Voice' does not exist." }
```

**400 Bad Request** — voice does not belong to the selected language
```json
{ "success": false, "error": "Voice 'Hindi Voice 1' does not belong to language 'en'." }
```

**429 Too Many Requests** — rate limit exceeded (20 requests/minute per client)
```json
{ "success": false, "error": "Too many requests, please try again later." }
```

**503 Service Unavailable** — TTS generation failed (e.g. Edge TTS service unreachable)
```json
{ "success": false, "error": "TTS service unavailable." }
```

---

## GET /api/voices

Returns all available voices.

**Example Response — 200 OK**
```json
{
  "voices": [
    { "name": "English Voice 1", "language": "en", "gender": "Female", "edgeVoice": "en-US-JennyNeural" },
    { "name": "English Voice 2", "language": "en", "gender": "Male", "edgeVoice": "en-US-GuyNeural" },
    { "name": "Hindi Voice 1", "language": "hi", "gender": "Female", "edgeVoice": "hi-IN-SwaraNeural" }
  ]
}
```

---

## GET /api/download/:filename

Downloads a previously generated audio file.

**URL Parameter**
| Param | Description |
|---|---|
| `filename` | Filename returned by `POST /api/tts`, e.g. `speech-1788860491602.mp3` |

**Responses**

**200 OK** — returns the audio file as a download (`Content-Disposition: attachment`)

**404 Not Found** — file doesn't exist or has already been auto-deleted (files expire 10 minutes after generation)
```json
{ "success": false, "error": "Audio file not found." }
```

---

## GET /api/health

Basic health check.

**200 OK**
```json
{ "status": "ok" }
```

---

## GET /audio/:filename

Not under `/api` — serves generated audio files directly for in-browser playback (used by the `<audio>` element's `src`). Same expiry rules as the download endpoint.

---

## Unmatched Routes

**404 Not Found** — any route not defined above
```json
{ "success": false, "error": "Not found" }
```

---

## Unhandled Server Errors

**500 Internal Server Error** — unexpected crash caught by the global error handler
```json
{ "success": false, "error": "Internal server error" }
```

---

## Status Code Summary

| Code | Meaning | When |
|---|---|---|
| 200 | Success | Request completed normally |
| 400 | Invalid request | Validation failure (text, language, voice, Content-Type) |
| 404 | Not found | Unknown route, or audio file expired/missing |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Internal server error | Unexpected server-side crash |
| 503 | Service unavailable | TTS provider failed to generate audio |