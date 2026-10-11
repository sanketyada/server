import jwt from "jsonwebtoken";
import config from "../config/config.js";

async function generateAccessToken({ userID, role }) {
  return jwt.sign({ userID, role }, config.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}
async function generateRefreshToken({ userID, role }) {
  return jwt.sign({ userID, role }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

async function createTokens(user) {
  const payload = {
    userID: user._id.toString(),
    role: user.role
  };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  return { accessToken, refreshToken };
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

export {
  generateAccessToken,
  generateRefreshToken,
  createTokens,
  verifyToken
};
