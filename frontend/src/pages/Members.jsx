/* eslint-disable */
import React, { useEffect, useState } from "react";
import api from "../api/api";

const statusStyles = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-200 text-slate-700",
};

const emptyForm = {
  firstname: "",
  lastname: "",
  email: "",
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/user/members");
      setMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/user/add-member", {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
      });

      setFormData(emptyForm);
      setSuccessMessage(
        `Member created. Username: ${res.data.user.username}`
      );
      await fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoadingId(member._id);
    setError("");
    setSuccessMessage("");

    try {
      const res = await api.put(`/user/member/${member._id}`, {
        status: nextStatus,
      });

      setMembers((prev) =>
        prev.map((item) => (item._id === member._id ? res.data : item))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Deactivate ${member.firstname} ${member.lastname}?`)) {
      return;
    }

    setActionLoadingId(member._id);
    setError("");
    setSuccessMessage("");

    try {
      await api.delete(`/user/member/${member._id}`);
      setMembers((prev) => prev.filter((item) => item._id !== member._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate member");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Members</h1>
        <p className="text-sm text-slate-500">
          Add teammates, manage access, and keep your project roster healthy.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <form
          onSubmit={handleCreateMember}
          className="rounded-2xl border bg-white p-6 space-y-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Member
            </h2>
            <p className="text-sm text-slate-500">
              We will create the username automatically and send a welcome email.
            </p>
          </div>

          <input
            value={formData.firstname}
            onChange={(e) => updateField("firstname", e.target.value)}
            placeholder="First name"
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />

          <input
            value={formData.lastname}
            onChange={(e) => updateField("lastname", e.target.value)}
            placeholder="Last name"
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />

          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Email address"
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Member"}
          </button>
        </form>

        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Team Directory
              </h2>
              <p className="text-sm text-slate-500">
                {members.length} member{members.length === 1 ? "" : "s"} in your company
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-600 animate-spin"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center">
              <p className="text-lg font-medium text-slate-700">No members yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Add your first teammate to start assigning work inside projects.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const isBusy = actionLoadingId === member._id;

                return (
                  <div
                    key={member._id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-900">
                          {member.firstname} {member.lastname}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[member.status] || "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">{member.email}</p>
                      <p className="text-xs text-slate-400">
                        Username: {member.username}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        disabled={isBusy}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isBusy
                          ? "Updating..."
                          : member.status === "ACTIVE"
                            ? "Mark Inactive"
                            : "Mark Active"}
                      </button>

                      <button
                        onClick={() => handleDelete(member)}
                        disabled={isBusy}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isBusy ? "Working..." : "Deactivate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;
