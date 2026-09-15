const supabase = require('../services/supabaseClient');

// POST /api/auth/signup
async function signup(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  // Use admin API to create user (email auto-confirmed)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'An account with this email already exists.'
      : error.message;
    return res.status(400).json({ success: false, error: msg });
  }

  return res.status(201).json({ success: true, message: 'Account created. You can now log in.' });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  return res.status(200).json({
    success: true,
    accessToken: data.session.access_token,
    user: { id: data.user.id, email: data.user.email },
  });
}

// POST /api/auth/logout
async function logout(req, res) {
  // Client just discards the token; nothing to invalidate server-side without refresh token
  return res.status(200).json({ success: true, message: 'Logged out.' });
}

module.exports = { signup, login, logout };
