/* eslint-disable */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import Kanban from "./pages/Kanban";
import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";

import DashboardLayout from "./layouts/DashboardLayout";

const SuperAdminPlans = () => <div className="text-2xl">Plan Management</div>;
const Unauthorized = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-lg text-slate-600">
    You do not have permission to view this page.
  </div>
);

const getRoleHome = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || user.system_role;

  if (role === "ADMIN") return "/dashboard";
  if (role === "USER") return "/my-projects";
  if (role === "SUPER_ADMIN") return "/super-admin/plans";
  return "/";
};

function App() {
  const token = localStorage.getItem("token");
  const homeRoute = getRoleHome();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to={homeRoute} replace /> : <Landing />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:projectId" element={<Kanban />} />
          <Route path="/my-tasks" element={<MyTasks />} />

          <Route
            path="/projects/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/members"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Members />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/super-admin/plans"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminPlans />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            token ? (
              <Navigate to={homeRoute} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
