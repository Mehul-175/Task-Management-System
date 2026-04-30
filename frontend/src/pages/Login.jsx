/* eslint-disable */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import api from "../api/api";

const getRoleHome = (role) => {
  if (role === "ADMIN") return "/dashboard";
  if (role === "USER") return "/my-projects";
  if (role === "SUPER_ADMIN") return "/super-admin/plans";
  return "/";
};

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.identifier.trim() || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        password: formData.password,
      };

      if (formData.identifier.includes("@")) {
        payload.email = formData.identifier;
      } else {
        payload.username = formData.identifier;
      }

      const res = await api.post("/auth/login", payload);

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(getRoleHome(res.data.user.role));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto mb-3 text-indigo-600 w-10 h-10" />
          <h2 className="text-2xl font-semibold text-slate-800">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">Login to your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Email or Username"
              className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={formData.identifier}
              onChange={(e) => {
                setFormData({ ...formData, identifier: e.target.value });
                setError("");
              }}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError("");
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-medium text-indigo-600 hover:underline focus:outline-none"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;