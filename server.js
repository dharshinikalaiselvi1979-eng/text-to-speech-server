require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const ttsRoutes = require('./routes/ttsRoutes');

const app = express();

// Spec 15: CORS configured correctly — only allow our own frontend
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Serve generated audio files for playback
app.use('/audio', express.static(path.join(__dirname, 'temp_audio')));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use('/api', ttsRoutes);

app.use((req, res) => res.status(404).json({ success: false, error: 'Not found' }));

// Spec 14: generic 500 handler — catches any unexpected crash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));