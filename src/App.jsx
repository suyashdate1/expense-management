import { useState } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import AllExpenses from "./components/AllExpenses";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [currentPage, setCurrentPage] = useState("dashboard");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(
          "http://localhost:8081/api/auth/login",
          {
            email: formData.email,
            password: formData.password,
          }
        );

        // Save JWT token
        localStorage.setItem("token", response.data.token);

        // Open dashboard
        setIsLoggedIn(true);

        console.log("Login response:", response.data);
      } else {
        const response = await axios.post(
          "http://localhost:8081/api/users",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        );

        console.log("Registration response:", response.data);

        setMessage("Account created successfully! Please login.");
        setMessageType("success");

        // Switch to login
        setIsLogin(true);

        setFormData({
          name: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message || "Something went wrong."
        );
      } else {
        setMessage("Unable to connect to the backend.");
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Show dashboard after successful login
  if (isLoggedIn) {
  return currentPage === "dashboard" ? (
    <Dashboard onViewAll={() => setCurrentPage("expenses")} />
  ) : (
    <AllExpenses onBack={() => setCurrentPage("dashboard")} />
  );
}

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">

      {/* Main Container */}
      <div className="w-full max-w-6xl min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden md:flex relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white flex-col justify-between overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full"></div>

          <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/10 rounded-full"></div>

          <div className="relative z-10">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">

              <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                ₹
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wide">
                  Expense Manager
                </h1>

                <p className="text-blue-100 text-xs">
                  Smart financial tracking
                </p>
              </div>

            </div>

            {/* Hero */}
            <div className="max-w-md">

              <p className="text-blue-100 uppercase tracking-[0.2em] text-xs font-semibold mb-4">
                Take control of your finances
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Manage your expenses.
                <span className="block text-blue-100">
                  Simplify your life.
                </span>
              </h2>

              <p className="text-blue-100 leading-relaxed">
                Track your spending, organize your expenses and
                understand where your money goes — all from one
                simple platform.
              </p>

            </div>

            {/* Features */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-sm text-blue-50">
                  Secure JWT authentication
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-sm text-blue-50">
                  Track and manage expenses
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-sm text-blue-50">
                  Personal and secure data
                </span>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="relative z-10 text-xs text-blue-200">
            © 2026 Expense Manager
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">

              <div className="inline-flex w-12 h-12 bg-blue-600 text-white rounded-xl items-center justify-center text-xl font-bold mb-3">
                ₹
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Expense Manager
              </h1>

            </div>

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold text-slate-900">
                {isLogin
                  ? "Welcome back!"
                  : "Create your account"}
              </h2>

              <p className="text-slate-500 mt-2">
                {isLogin
                  ? "Sign in to continue managing your expenses."
                  : "Start managing your finances smarter today."}
              </p>

            </div>

            {/* Login / Register Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-7">

              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isLogin
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  !isLogin
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              {!isLogin && (
                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>
              )}

              {/* Email */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Password */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 pr-20 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.99]"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </button>

            </form>

            {/* Message */}
            {message && (
              <div
                className={`mt-5 p-3 rounded-xl text-sm text-center font-medium ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {message}
              </div>
            )}

            {/* Bottom Link */}
            <p className="text-center text-sm text-slate-500 mt-7">

              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage("");
                }}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;