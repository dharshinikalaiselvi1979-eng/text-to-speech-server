const express = require('express');
const router = express.Router();
const { convertText, getVoices, downloadAudio, getHistory, getFavourites, addFavourite, removeFavourite } = require('../controllers/ttsController');
const { signup, login, logout } = require('../controllers/authController');
const validateTtsRequest = require('../middleware/validateTts');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// Auth routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/logout', logout);

// TTS — open to all, saves history if logged in
router.post('/tts', optionalAuth, validateTtsRequest, convertText);
router.get('/voices', getVoices);
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/download/:filename', downloadAudio);

// Protected — require login
router.get('/history', requireAuth, getHistory);
router.get('/favourites', requireAuth, getFavourites);
router.post('/favourites', requireAuth, addFavourite);
router.delete('/favourites/:id', requireAuth, removeFavourite);

module.exports = router;