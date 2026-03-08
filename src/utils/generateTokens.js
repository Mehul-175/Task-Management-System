import jwt from 'jsonwebtoken'
import crypto from "crypto";


const ACCESS_KEY = process.env.ACCESS_KEY
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES

export const generateAccessToken = (payload) => {
  return jwt.sign(payload , ACCESS_KEY, { expiresIn: ACCESS_EXPIRES });
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex")
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};