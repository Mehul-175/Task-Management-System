import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    duration_days: {
      type: Number,
      required: true,
    },

    max_users: {
      type: Number,
      required: true,
    },

    max_projects: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
