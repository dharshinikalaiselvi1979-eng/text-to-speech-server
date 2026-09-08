const express = require('express');
const router = express.Router();
const { convertText, getVoices, downloadAudio } = require('../controllers/ttsController');
const validateTtsRequest = require('../middleware/validateTts');

console.log('validateTtsRequest:', typeof validateTtsRequest);
console.log('convertText:', typeof convertText);
console.log('getVoices:', typeof getVoices);
console.log('downloadAudio:', typeof downloadAudio);

router.post('/tts', validateTtsRequest, convertText);
router.get('/voices', getVoices);
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/download/:filename', downloadAudio);

module.exports = router;