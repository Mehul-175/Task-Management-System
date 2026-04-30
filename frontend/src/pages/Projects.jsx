/* eslint-disable */
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  PLANNED: "bg-slate-200 text-slate-700",
  ONGOING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
};

const Projects = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/project");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Projects
          </h1>
          <p className="text-sm text-slate-500">
            Manage and track all your workspaces
          </p>
        </div>

        {(user.system_role || user.role) === "ADMIN" && (
          <button
            onClick={() => navigate("/projects/create")}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            + New Project
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border rounded-2xl bg-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            No projects yet
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Start by creating your first project
          </p>

          {(user.system_role || user.role) === "ADMIN" && (
            <button
              onClick={() => navigate("/projects/create")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-lg hover:-translate-y-[2px] transition cursor-pointer flex flex-col"
            >

              {/* TOP */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-slate-800 group-hover:text-slate-900">
                  {project.name}
                </h3>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    statusStyles[project.status] || "bg-slate-200 text-slate-700"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-slate-600 mb-6 line-clamp-3">
                {project.description || "No description provided"}
              </p>

              {/* FOOTER */}
              <div className="mt-auto flex justify-between items-center text-xs text-slate-400">
                <span>
                  {project.shortName || "N/A"}
                </span>

                <span className="opacity-0 group-hover:opacity-100 transition">
                  Open →
                </span>
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Projects;