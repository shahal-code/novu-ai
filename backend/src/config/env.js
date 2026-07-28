import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  },
  SMTP: {
    URL: process.env.SMTP_URL,
    HOST: process.env.SMTP_HOST,
    PORT: Number(process.env.SMTP_PORT || 587),
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,
    FROM: process.env.EMAIL_FROM || '"NovuAI Dev" <test@novuai.app>',
  },
};
