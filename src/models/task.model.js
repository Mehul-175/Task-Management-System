import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    task_id: { type: String, required: true, unique: true }, // Format: CMS-01
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assign_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignees: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
      required: true,
      validate: {
        validator: (assignees) => assignees.length > 0,
        message: "At least one assignee is required",
      },
    },
    report_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priority: { 
      type: String, 
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], 
      default: "MEDIUM" 
    },
    status: {
      type: String,
      enum: [
        "To-Do",
        "In-Progress",
        "Done",
        "Testing",
        "QA-Verified",
        "Re-Open",
        "Deployment"
      ],
      default: "To-Do"
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Remove 'next' from the arguments
taskSchema.pre("validate", function () {
  
  if ((!this.assignees || this.assignees.length === 0) && this.assign_to) {
    this.assignees = [this.assign_to];
  }

});

// Indexing for faster company-scoped lookups
taskSchema.index({ company_id: 1, project_id: 1, isDeleted: 1 });
taskSchema.index({ assignees: 1, company_id: 1, isDeleted: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;
