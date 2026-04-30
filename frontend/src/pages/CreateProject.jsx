/* eslint-disable */
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const memberStatusStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-200 text-slate-700",
};

const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
    status: "PLANNED",
    assigned_users: [],
  });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      setMembersError("");

      try {
        const res = await api.get("/user/members");
        setMembers(res.data);
      } catch (err) {
        setMembers([]);
        setMembersError(
          err.response?.data?.message || "Failed to fetch members"
        );
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/project", {
        ...formData,
        shortName: formData.shortName.trim().toUpperCase(),
      });
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.assigned_users.includes(userId);

      return {
        ...prev,
        assigned_users: exists
          ? prev.assigned_users.filter((id) => id !== userId)
          : [...prev.assigned_users, userId],
      };
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Project
        </h1>
        <p className="text-sm text-slate-500">
          Set up a new workspace, choose a status, and assign the right people from day one.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Basic Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Project Name"
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              required
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />

            <input
              placeholder="Short Name (e.g. WEB)"
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 uppercase"
              required
              maxLength={10}
              value={formData.shortName}
              onChange={(e) => updateField("shortName", e.target.value.toUpperCase())}
            />
          </div>

          <textarea
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Project Status
          </h2>

          <select
            className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            value={formData.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Assign Members
              </h2>
              <p className="text-sm text-slate-500">
                {formData.assigned_users.length} selected
              </p>
            </div>
          </div>

          {membersError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {membersError}
            </div>
          )}

          {membersLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-600 animate-spin"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
              <p className="text-lg font-medium text-slate-700">
                No members available
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Add teammates from the Members page before assigning them to projects.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-3">
              {members.map((user) => {
                const isSelected = formData.assigned_users.includes(user._id);

                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleUserToggle(user._id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Username: {user.username}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            memberStatusStyles[user.status] || "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {user.status}
                        </span>

                        {isSelected && (
                          <span className="text-xs font-medium text-indigo-600">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
