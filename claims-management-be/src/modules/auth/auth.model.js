import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100, },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true, },

    password: { type: String, required: true, select: false, minlength: 8, },

    role: {
      type: String,
     enum: [ "admin", "claims_manager", "adjuster", "viewer", "user",],
      default: "viewer",
    },

    isActive: { type: Boolean, default: true, },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;