import express from "express";

import * as AuthController from "./auth.controller.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public APIs
router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/refresh", AuthController.refresh);

router.post("/logout", AuthController.logout);

// Protected API
router.get("/me", authMiddleware, AuthController.me);

export default router;