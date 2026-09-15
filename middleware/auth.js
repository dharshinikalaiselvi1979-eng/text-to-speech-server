const supabase = require('../services/supabaseClient');

// Optional auth — attaches req.user if a valid token is provided.
// If no token or invalid token, request continues without req.user (Level 1 still works).
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next(); // no token → continue as unauthenticated

  const { data, error } = await supabase.auth.getUser(token);
  if (!error && data?.user) {
    req.user = data.user;
  }
  next();
}

// Hard auth — rejects the request if no valid token.
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

module.exports = { optionalAuth, requireAuth };