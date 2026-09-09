const fs = require('fs');
const path = require('path');
const { generateSpeech } = require('../services/ttsService');
const supabase = require('../services/supabaseClient');
const { voices } = require('../utils/voices');

async function convertText(req, res) {
    const { text, language, voice } = req.body;

    try {
        const { filename, localUrl, spokenText } = await generateSpeech(text, language, voice);

        const { error } = await supabase.from('speech_history').insert([
            {
                text,
                language,
                voice: voice || 'default',
                audio_url: localUrl,
                spoken_text: spokenText,
                user_id: req.user.id,
            },
        ]);

        if (error) {
            console.error('Supabase insert error:', error.message);
        }

        res.status(200).json({ success: true, audioUrl: localUrl, filename });

    } catch (err) {
        console.error('TTS generation error:', err.message);
        res.status(503).json({ success: false, error: 'TTS service unavailable.' });
    }
}

async function getHistory(req, res) {
    const { data, error } = await supabase
        .from('speech_history')
        .select('id, text, language, voice, audio_url, created_at')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Supabase history fetch error:', error.message);
        return res.status(500).json({ success: false, error: 'Could not load history.' });
    }

    res.status(200).json({ success: true, history: data });
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

module.exports = { convertText, getVoices, downloadAudio, getHistory };