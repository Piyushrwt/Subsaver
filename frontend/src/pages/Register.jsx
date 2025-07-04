import { useNavigate, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/api/auth";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import OnlinePaymentsSVG from "../assets/Subscription.svg";

export default function Register() {
  const { login: setAuth, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (user) {
    // If already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => { 
      setAuth(data); 
      toast.success("Registered successfully"); 
      navigate("/dashboard"); 
    },
    onError: (err) => toast.error(err.response?.data?.message || "Registration failed"),
  });

  // Split-screen card layout for registration
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-2">
      {/* Main Card */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
        {/* Left: Registration Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-10 py-8 sm:py-12">
          {/* Logo/App Name */}
          <div className="flex items-center gap-2 mb-6">
            {/* Simple logo icon (replace with your own if desired) */}
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#166534"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-2xl font-bold text-green-500 tracking-tight">Subsaver</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-zinc-400 mb-8">Sign up to manage your subscriptions easily</p>
          <form
            onSubmit={e => {e.preventDefault(); mutation.mutate(Object.fromEntries(new FormData(e.target)));}}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="block text-sm text-zinc-300 mb-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                placeholder="Full Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-700 transition pr-12"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-green-400 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye open icon
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    // Eye closed icon
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.458 12c1.274 4.057 5.065 7 9.542 7 1.956 0 3.783-.5 5.304-1.377M6.222 6.222A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.523 10.523 0 01-4.21 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364L6.222 6.222m0 0L3 3m3.222 3.222l12.728 12.728" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg transition disabled:opacity-60 shadow-md mt-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="text-center text-sm text-zinc-400 mt-6">
            Already have an account? <a href="/login" className="text-green-400 hover:underline">Login</a>
          </div>
        </div>
        {/* Right: Illustration and Marketing Message */}
        <div className="hidden md:flex flex-col justify-center items-center flex-1 bg-zinc-950 border-l border-zinc-800 p-6 md:p-10">
          <img
            src={OnlinePaymentsSVG}
            alt="Subscription illustration"
            className="w-40 h-32 sm:w-56 sm:h-44 object-contain mb-4"
          />
          <h3 className="text-lg sm:text-xl font-bold text-green-400 mt-8 mb-2 text-center">All your subscriptions, one dashboard</h3>
          <p className="text-zinc-300 text-center max-w-xs">Track, manage, and get reminders for every online service you use. Stay in control and never miss a renewal again!</p>
        </div>
      </div>
    </div>
  );
}
