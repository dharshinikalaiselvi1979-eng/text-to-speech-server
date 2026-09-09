const supabase = require('../services/supabaseClient');

// Requires a valid Supabase access token in the Authorization header.
// Attaches the authenticated user to req.user on success.
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Please log in to continue.' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: 'Your session has expired. Please log in again.' });
  }

  req.user = data.user;
  next();
}

module.exports = requireAuth;