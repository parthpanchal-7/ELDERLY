import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateToken(payload: object, expiresIn: string = '1d'): string {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: expiresIn as any });
}

export function generateRefreshToken(payload: object, expiresIn: string = '30d'): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, ENV.JWT_SECRET);
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
}

export function generatePasscode(length: number = 6): string {
  // Cryptographically secure 6-digit numeric passcode
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

export async function hashPasscode(passcode: string): Promise<string> {
  return bcrypt.hash(passcode, 10);
}

export async function comparePasscode(passcode: string, hash: string): Promise<boolean> {
  return bcrypt.compare(passcode, hash);
}
