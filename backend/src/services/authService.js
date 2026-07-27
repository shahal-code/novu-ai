import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import User from '../models/User.js';
import EmailOtp from '../models/EmailOtp.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email || '');
}

export function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function userPayload(user) {
  return { id: user._id, email: user.email, name: user.name };
}

export function authResponse(user, status = 200) {
  return { status, body: { token: signToken(user._id.toString()), user: userPayload(user) } };
}

async function getMailer() {
  if (process.env.SMTP_URL) return nodemailer.createTransport(process.env.SMTP_URL);
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  console.log('No SMTP credentials found. Falling back to Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function createOrUpdatePasswordUser(email, password) {
  const existing = await User.findOne({ email });
  if (existing?.passwordHash) {
    const error = new Error('An account already uses this email. Sign in instead.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  return existing
    ? await User.findByIdAndUpdate(existing._id, { passwordHash }, { new: true })
    : await User.create({ email, passwordHash });
}

export async function authenticatePasswordUser(email, password) {
  const user = await User.findOne({ email });
  if (!user?.passwordHash) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function sendEmailOtp(email) {
  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(code, 10);

  await EmailOtp.findOneAndUpdate(
    { email },
    { codeHash, attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`\n======================================`);
  console.log(`🔑 DEV OTP CODE FOR ${email}: ${code}`);
  console.log(`======================================\n`);

  try {
    const mailer = await getMailer();
    if (!mailer) return;

    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"NovuAI Dev" <test@novuai.app>',
      to: email,
      subject: 'Your NovuAI verification code',
      text: `Your NovuAI verification code is ${code}. It expires in 10 minutes.`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Ethereal Email Preview URL: %s', previewUrl);
    }
  } catch (err) {
    console.warn('⚠️ Could not send verification email:', err.message);
  }
}

export async function verifyEmailOtpCode(email, code) {
  const record = await EmailOtp.findOne({ email });
  if (!record || record.expiresAt < new Date() || record.attempts >= 5) {
    const err = new Error('This code is invalid or expired. Request a new one.');
    err.status = 400;
    throw err;
  }

  if (!(await bcrypt.compare(code, record.codeHash))) {
    await EmailOtp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    const err = new Error('That verification code is incorrect.');
    err.status = 400;
    throw err;
  }

  await EmailOtp.deleteOne({ _id: record._id });
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email });
  return user;
}

export async function findOrUpdateGoogleUser(profile) {
  const normalizedEmail = profile.email?.toLowerCase();
  let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: normalizedEmail }] });
  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      googleId: profile.sub,
      name: profile.name,
    });
  } else if (!user.googleId) {
    user = await User.findByIdAndUpdate(
      user._id,
      { googleId: profile.sub, name: user.name || profile.name },
      { new: true },
    );
  }

  return user;
}
