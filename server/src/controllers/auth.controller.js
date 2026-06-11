// const { supabase } = require('../config/supabase');
const { supabase, supabaseAdmin } = require('../config/supabase');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ message: 'Error retrieving profile' });
    }

    res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
      must_change_password: profile.must_change_password,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Update password in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Flip must_change_password to false
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false, updated_at: new Date() })
      .eq('user_id', req.user.id);

    if (profileError) {
      return res.status(500).json({ message: 'Error updating profile' });
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: req.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { new_email, new_password, ...profileData } = req.body;

    // Update email if provided
    if (new_email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        req.user.id,
        { email: new_email }
      );
      if (emailError) {
        return res.status(500).json({ message: emailError.message });
      }
    }

    // Update password if provided
    if (new_password) {
      if (new_password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        req.user.id,
        { password: new_password }
      );
      if (passwordError) {
        return res.status(500).json({ message: passwordError.message });
      }
    }

    // Update profile data if provided
    if (Object.keys(profileData).length > 0) {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update({ ...profileData, updated_at: new Date() })
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (profileError) {
        return res.status(500).json({ message: profileError.message });
      }

      return res.status(200).json({
        message: 'Profile updated successfully',
        data,
      });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { login, changePassword, logout, getProfile, updateProfile };
