import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return process.env.JWT_SECRET;
}

export function signToken(payload, expiresIn) {
  return jwt.sign(payload, secret(), { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}

export function generateMagicToken() {
  return randomBytes(32).toString('hex');
}
