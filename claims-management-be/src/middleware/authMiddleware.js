import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
      {
        issuer: "swissre-claims-api",
        audience: "swissre-claims-client",
      }
    );

    // Fetch current user to verify account status and current role.
    const user = await User.findById(decoded.sub).select(
      "_id name email role isActive"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive user",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export default authMiddleware;