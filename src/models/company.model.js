import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "PAYMENT_FAILED", "EXPIRED", "INACTIVE"],
      default: "PENDING",
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    plan_expiry: {
      type: Date,
    },
    payment_link_id: {
      type: String,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
