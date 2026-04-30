/* eslint-disable */
import React, { useEffect, useState } from "react";
import api from "../api/api";

const getCommentAuthor = (comment) => {
  const user = comment.user_id;

  if (!user) return "Unknown user";

  return `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email || "Unknown user";
};

const formatCommentTime = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const priorityStyles = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-rose-100 text-rose-700",
};

const TaskModal = ({ task, onClose, refresh }) => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = currentUser.role || currentUser.system_role;
  const isAssignee = task.assignees?.some(
    (assignee) => assignee._id === currentUser.id
  );
  const canEditTask = role === "ADMIN" || isAssignee;
  const canDeleteTask = role === "ADMIN";

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentError("");

    try {
      const res = await api.get(`/comment/${task._id}`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
      setCommentError(err.response?.data?.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [task._id]);

  const handleUpdate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await api.put(`/task/${task._id}`, {
        title,
        description,
      });
      await refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/task/${task._id}`);
      await refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();

    if (!content) return;

    setSendingComment(true);
    setCommentError("");

    try {
      const res = await api.post("/comment", {
        task_id: task._id,
        content,
      });

      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col relative z-10">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Task Details</h2>
            <p className="text-sm text-slate-400">
              {task.task_id || "Task"} - {task.status}
            </p>
          </div>
          <button onClick={onClose}>x</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                priorityStyles[task.priority] || "bg-slate-100 text-slate-700"
              }`}
            >
              {task.priority || "MEDIUM"} priority
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {task.status}
            </span>
          </div>

          <div>
            <label className="text-sm text-gray-500">Title</label>
            <input
              className="w-full border px-3 py-2 rounded mt-1"
              value={title}
              disabled={!canEditTask}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Description</label>
            <textarea
              rows={4}
              className="w-full border px-3 py-2 rounded mt-1"
              value={description}
              disabled={!canEditTask}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {task.assignees?.length > 0 && (
            <div>
              <label className="text-sm text-gray-500">Assignees</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.assignees.map((assignee) => (
                  <span
                    key={assignee._id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {assignee.firstname} {assignee.lastname}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.report_to && (
            <div>
              <label className="text-sm text-gray-500">Reported By</label>
              <p className="mt-2 text-sm text-slate-700">
                {task.report_to.firstname} {task.report_to.lastname}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-500">Comments</label>

            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 border px-3 py-2 rounded"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={sendingComment || !newComment.trim()}
                className="bg-blue-600 text-white px-4 rounded disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingComment ? "Sending..." : "Send"}
              </button>
            </div>

            {commentError && (
              <p className="mt-2 text-sm text-red-500">{commentError}</p>
            )}

            <div className="mt-4 space-y-3">
              {commentsLoading ? (
                <p className="text-sm text-gray-400">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-400">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-100 p-3 rounded text-sm"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        {getCommentAuthor(comment)}
                      </span>
                      <span>{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-800">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-between">
          {canDeleteTask ? (
            <button
              onClick={handleDelete}
              className="text-red-600"
            >
              Delete
            </button>
          ) : (
            <div className="text-sm text-slate-400">
              Only admins can delete tasks
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose}>Cancel</button>

            <button
              onClick={handleUpdate}
              disabled={loading || !canEditTask}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
