import express from "express"
import {
  register,
  login,
  logout,
  refreshToken
} from "../controllers/auth.controllers.js";
import { registerValidator } from "../validator/auth.validator.js";

const router = express.Router()

router.post("/", registerValidator, register)
router.post("/login", login)
router.post("/logout", logout)
router.post("/refresh-token", refreshToken)

export default router;