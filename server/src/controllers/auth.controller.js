const { supabase, supabaseAdmin } = require('../config/supabase');
const auditModel = require('../models/audit.model');

const { sendOTPEmail } = require('../config/brevo');
const otpModel = require('../models/otp.model');

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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'logged_in' })
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ message: 'Error retrieving profile' });
    }

    await auditModel.logAction({
      actorId: profile.id,
      actorName: profile.name,
      actorRole: profile.role,
      action: 'login',
    });

    res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
      must_change_password: profile.must_change_password,
      profile: {
        ...profile,
        email: data.user.email
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Skip current password check if this is a forced first-login change
    if (!req.profile.must_change_password) {
      if (!current_password) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: req.user.email,
        password: current_password,
      });

      if (verifyError) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    // Update password in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Fix: use supabaseAdmin to bypass RLS
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: false, updated_at: new Date() })
      .eq('user_id', req.user.id);

    if (profileError) {
      return res.status(500).json({ message: 'Error updating profile' });
    }

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'update',
      resourceType: 'profile',
      resourceId: req.profile.id,
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'logged_out' })
      .eq('user_id', req.user.id);

    if (profileError) {
      return res.status(500).json({ message: 'Error updating profile status' });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'logout',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: {
        ...req.profile,
        email: req.user.email
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { new_email, ...profileData } = req.body;

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email exists in profiles — use supabaseAdmin to bypass RLS
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .eq('user_id', 
        (await supabaseAdmin.auth.admin.listUsers()).data.users
          .find(u => u.email === email)?.id
      )
      .single();

    // Always return same response regardless of whether email exists
    // (email enumeration protection)
    if (profile) {
      const otp = await otpModel.createOTP(email);
      await sendOTPEmail(email, profile.name, otp);
    }

    res.status(200).json({
      message: 'If this email exists, an OTP has been sent',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Verify OTP
    const isValid = await otpModel.verifyOTP(email, otp);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Find user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: new_password,
    });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { login, changePassword, logout, getProfile, updateProfile, forgotPassword, resetPassword };