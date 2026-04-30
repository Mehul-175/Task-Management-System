/* eslint-disable */
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, LayoutDashboard, Users, Kanban } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <h1 className="text-xl font-bold text-slate-900">TaskFlow</h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-slate-600 hover:text-black"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center py-20 px-6 bg-slate-50">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Manage Projects & Teams <br /> Without Chaos
        </h2>

        <p className="text-slate-600 max-w-xl mx-auto mb-8">
          A modern task management system for teams to plan, track and deliver work efficiently.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700"
          >
            Start Free Trial <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Login
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">
          Everything your team needs
        </h3>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="p-6 border rounded-xl text-center">
            <LayoutDashboard className="mx-auto mb-4 text-blue-600" size={32}/>
            <h4 className="font-semibold text-lg mb-2">Project Management</h4>
            <p className="text-slate-600 text-sm">
              Create and manage projects with full visibility.
            </p>
          </div>

          <div className="p-6 border rounded-xl text-center">
            <Kanban className="mx-auto mb-4 text-blue-600" size={32}/>
            <h4 className="font-semibold text-lg mb-2">Kanban Workflow</h4>
            <p className="text-slate-600 text-sm">
              Track tasks with powerful Kanban boards.
            </p>
          </div>

          <div className="p-6 border rounded-xl text-center">
            <Users className="mx-auto mb-4 text-blue-600" size={32}/>
            <h4 className="font-semibold text-lg mb-2">Team Collaboration</h4>
            <p className="text-slate-600 text-sm">
              Assign tasks and collaborate in real time.
            </p>
          </div>

        </div>
      </section>

      {/* PRICING PREVIEW (optional teaser, not full plans) */}
      <section className="bg-slate-50 py-16 text-center">
        <h3 className="text-3xl font-bold mb-4">Simple Pricing</h3>
        <p className="text-slate-600 mb-8">
          Choose a plan after signup. No upfront commitment.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
        >
          View Plans
        </button>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-sm text-slate-500 border-t">
        © {new Date().getFullYear()} TaskFlow. All rights reserved.
      </footer>

    </div>
  );
};

export default Landing;