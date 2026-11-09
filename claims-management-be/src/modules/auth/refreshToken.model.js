import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true, },

    tokenHash: { type: String, required: true, unique: true, },

    expiresAt: { type: Date, required: true, },

    revokedAt: { type: Date, default: null, },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired refresh sessions
refreshTokenSchema.index( { expiresAt: 1 }, { expireAfterSeconds: 0 } );

const RefreshTokenModel = mongoose.model( "RefreshToken", refreshTokenSchema );

export default RefreshTokenModel;