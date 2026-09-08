const { supportedLanguages, voices } = require('../utils/voices');

const MAX_LENGTH = process.env.MAX_TEXT_LENGTH || 500;

// Strips HTML/script tags so nobody can inject markup through the text field
function sanitizeText(text) {
  return text.replace(/<[^>]*>/g, '');
}

function validateTtsRequest(req, res, next) {
  // Spec 13: Content-Type must be validated
  if (!req.is('application/json')) {
    return res.status(400).json({ success: false, error: 'Content-Type must be application/json.' });
  }

  let { text, language, voice } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Text must not be empty.' });
  }

  text = sanitizeText(text);

  if (text.length > MAX_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Text exceeds max length of ${MAX_LENGTH} characters.`,
    });
  }

  // Spec 13: Language must be supported
  if (!language || !supportedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      error: `Language '${language}' is not supported.`,
    });
  }

  // Spec 13: Voice must belong to the selected language
  if (voice) {
    const voiceObj = voices.find((v) => v.name === voice);
    if (!voiceObj) {
      return res.status(400).json({ success: false, error: `Voice '${voice}' does not exist.` });
    }
    if (voiceObj.language !== language) {
      return res.status(400).json({
        success: false,
        error: `Voice '${voice}' does not belong to language '${language}'.`,
      });
    }
  }

  req.body.text = text; // pass the sanitized version onward
  next();
}

module.exports = validateTtsRequest;