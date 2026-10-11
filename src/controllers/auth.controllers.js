import bcrypt from "bcrypt";
import userModel from "../model/user.model.js";
import refreshTokenModel from "../model/token.model.js";
import config from "../config/config.js";
import { createTokens, verifyToken } from "../utils/auth.utils.js";

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function register(req, res) {
  const { username, email, password,role } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const user = await userModel.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role
    });

    const tokens = await createTokens(user);
    await refreshTokenModel.create({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken: tokens.accessToken
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    console.error("Registration failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to register user"
    });
  }
}
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({
      email: email.trim().toLowerCase()
    });
    const isPasswordValid =
      user && (await bcrypt.compare(password, user.passwordHash));

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const tokens = await createTokens(user);
    await refreshTokenModel.create({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken: tokens.accessToken
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to login"
    });
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  }

  try {
    await refreshTokenModel.deleteOne({ token: refreshToken });
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to logout"
    });
  }
}

async function refreshToken(req, res) {
  const currentRefreshToken = req.cookies?.refreshToken;

  if (!currentRefreshToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    const decoded = verifyToken(
      currentRefreshToken,
      config.REFRESH_TOKEN_SECRET
    );
    const storedToken = await refreshTokenModel.findOne({
      userId: decoded.userID
    });

    if (!storedToken || storedToken.token !== currentRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const user = await userModel.findById(decoded.userID);

    if (!user) {
      await refreshTokenModel.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    await refreshTokenModel.deleteOne({ _id: storedToken._id });
    const tokens = await createTokens(user);
    await refreshTokenModel.create({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: tokens.accessToken
    });
  } catch (error) {
    if (error?.name === "TokenExpiredError" || error?.name === "JsonWebTokenError") {
      await refreshTokenModel.deleteOne({ token: currentRefreshToken });
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    console.error("Refresh token failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to refresh token"
    });
  }
}
async function profile(req, res) {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
}

export { register, login, logout, refreshToken,profile};