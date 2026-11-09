import express from "express";
import * as ClaimController from "./claim.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Every route below requires authentication
router.use(authMiddleware);

router.get("/", ClaimController.getClaims);
router.get("/my-assigned", ClaimController.getMyAssignedClaims);
router.get("/:id", ClaimController.getClaimById);
router.post("/", ClaimController.createClaim);
router.patch("/:id", ClaimController.updateClaim);
router.delete("/:id", ClaimController.deleteClaim);
router.patch("/:id/assign", ClaimController.assignClaim);
router.get("/:id/documents", ClaimController.getClaimDocuments);

export default router;