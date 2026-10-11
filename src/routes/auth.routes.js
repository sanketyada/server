import express from "express"
import {
  register,
  login,
  logout,
  refreshToken,
  profile
} from "../controllers/auth.controllers.js";
import {
  registerValidator,
  loginValidator
} from "../validator/auth.validator.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/register", registerValidator, register)
router.post("/login", loginValidator, login)
router.post("/logout", logout)
router.get("/refresh-token", refreshToken)
router.get("/profile", authMiddleware, profile)


export default router;