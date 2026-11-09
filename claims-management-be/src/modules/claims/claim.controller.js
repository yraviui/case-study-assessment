
import mongoose from "mongoose";
import ClaimModel from "./claim.model.js";

// Fields that can be updated through the generic PATCH endpoint.
// Assignment is handled separately by assignClaim.
const ALLOWED_UPDATE_FIELDS = [
  "claimantName",
  "policyNumber",
  "claimType",
  "claimAmount",
];

// Build a query scope from the authenticated user.
// If tenantId is available on req.user, claims are tenant-scoped.
const getClaimScope = (req) => {
  const scope = {};

  if (req.user?.tenantId) {
    scope.tenantId = req.user.tenantId;
  }

  return scope;
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/claims
export const getClaims = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const filter = {
      ...getClaimScope(req),
    };

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { claimNumber: searchRegex },
        { claimantName: searchRegex },
        { policyNumber: searchRegex },
      ];
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "claimNumber",
      "claimantName",
      "claimAmount",
      "status",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const [claims, totalRecords] = await Promise.all([
      ClaimModel.find(filter)
        .sort({ [safeSortBy]: sortOrder })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),

      ClaimModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: claims,
      pagination: {
        currentPage: safePage,
        pageSize: safeLimit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / safeLimit),
      },
    });
  } catch (error) {
    console.error("getClaims error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve claims",
    });
  }
};

// GET /api/claims/:id
export const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const claim = await ClaimModel.findOne({
      _id: id,
      ...getClaimScope(req),
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error("getClaimById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve claim",
    });
  }
};

// POST /api/claims
export const createClaim = async (req, res) => {
  try {
   const { claimNumber, claimantName, policyNumber, claimType, claimAmount, } = req.body;

    if ( !claimNumber || !claimantName || !policyNumber || !claimType || claimAmount === undefined ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required claim fields",
      });
    }

    const amount = Number(claimAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Claim amount must be a valid non-negative number",
      });
    }

    const existingClaim = await ClaimModel.findOne({
      claimNumber,
      ...getClaimScope(req),
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "Claim number already exists",
      });
    }

    const claimData = {
      claimNumber,
      claimantName,
      policyNumber,
      claimType,
      claimAmount: amount,
      status: "Submitted",
      createdBy: req.user?._id || req.user?.id || req.user?.userId // Provide fallback hooks to safely grab the ID from your auth token payload
    };

    // Set tenant from authenticated identity, never from request body.
    if (req.user?.tenantId) {
      claimData.tenantId = req.user.tenantId;
    }

    const claim = await ClaimModel.create(claimData);

    return res.status(201).json({
      success: true,
      message: "Claim created successfully",
      data: claim,
    });
  } catch (error) {
    console.error("createClaim error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Claim number already exists",
      });
    }

    // UPDATE THIS RETURN BLOCK:
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create claim",
      validationErrors: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : null
    });
  }
};

// PATCH /api/claims/:id
export const updateClaim = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const updateData = {};

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (updateData.claimAmount !== undefined) {
      const amount = Number(updateData.claimAmount);

      if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Claim amount must be a valid non-negative number",
        });
      }

      updateData.claimAmount = amount;
    }

    const claim = await ClaimModel.findOneAndUpdate(
      {
        _id: id,
        ...getClaimScope(req),
      },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Claim updated successfully",
      data: claim,
    });
  } catch (error) {
    console.error("updateClaim error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update claim",
    });
  }
};

// DELETE /api/claims/:id
export const deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const claim = await ClaimModel.findOneAndDelete({
      _id: id,
      ...getClaimScope(req),
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Claim deleted successfully",
    });
  } catch (error) {
    console.error("deleteClaim error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete claim",
    });
  }
};

// PATCH /api/claims/:id/assign
export const assignClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    if (
      assignedTo !== null &&
      assignedTo !== undefined &&
      !isValidObjectId(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    const claim = await ClaimModel.findOneAndUpdate(
      {
        _id: id,
        ...getClaimScope(req),
      },
      {
        $set: {
          assignedTo: assignedTo || null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Claim assignment updated successfully",
      data: claim,
    });
  } catch (error) {
    console.error("assignClaim error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign claim",
    });
  }
};

// GET /api/claims/:id/documents
export const getClaimDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID",
      });
    }

    const claim = await ClaimModel.findOne({
      _id: id,
      ...getClaimScope(req),
    })
      .select("claimNumber documents")
      .lean();

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        claimId: claim._id,
        claimNumber: claim.claimNumber,
        documents: claim.documents || [],
      },
    });
  } catch (error) {
    console.error("getClaimDocuments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve claim documents",
    });
  }
};

// Append this function to the bottom of claim.controller.js

// GET /api/claims/my-assigned
export const getMyAssignedClaims = async (req, res) => {
  try {
    // Safely extract the logged-in user's ID using the payload fallback hooks
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication data missing",
      });
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

    // Force filtering strictly by the current user's assignment and tenant boundary
    const filter = {
      ...getClaimScope(req),
      assignedTo: userId,
    };

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [
        { claimNumber: searchRegex },
        { claimantName: searchRegex },
        { policyNumber: searchRegex },
      ];
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "claimNumber",
      "claimantName",
      "claimAmount",
      "status",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const [claims, totalRecords] = await Promise.all([
      ClaimModel.find(filter)
        .sort({ [safeSortBy]: sortOrder })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      ClaimModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: claims,
      pagination: {
        currentPage: safePage,
        pageSize: safeLimit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / safeLimit),
      },
    });
  } catch (error) {
    console.error("getMyAssignedClaims error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assigned claims",
    });
  }
};

