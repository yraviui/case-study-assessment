import User from "./auth.model.js";
import RefreshToken from "./refreshToken.model.js";

import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../utils/generateTokens.js";

const REFRESH_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7
);

const getRefreshExpiry = () => {
  return new Date(
    Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000
  );
};

// REGISTER
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "viewer",
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

// LOGIN
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is disabled");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshExpiry(),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// REFRESH ACCESS TOKEN
export const refreshAccessToken = async (currentRefreshToken) => {
  if (!currentRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const tokenHash = hashRefreshToken(currentRefreshToken);

  // Atomically revoke the current token.
  const existingSession = await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
    {
      new: false,
    }
  );

  if (!existingSession) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(existingSession.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, "User account is unavailable");
  }

  const newRefreshToken = generateRefreshToken();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashRefreshToken(newRefreshToken),
    expiresAt: getRefreshExpiry(),
  });

  return {
    accessToken: generateAccessToken(user),
    refreshToken: newRefreshToken,
  };
};

// LOGOUT
export const logoutUser = async (currentRefreshToken) => {
  if (!currentRefreshToken) {
    return;
  }

  await RefreshToken.updateOne(
    {
      tokenHash: hashRefreshToken(currentRefreshToken),
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};

// GET CURRENT USER
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select(
    "_id name email role isActive createdAt"
  );

  if (!user || !user.isActive) {
    throw new ApiError(401, "User account is unavailable");
  }

  return user;
};