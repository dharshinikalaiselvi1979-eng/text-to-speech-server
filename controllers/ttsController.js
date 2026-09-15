const fs = require('fs');
const path = require('path');
const { generateSpeech } = require('../services/ttsService');
const { voices } = require('../utils/voices');

async function convertText(req, res) {
    const { text, language, voice } = req.body;

    try {
        const { filename, localUrl } = await generateSpeech(text, language, voice);
        res.status(200).json({ success: true, audioUrl: localUrl, filename });
    } catch (err) {
        console.error('TTS generation error:', err.message);
        res.status(503).json({ success: false, error: 'TTS service unavailable.' });
    }
}

function getVoices(req, res) {
    res.status(200).json({ voices });
}

function downloadAudio(req, res) {
    const filepath = path.join(__dirname, '..', 'temp_audio', req.params.filename);
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ success: false, error: 'Audio file not found.' });
    }
    res.download(filepath);
}

module.exports = { convertText, getVoices, downloadAudio };