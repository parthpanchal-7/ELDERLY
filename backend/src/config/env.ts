import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saathicare',
  JWT_SECRET: process.env.JWT_SECRET || 'saathicare-dev-jwt-super-secret-key-32chars',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'saathicare-dev-refresh-super-secret-key-32',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'SaathiCare <care@saathicare.com>',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
};
