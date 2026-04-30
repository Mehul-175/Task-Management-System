/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Building2, User, Mail, Lock, ArrowRight, AtSign, Eye, EyeOff } from "lucide-react";
import api from "../api/api.js";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    companyName: "",
  });

  useEffect(() => {
    if (step !== 3) return;

    const fetchPlans = async () => {
      setLoadingPlans(true);
      setError("");

      try {
        const res = await api.get("/plan");
        setPlans(res.data.filter((plan) => plan.status === "ACTIVE"));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [step]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const goToCompanyStep = () => {
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      formData.password.length < 6
    ) {
      setError("Please fill all account fields. Password must be at least 6 characters.");
      return;
    }

    setStep(2);
  };

  const goToPlanStep = () => {
    if (!formData.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    setStep(3);
  };

  const handleSubmit = async (planId) => {
    setLoading(true);
    setError("");

    const payload = {
      adminDetails: {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        middlename: "",
      },
      companyDetails: {
        name: formData.companyName.trim(),
      },
      planId,
    };

    try {
      const res = await api.post("/auth/register", payload);

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }

      alert("Account created. Please login after your company is activated.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // FIX: Converted from a Component to a helper function
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${step === item
              ? "bg-indigo-600 text-white"
              : step > item
                ? "bg-green-500 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {step > item ? "OK" : item}
          </div>
          {item < 3 && <div className="w-6 h-[2px] bg-slate-200" />}
        </div>
      ))}
    </div>
  );

  // FIX: Converted from a Component to a helper function
  const renderErrorMessage = () => (
    error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null
  );

  // FIX: Converted from a Component to a helper function
  const renderContainer = (children) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100">
        {renderStepIndicator()}
        {renderErrorMessage()}
        {children}
      </div>
    </div>
  );

  if (step === 1) {
    return renderContainer(
      <>
        <div className="text-center mb-6">
          <User className="mx-auto mb-3 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-800">
            Create Account
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="First Name"
              className="px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              value={formData.firstname}
              onChange={(e) => updateField("firstname", e.target.value)}
            />
            <input
              placeholder="Last Name"
              className="px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              value={formData.lastname}
              onChange={(e) => updateField("lastname", e.target.value)}
            />
          </div>

          <div className="relative">
            <AtSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              value={formData.username}
              onChange={(e) => updateField("username", e.target.value)}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={goToCompanyStep}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-indigo-700"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-indigo-600 hover:underline focus:outline-none"
          >
            Login here
          </button>
        </p>
      </>
    );
  }

  if (step === 2) {
    return renderContainer(
      <>
        <div className="text-center mb-6">
          <Building2 className="mx-auto mb-3 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-800">
            Organization Setup
          </h2>
        </div>

        <input
          placeholder="Company Name"
          className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
          value={formData.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="w-full border border-slate-200 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={goToPlanStep}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Continue
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {renderStepIndicator()}
        {renderErrorMessage()}

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-sm text-slate-500">
          Your company will activate after payment confirmation.
        </p>

        {loadingPlans ? (
          <p className="text-slate-500 mt-8">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="text-slate-500 mt-8">No active plans available.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white p-6 rounded-2xl border hover:shadow-lg transition flex flex-col"
              >
                <h3 className="font-semibold text-slate-800">
                  {plan.name}
                </h3>

                <div className="text-3xl font-bold text-indigo-600 my-4">
                  Rs. {plan.price}
                </div>

                <ul className="text-sm text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    {plan.max_users} Users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    {plan.max_projects} Projects
                  </li>
                </ul>

                <button
                  onClick={() => handleSubmit(plan._id)}
                  disabled={loading}
                  className="mt-auto bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Select Plan"}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setStep(2)}
          className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Back to organization setup
        </button>
      </div>
    </div>
  );
};

export default Register;