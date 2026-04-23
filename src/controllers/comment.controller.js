import Comment from "../models/comment.model.js";
import Task from "../models/task.model.js";
import { commentSchema } from "../validations/comment.validation.js";

// 1. ADD COMMENT
export const addComment = async (req, res) => {
    try {
        const { value, error } = commentSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Security: Ensure task exists in user's company
        const task = await Task.findOne({ 
            _id: value.task_id, 
            company_id: req.user.company_id,
            isDeleted: false 
        });

        if (!task) return res.status(404).json({ message: "Task not found." });

        const comment = await Comment.create({
            ...value,
            user_id: req.user.id
        });

        const populatedComment = await comment.populate("user_id", "firstname lastname email");

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET COMMENTS
export const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Verify task access first
        const task = await Task.findOne({ 
            _id: taskId, 
            company_id: req.user.company_id,
            isDeleted: false 
        });

        if (!task) return res.status(404).json({ message: "Access denied or Task not found." });

        const comments = await Comment.find({ task_id: taskId, isDeleted: false })
            .populate("user_id", "firstname lastname")
            .sort({ createdAt: 1 }); // Oldest first for conversation flow

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. DELETE COMMENT (Soft Delete)
export const deleteComment = async (req, res) => {
    try {
        const query = { _id: req.params.id, isDeleted: false };
        
        // Non-admins can only delete their OWN comments
        if (req.user.system_role !== "ADMIN") {
            query.user_id = req.user.id;
        }

        const comment = await Comment.findOneAndUpdate(query, { isDeleted: true });

        if (!comment) return res.status(404).json({ message: "Comment not found or unauthorized." });

        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};