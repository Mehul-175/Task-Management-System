/* eslint-disable */
import React from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Kanban, LogOut } from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || user.system_role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <aside className="w-64 shrink-0 bg-white border-r flex flex-col justify-between">
        <div className="p-5">
          <h2 className="text-xl font-bold mb-8 tracking-tight">
            TaskFlow
          </h2>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${isActive("/dashboard")
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            {role === "ADMIN" && (
              <>
                <Link
                  to="/members"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                    ${isActive("/members")
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Users size={18} /> Members
                </Link>

                <Link
                  to="/projects"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                    ${isActive("/projects")
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Kanban size={18} /> Projects
                </Link>
              </>
            )}

            {role === "USER" && (
              <Link
                to="/my-tasks"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${isActive("/my-projects")
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <Kanban size={18} /> My Projects
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 py-2.5 rounded-lg transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center">
          <h1 className="font-semibold text-lg tracking-tight">
            Dashboard
          </h1>

          <div className="text-sm text-slate-600 font-medium">
            {user.firstname} - {role}
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
