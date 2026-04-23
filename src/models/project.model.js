import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    shortName: { 
      type: String, 
      required: true, 
      uppercase: true 
    },
    taskSequence: { 
      type: Number, 
      default: 0 
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["PLANNED", "ONGOING", "COMPLETED", "ON_HOLD"],
      default: "PLANNED",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

projectSchema.index({ company_id: 1, isDeleted: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
