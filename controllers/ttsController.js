const fs = require('fs');
const path = require('path');
const { generateSpeech } = require('../services/ttsService');
const supabase = require('../services/supabaseClient');
const { voices } = require('../utils/voices');

// POST /api/tts — open to all, saves history only if logged in
async function convertText(req, res) {
  const { text, language, voice } = req.body;

  try {
    const { filename, localUrl, spokenText } = await generateSpeech(text, language, voice);

    // Save history only for authenticated users (Level 1 users unaffected)
    if (req.user) {
      const { error } = await supabase.from('speech_history').insert([{
        text,
        language,
        voice: voice || 'default',
        audio_url: localUrl,
        spoken_text: spokenText,
        user_id: req.user.id,
      }]);
      if (error) console.error('History save error:', error.message);
    }

    res.status(200).json({ success: true, audioUrl: localUrl, filename });
  } catch (err) {
    console.error('TTS generation error:', err.message);
    res.status(503).json({ success: false, error: 'TTS service unavailable.' });
  }
}

// GET /api/history — requires auth
async function getHistory(req, res) {
  const { data, error } = await supabase
    .from('speech_history')
    .select('id, text, language, voice, audio_url, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('History fetch error:', error.message);
    return res.status(500).json({ success: false, error: 'Could not load history.' });
  }
  res.status(200).json({ success: true, history: data });
}

// GET /api/voices
function getVoices(req, res) {
  res.status(200).json({ voices });
}

// GET /api/download/:filename
function downloadAudio(req, res) {
  const filepath = path.join(__dirname, '..', 'temp_audio', req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ success: false, error: 'Audio file not found.' });
  }
  res.download(filepath);
}

// GET /api/favourites — requires auth
async function getFavourites(req, res) {
  const { data, error } = await supabase
    .from('favourites')
    .select('id, voice_name, language, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === 'PGRST205') {
      return res.status(200).json({ success: true, favourites: [], warning: 'favourites table missing in Supabase' });
    }
    console.error('Favourites fetch error:', error.message);
    return res.status(500).json({ success: false, error: 'Could not load favourites.' });
  }
  res.status(200).json({ success: true, favourites: data });
}

// POST /api/favourites — requires auth
async function addFavourite(req, res) {
  const { voice_name, language } = req.body;
  if (!voice_name) {
    return res.status(400).json({ success: false, error: 'voice_name is required.' });
  }

  // Check if favourites table exists / existing entry
  const { data: existing, error: findErr } = await supabase
    .from('favourites')
    .select('id, voice_name, language')
    .eq('user_id', req.user.id)
    .eq('voice_name', voice_name)
    .maybeSingle();

  if (findErr && findErr.code === 'PGRST205') {
    return res.status(400).json({
      success: false,
      error: 'Favourites table is not created in Supabase database yet. Please run the SQL setup script in your Supabase SQL Editor.',
    });
  }

  if (existing) {
    return res.status(200).json({ success: true, favourite: existing, message: 'Already in favourites.' });
  }

  const { data, error } = await supabase
    .from('favourites')
    .insert([{ user_id: req.user.id, voice_name, language: language || 'en' }])
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST205') {
      return res.status(400).json({
        success: false,
        error: 'Favourites table is not created in Supabase database yet. Please run the SQL setup script in your Supabase SQL Editor.',
      });
    }
    console.error('Add favourite error:', error.message);
    return res.status(500).json({ success: false, error: 'Could not add favourite.' });
  }
  res.status(201).json({ success: true, favourite: data });
}

// DELETE /api/favourites/:id — requires auth (accepts UUID id or voice_name)
async function removeFavourite(req, res) {
  const param = req.params.id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);

  let query = supabase.from('favourites').delete().eq('user_id', req.user.id);
  if (isUuid) {
    query = query.eq('id', param);
  } else {
    query = query.eq('voice_name', param);
  }

  const { error } = await query;

  if (error) {
    if (error.code === 'PGRST205') {
      return res.status(200).json({ success: true, message: 'Table missing, ignored.' });
    }
    console.error('Remove favourite error:', error.message);
    return res.status(500).json({ success: false, error: 'Could not remove favourite.' });
  }
  res.status(200).json({ success: true, message: 'Removed from favourites.' });
}

module.exports = { convertText, getVoices, downloadAudio, getHistory, getFavourites, addFavourite, removeFavourite };