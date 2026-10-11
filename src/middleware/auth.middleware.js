import config from "../config/config.js";
import userModel from "../model/user.model.js";
import { verifyToken } from "../utils/auth.utils.js";

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    const decoded = verifyToken(token, config.ACCESS_TOKEN_SECRET);
    const user = await userModel.findById(decoded.userID).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError" || error?.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token"
      });
    }

    console.error("Authentication failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to authenticate request"
    });
  }
}

export default authMiddleware;
