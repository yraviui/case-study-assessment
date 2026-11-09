import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    claimantName: {
      type: String,
      required: true,
      trim: true,
    },

    policyNumber: {
      type: String,
      required: true,
      index: true,
    },

    claimType: {
      type: String,
      enum: [
        "Health",
        "Motor",
        "Property",
        "Life",
        "Travel",
      ],
      required: true,
    },

    claimAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Pending Documents",
        "Approved",
        "Rejected",
        "Closed",
      ],
      default: "Submitted",
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({
  tenantId: 1,
  status: 1,
  createdAt: -1,
});

claimSchema.index({
  tenantId: 1,
  assignedTo: 1,
  status: 1,
});

const ClaimModel = mongoose.model("claims", claimSchema);

export default ClaimModel;