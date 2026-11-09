import * as AuthService from "./auth.service.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  path: "/api/auth",
};

const setRefreshCookie = (res, token) => {
  const days = Number(
    process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7
  );

  res.cookie("refreshToken", token, {
    ...cookieOptions,
    maxAge: days * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", cookieOptions);
};

// REGISTER
export const register = async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  const user = await AuthService.registerUser(validatedData);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
};

// LOGIN
export const login = async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  const result = await AuthService.loginUser(validatedData);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

// REFRESH
export const refresh = async (req, res) => {
  const currentRefreshToken = req.cookies?.refreshToken;

  const result = await AuthService.refreshAccessToken(
    currentRefreshToken
  );

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: result.accessToken,
    },
  });
};

// LOGOUT
export const logout = async (req, res) => {
  const currentRefreshToken = req.cookies?.refreshToken;

  await AuthService.logoutUser(currentRefreshToken);

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// GET CURRENT USER
export const me = async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};