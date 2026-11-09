import express from "express"

import authRoutes from "../modules/auth/auth.routes.js"

// Import your existing claims routes
import claimRoutes from "../modules/claims/claim.routes.js"

const router = express.Router();

router.use("/auth", authRoutes)

router.use("/claims", claimRoutes)

export default router;