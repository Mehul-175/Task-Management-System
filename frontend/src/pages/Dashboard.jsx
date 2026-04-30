/* eslint-disable */
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const statCardStyles = [
  "bg-white border border-slate-200",
  "bg-white border border-slate-200",
  "bg-white border border-slate-200",
  "bg-white border border-slate-200",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || user.system_role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get("/project"),
        api.get("/task"),
      ]);

      const projectsData = projectsRes.data || [];
      const tasksData = tasksRes.data || [];

      setProjects(projectsData);
      setTasks(tasksData);

      const completed = tasksData.filter((t) => t.status === "Done").length;

      setStats({
        totalProjects: projectsData.length,
        totalTasks: tasksData.length,
        completedTasks: completed,
        pendingTasks: tasksData.length - completed,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const myTasks =
    role === "USER"
      ? tasks.filter((task) =>
          task.assignees?.some((a) => a._id === user.id)
        )
      : tasks;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Overview of your workspace and activity
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`p-5 rounded-2xl ${statCardStyles[0]}`}>
          <div className="flex items-center justify-between mb-3">
            <LayoutDashboard className="text-slate-500" size={20} />
            <span className="text-xs text-slate-400">Projects</span>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {stats.totalProjects}
          </p>
        </div>

        <div className={`p-5 rounded-2xl ${statCardStyles[1]}`}>
          <div className="flex items-center justify-between mb-3">
            <FolderKanban className="text-slate-500" size={20} />
            <span className="text-xs text-slate-400">Tasks</span>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {stats.totalTasks}
          </p>
        </div>

        <div className={`p-5 rounded-2xl ${statCardStyles[2]}`}>
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="text-emerald-500" size={20} />
            <span className="text-xs text-slate-400">Completed</span>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {stats.completedTasks}
          </p>
        </div>

        <div className={`p-5 rounded-2xl ${statCardStyles[3]}`}>
          <div className="flex items-center justify-between mb-3">
            <Clock className="text-amber-500" size={20} />
            <span className="text-xs text-slate-400">Pending</span>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {stats.pendingTasks}
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* RECENT TASKS */}
        <div className="bg-white border rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Tasks
            </h2>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tasks created yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/project/${task.project_id}`)}
                  className="p-4 border rounded-xl hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {task.status}
                      </p>
                    </div>

                    <span className="text-xs text-slate-400">
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY TASKS */}
        <div className="bg-white border rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {role === "USER" ? "My Tasks" : "All Tasks"}
            </h2>
          </div>

          {myTasks.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tasks available
            </p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {myTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/project/${task.project_id}`)}
                  className="p-4 border rounded-xl hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {task.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.priority === "URGENT" && (
                        <AlertTriangle size={14} className="text-rose-500" />
                      )}
                      <span className="text-xs text-slate-400">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* PROJECT QUICK ACCESS */}
      <div className="bg-white border rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Projects
          </h2>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">
            No projects available
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className="p-4 border rounded-xl hover:shadow hover:-translate-y-px transition cursor-pointer"
              >
                <p className="font-medium text-slate-800">
                  {project.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {project.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;