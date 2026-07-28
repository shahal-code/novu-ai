import { ENV } from '../config/env.js';
import { MESSAGES } from '../constants/messages.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import User from '../models/User.js';
import {
  isValidEmail,
  authResponse,
  createOrUpdatePasswordUser,
  authenticatePasswordUser,
  sendEmailOtp,
  verifyEmailOtpCode,
  findOrUpdateGoogleUser,
  signToken,
  userPayload,
} from '../services/authService.js';

export async function register(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!isValidEmail(email) || !password) return res.status(400).json({ error: MESSAGES.AUTH.INVALID_CREDS });
    if (password.length < 8) return res.status(400).json({ error: MESSAGES.AUTH.PASSWORD_LENGTH });

    const user = await createOrUpdatePasswordUser(email, password);
    const result = authResponse(user, 201);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Register error:', err);
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: MESSAGES.GLOBAL.SERVER_ERROR });
  }
}

export async function login(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ error: MESSAGES.AUTH.EMAIL_PWD_REQUIRED });

    const user = await authenticatePasswordUser(email, password);
    if (!user) return res.status(401).json({ error: MESSAGES.AUTH.LOGIN_FAILED });

    const result = authResponse(user);
    res.json(result.body);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: MESSAGES.GLOBAL.SERVER_ERROR });
  }
}

export async function requestEmailOtp(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!isValidEmail(email)) return res.status(400).json({ error: MESSAGES.AUTH.INVALID_EMAIL });

    await sendEmailOtp(email);
    res.json({ message: MESSAGES.AUTH.OTP_SENT });
  } catch (err) {
    console.error('Email OTP error:', err);
    res.status(err.status || 500).json({ error: err.message || MESSAGES.AUTH.OTP_SEND_ERROR });
  }
}

export async function verifyEmailOtp(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const user = await verifyEmailOtpCode(email, code);
    const result = authResponse(user);
    res.json(result.body);
  } catch (err) {
    console.error('Email OTP verification error:', err);
    res.status(err.status || 500).json({ error: err.message || MESSAGES.AUTH.OTP_VERIFY_ERROR });
  }
}

export function googleRedirect(req, res) {
  if (!ENV.GOOGLE.CLIENT_ID || !ENV.GOOGLE.CLIENT_SECRET || !ENV.GOOGLE.CALLBACK_URL) {
    return res.status(503).send(MESSAGES.AUTH.GOOGLE_NOT_CONFIGURED);
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const signedState = jwt.sign({ purpose: 'google-oauth', nonce }, ENV.JWT_SECRET, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: ENV.GOOGLE.CLIENT_ID,
    redirect_uri: ENV.GOOGLE.CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    state: signedState,
    prompt: 'select_account',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

export async function googleCallback(req, res) {
  const frontendUrl = ENV.FRONTEND_URL || 'http://localhost:5173';
  try {
    const state = jwt.verify(req.query.state, ENV.JWT_SECRET);
    if (state.purpose !== 'google-oauth' || !req.query.code) throw new Error(MESSAGES.AUTH.GOOGLE_INVALID_RESPONSE);

    const tokenReply = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: ENV.GOOGLE.CLIENT_ID,
        client_secret: ENV.GOOGLE.CLIENT_SECRET,
        redirect_uri: ENV.GOOGLE.CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenReply.json();
    if (!tokenReply.ok) throw new Error(tokenData.error || MESSAGES.AUTH.GOOGLE_TOKEN_FAILED);

    const profileReply = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileReply.json();
    if (!profileReply.ok || !profile.email_verified || !profile.email) throw new Error(MESSAGES.AUTH.GOOGLE_NO_EMAIL);

    const user = await findOrUpdateGoogleUser(profile);
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(signToken(user._id.toString()))}`);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(MESSAGES.AUTH.GOOGLE_OAUTH_ERROR)}`);
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
    res.json({ user: userPayload(user) });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: MESSAGES.GLOBAL.SERVER_ERROR });
  }
}
