const { supabase, supabaseAdmin } = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Use supabaseAdmin to bypass RLS for profile lookup
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ message: 'Unauthorized: Profile not found' });
    }

    req.user = user;
    req.profile = profile;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.profile.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
  next();
};

const authorizeDentist = (req, res, next) => {
  if (req.profile.role !== 'dentist') {
    return res.status(403).json({ message: 'Forbidden: Dentist access only' });
  }
  next();
};

const authorizeStaff = (req, res, next) => {
  if (!['admin', 'dentist', 'assistant'].includes(req.profile.role)) {
    return res.status(403).json({ message: 'Forbidden: Staff access only' });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeDentist,
  authorizeStaff,
};