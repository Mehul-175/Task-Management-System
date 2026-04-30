import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Activity from "../models/activity.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import {
  createTaskSchema,
  updateTaskStatusSchema,
} from "../validations/task.validation.js";

const isTaskAssignedToUser = (task, userId) => {
  const assigneeIds = task.assignees?.map((assignee) => assignee.toString()) || [];
  const legacyAssigneeId = task.assign_to?.toString();

  return assigneeIds.includes(userId) || legacyAssigneeId === userId;
};

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { value, error } = createTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const project = await Project.findOne({
      _id: value.project_id,
      company_id: req.user.company_id,
      isDeleted: false,
    });

    if (!project) return res.status(404).json({ message: "Project not found." });

    const companyUsers = await User.find({
      _id: { $in: value.assignees },
      company_id: req.user.company_id,
      isDeleted: { $ne: true },
      status: "ACTIVE",
    }).select("_id");

    if (companyUsers.length !== value.assignees.length) {
      return res.status(400).json({
        message: "One or more assignees are not active company members.",
      });
    }

    const projectMemberIds = new Set([
      project.created_by.toString(),
      ...project.assigned_users.map((userId) => userId.toString()),
    ]);

    const missingProjectMembers = value.assignees.filter(
      (userId) => !projectMemberIds.has(userId)
    );

    if (missingProjectMembers.length > 0) {
      project.assigned_users = Array.from(
        new Set([
          ...project.assigned_users.map((userId) => userId.toString()),
          ...missingProjectMembers,
        ])
      );

      await project.save();
    }

    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      { $inc: { taskSequence: 1 } },
      { new: true }
    );

    const formattedId = `${project.shortName}-${String(updatedProject.taskSequence).padStart(2, "0")}`;

    const task = await Task.create({
      ...value,
      assign_to: value.assignees[0],
      report_to: value.report_to || req.user.id,
      task_id: formattedId,
      company_id: req.user.company_id,
      created_by: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE FULL TASK (FIXED)
export const updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      company_id: req.user.company_id,
      isDeleted: false,
    });

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.user.system_role !== "ADMIN") {
      if (!isTaskAssignedToUser(task, req.user.id)) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    const oldData = {
      title: task.title,
      description: task.description,
    };

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;

    await task.save();

    // Activity log
    await Activity.create({
      task_id: task._id,
      performed_by: req.user.id,
      action: "TASK_UPDATED",
      oldData,
      newData: { title: task.title, description: task.description },
      timestamp: new Date(),
    });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE STATUS
export const updateTaskStatus = async (req, res) => {
  try {
    const { value, error } = updateTaskStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const task = await Task.findOne({
      _id: req.params.id,
      company_id: req.user.company_id,
      isDeleted: false,
    });

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.user.system_role !== "ADMIN") {
      if (!isTaskAssignedToUser(task, req.user.id)) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    const oldStatus = task.status;
    task.status = value.status;

    await task.save();

    await Activity.create({
      task_id: task._id,
      performed_by: req.user.id,
      oldStatus,
      newStatus: value.status,
      action: "STATUS_CHANGED",
      timestamp: new Date(),
    });

    res.status(200).json({
      message: "Status updated",
      currentStatus: task.status,
    });
  } catch (error) {
    // Add this line to see the exact error in your backend terminal!
    console.error("Task Status Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};



// DELETE TASK (SOFT DELETE)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      company_id: req.user.company_id,
      isDeleted: false,
    });

    if (!task) return res.status(404).json({ message: "Task not found." });

    task.isDeleted = true;
    await task.save();

    await Activity.create({
      task_id: task._id,
      performed_by: req.user.id,
      action: "TASK_DELETED",
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET TASKS


export const getAllTasks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const query = {
      company_id: req.user.company_id,
      isDeleted: false,
    };

    if (req.user.system_role !== "ADMIN") {
      query.$or = [
        { assignees: { $in: [userId] } }, // FIX
        { assign_to: userId },            // FIX
      ];
    }

    const tasks = await Task.find(query)
      .populate("assign_to", "firstname lastname email")
      .populate("assignees", "firstname lastname email")
      .populate("report_to", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = {
      project_id: projectId,
      company_id: req.user.company_id,
      isDeleted: false,
    };

    if (req.user.system_role !== "ADMIN") {
      query.$or = [
        { assignees: req.user.id },
        { assign_to: req.user.id },
      ];
    }

    const tasks = await Task.find(query)
      .populate("assign_to", "firstname lastname email")
      .populate("assignees", "firstname lastname email")
      .populate("report_to", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
