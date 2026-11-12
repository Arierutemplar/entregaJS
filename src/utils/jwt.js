import jwt from 'jsonwebtoken';
import env from '../config/env.config.js';

export const signToken = (payload) => jwt.sign(payload, env.jwtSecret, {
  expiresIn: env.jwtExpiresIn
});

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const tokenMaxAgeSeconds = (expiresIn = env.jwtExpiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 24 * 60 * 60;
  const amount = Number(match[1]);
  const unit = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
  return amount * unit;
};
