import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    task_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Task", 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    content: { 
        type: String, 
        required: true, 
        trim: true 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

// Index for fast retrieval of comments for a specific task
commentSchema.index({ task_id: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;