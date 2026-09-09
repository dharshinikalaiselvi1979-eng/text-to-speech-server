const express = require('express');
const router = express.Router();
const { convertText, getVoices, downloadAudio, getHistory } = require('../controllers/ttsController');
const validateTtsRequest = require('../middleware/validateTts');
const requireAuth = require('../middleware/auth');

router.post('/tts', requireAuth, validateTtsRequest, convertText);
router.get('/voices', getVoices);
router.get('/history', requireAuth, getHistory);
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/download/:filename', downloadAudio);

module.exports = router;