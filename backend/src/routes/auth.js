import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import User from '../models/User.js';
import EmailOtp from '../models/EmailOtp.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userPayload(user) {
  return { id: user._id, email: user.email, name: user.name };
}

function authResponse(user, status = 200) {
  return { status, body: { token: signToken(user._id.toString()), user: userPayload(user) } };
}

function getMailer() {
  if (process.env.SMTP_URL) return nodemailer.createTransport(process.env.SMTP_URL);
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

// Password registration remains available for people who prefer it.
router.post('/register', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!emailPattern.test(email || '') || !password) return res.status(400).json({ error: 'Enter a valid email and password.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const existing = await User.findOne({ email });
    if (existing?.passwordHash) return res.status(409).json({ error: 'An account already uses this email. Sign in instead.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = existing
      ? await User.findByIdAndUpdate(existing._id, { passwordHash }, { new: true })
      : await User.create({ email, passwordHash });
    const result = authResponse(user, 201);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await User.findOne({ email });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const result = authResponse(user);
    res.json(result.body);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Email OTP is passwordless: it signs in an existing user or creates a new account.
router.post('/email-otp/request', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!emailPattern.test(email || '')) return res.status(400).json({ error: 'Enter a valid email address.' });
    const mailer = getMailer();
    if (!mailer || !process.env.EMAIL_FROM) return res.status(503).json({ error: 'Email sign-in is not configured yet.' });

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    await EmailOtp.findOneAndUpdate(
      { email },
      { codeHash, attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your NovuAI verification code',
      text: `Your NovuAI verification code is ${code}. It expires in 10 minutes.`,
    });
    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Email OTP error:', err);
    res.status(500).json({ error: 'Unable to send the verification email. Try again shortly.' });
  }
});

router.post('/email-otp/verify', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const record = await EmailOtp.findOne({ email });
    if (!record || record.expiresAt < new Date() || record.attempts >= 5) {
      return res.status(400).json({ error: 'This code is invalid or expired. Request a new one.' });
    }
    if (!(await bcrypt.compare(code, record.codeHash))) {
      await EmailOtp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ error: 'That verification code is incorrect.' });
    }
    await EmailOtp.deleteOne({ _id: record._id });
    const user = await createOrFindUser({ email }, { email });
    const result = authResponse(user);
    res.json(result.body);
  } catch (err) {
    console.error('Email OTP verification error:', err);
    res.status(500).json({ error: 'Unable to verify the code. Try again.' });
  }
});

// Google OAuth uses the standard authorization-code flow; no client secret enters the browser.
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    return res.status(503).send('Google sign-in is not configured.');
  }
  const state = jwt.sign({ purpose: 'google-oauth', nonce: crypto.randomBytes(16).toString('hex') }, process.env.JWT_SECRET, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const state = jwt.verify(req.query.state, process.env.JWT_SECRET);
    if (state.purpose !== 'google-oauth' || !req.query.code) throw new Error('Invalid OAuth response');
    const tokenReply = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code: req.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.GOOGLE_CALLBACK_URL, grant_type: 'authorization_code' }),
    });
    const tokenData = await tokenReply.json();
    if (!tokenReply.ok) throw new Error(tokenData.error || 'Google token exchange failed');
    const profileReply = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const profile = await profileReply.json();
    if (!profileReply.ok || !profile.email_verified || !profile.email) throw new Error('Google did not provide a verified email');
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }] });
    if (!user) user = await User.create({ email: profile.email.toLowerCase(), googleId: profile.sub, name: profile.name });
    else if (!user.googleId) user = await User.findByIdAndUpdate(user._id, { googleId: profile.sub, name: user.name || profile.name }, { new: true });
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(signToken(user._id.toString()))}`);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent('Google sign-in could not be completed.')}`);
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userPayload(user) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
