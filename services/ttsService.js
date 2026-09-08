const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');
const { voices } = require('../utils/voices');

const AUDIO_DIR = path.join(__dirname, '..', 'temp_audio');
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

async function generateSpeech(text, language, voiceName) {
  const voiceEntry = voices.find((v) => v.name === voiceName);
  const edgeVoiceId = voiceEntry ? voiceEntry.edgeVoice : 'en-US-JennyNeural';
  const targetLangCode = voiceEntry ? voiceEntry.language : 'en';

  // Translate only if the target language isn't English.
  // Wrapped in try/catch so a translation-service hiccup never crashes the whole request —
  // it just falls back to speaking the original text.
  let textToSpeak = text;
  if (targetLangCode !== 'en') {
    try {
      const result = await translate(text, { to: targetLangCode });
      textToSpeak = result.text;
    } catch (err) {
      console.error('Translation failed, falling back to original text:', err.message);
    }
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(edgeVoiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioFilePath } = await tts.toFile(AUDIO_DIR, textToSpeak);

  const finalFilename = `speech-${Date.now()}.mp3`;
  const finalFilepath = path.join(AUDIO_DIR, finalFilename);
  fs.renameSync(audioFilePath, finalFilepath);

  setTimeout(() => {
    fs.unlink(finalFilepath, () => {});
  }, 10 * 60 * 1000);

  return { filename: finalFilename, localUrl: `/audio/${finalFilename}`, spokenText: textToSpeak };
}

module.exports = { generateSpeech };