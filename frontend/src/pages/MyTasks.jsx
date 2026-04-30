/* eslint-disable */
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const priorityStyles = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-rose-100 text-rose-700",
};

const statusStyles = {
  "To-Do": "bg-slate-100 text-slate-700",
  "In-Progress": "bg-blue-100 text-blue-700",
  Testing: "bg-amber-100 text-amber-700",
  "QA-Verified": "bg-violet-100 text-violet-700",
  Deployment: "bg-cyan-100 text-cyan-700",
  Done: "bg-emerald-100 text-emerald-700",
  "Re-Open": "bg-rose-100 text-rose-700",
};

const MyTasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await api.get("/task");
      setTasks(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFiltered(tasks);
    } else {
      setFiltered(tasks.filter((t) => t.status === statusFilter));
    }
  }, [statusFilter, tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500">
            All tasks assigned to you across projects
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="ALL">All</option>
          <option value="To-Do">To-Do</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Testing">Testing</option>
          <option value="QA-Verified">QA</option>
          <option value="Deployment">Deployment</option>
          <option value="Done">Done</option>
          <option value="Re-Open">Re-Open</option>
        </select>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-white">
          <p className="text-slate-500">No tasks found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((task) => (
            <div
              key={task._id}
              onClick={() => navigate(`/project/${task.project_id}`)}
              className="bg-white border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-[2px] transition cursor-pointer"
            >

              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-slate-400">{task.task_id}</p>
                  <h3 className="font-semibold text-slate-800">
                    {task.title}
                  </h3>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    priorityStyles[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {task.description || "No description"}
              </p>

              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    statusStyles[task.status]
                  }`}
                >
                  {task.status}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {task.priority === "URGENT" && (
                    <AlertTriangle size={14} className="text-rose-500" />
                  )}
                  {task.status === "Done" && (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                  {task.status === "In-Progress" && (
                    <Clock size={14} className="text-blue-500" />
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;