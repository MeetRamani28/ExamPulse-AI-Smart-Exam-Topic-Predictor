import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosInstance";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiMail,
  FiLock,
  FiUser,
  FiAlertTriangle,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiZap,
} from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

export const AuthPage = () => {
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [status, setStatus] = useState({ loading: false, error: null });
  const [showPassword, setShowPassword] = useState(false);
  const [activeInput, setActiveInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", password: "" },
  });

  // ==========================================
  // ⚡ 1. Catch Github Redirect Code on Mount
  // ==========================================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubCode = urlParams.get("code");

    if (githubCode) {
      const handleGithubCallback = async () => {
        setStatus({ loading: true, error: null });
        try {
          const response = await API.post("/users/social-auth", {
            provider: "github",
            code: githubCode,
          });

          if (response.data.success) {
            login(response.data.user, response.data.token);
          }
        } catch (err) {
          setStatus({
            loading: false,
            error:
              err.response?.data?.message ||
              "GitHub authorization parsing failed.",
          });
        } finally {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      };
      handleGithubCallback();
    }
  }, [login]);

  const toggleViewMode = () => {
    setIsLoginView((prev) => !prev);
    setStatus({ loading: false, error: null });
    reset();
  };

  // ==========================================
  // 🔐 2. Standard Form Login / Registration
  // ==========================================
  const onAuthSubmit = async (data) => {
    setStatus({ loading: true, error: null });
    const endpoint = isLoginView ? "/users/login" : "/users/register";
    const payload = isLoginView
      ? { email: data.email, password: data.password }
      : data;

    try {
      const response = await API.post(endpoint, payload);
      if (response.data.success) {
        login(response.data.user, response.data.token);
      }
    } catch (err) {
      setStatus({
        loading: false,
        error:
          err.response?.data?.message || "Connection to API engine failed! ❌",
      });
    }
  };

  // ==========================================
  // 🌐 3. Real Google Login SDK Integration
  // ==========================================
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setStatus({ loading: true, error: null });
      try {
        const response = await API.post("/users/social-auth", {
          provider: "google",
          accessToken: tokenResponse.access_token,
        });

        if (response.data.success) {
          login(response.data.user, response.data.token);
        }
      } catch (err) {
        setStatus({
          loading: false,
          error:
            err.response?.data?.message ||
            "Google payload validation mapping failed.",
        });
      }
    },
    onError: () => {
      setStatus({
        loading: false,
        error: "Google authentication handshake aborted.",
      });
    },
  });

  // ==========================================
  // 💻 4. Real GitHub Window Redirect Auth
  // ==========================================
  const triggerGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin;
    setStatus({ loading: true, error: null });
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const getIconColor = (fieldName, errorState) => {
    if (errorState)
      return "text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]";
    if (activeInput === fieldName)
      return "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]";
    return "text-slate-300 opacity-90";
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-16 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0d1326] to-[#070a12] border-r border-slate-800/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />

        <div className="relative z-10 flex items-center gap-3 group">
          <motion.div
            animate={{
              boxShadow: [
                "0 10px 15px -3px rgba(99, 102, 241, 0.2)",
                "0 0px 25px 5px rgba(99, 102, 241, 0.5)",
                "0 10px 15px -3px rgba(99, 102, 241, 0.2)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border border-indigo-400/30 text-white shadow-lg"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <FiZap className="h-5 w-5 fill-white" />
            </motion.div>
          </motion.div>

          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-400 font-sans">
            ExamPulse AI
          </span>
        </div>

        <div className="relative z-10 max-w-xl space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400"
          >
            Study smarter.
            <br />
            Score higher.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-slate-400 text-lg leading-relaxed max-w-md"
          >
            Drop heavy course documents or notes. Our deep RAG pipeline extracts
            prioritized core topics, structures, and study definitions
            instantly.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-600 font-medium">
          <p>&copy; 2026 ExamPulse Platform Core Engine.</p>
          <div className="flex gap-4">
            <a href="#terms" className="hover:text-slate-400 transition-colors">
              Terms
            </a>
            <a
              href="#privacy"
              className="hover:text-slate-400 transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex items-center justify-center p-8 sm:p-16 relative bg-[#070a13]">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="space-y-2.5">
            <motion.h1
              key={isLoginView ? "login-title" : "register-title"}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-tight text-white"
            >
              {isLoginView ? "Access your workspace" : "Create student profile"}
            </motion.h1>
            <p className="text-sm text-slate-400">
              {isLoginView
                ? "New to the platform?"
                : "Already active inside the workspace?"}{" "}
              <button
                type="button"
                onClick={toggleViewMode}
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30 cursor-pointer"
              >
                {isLoginView ? "Get started free" : "Sign in to account"}
              </button>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status.error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-sm font-medium"
              >
                <FiAlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <p>{status.error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onAuthSubmit)} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLoginView && (
                <motion.div
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-1.5"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 z-20 pointer-events-none">
                      <FiUser
                        className={`h-5 w-5 transition-all duration-200 ${getIconColor("name", errors.name)}`}
                      />
                    </div>
                    <input
                      type="text"
                      {...register("name", {
                        required: !isLoginView
                          ? "Name parameter is required"
                          : false,
                      })}
                      onFocus={() => setActiveInput("name")}
                      onBlur={() => setActiveInput("")}
                      placeholder="John Doe"
                      className={`w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border ${errors.name ? "border-rose-500 focus:ring-rose-500/10" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"} rounded-2xl outline-none focus:ring-4 text-white text-sm font-medium transition-all backdrop-blur-sm relative z-10`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs font-bold text-rose-400 mt-1 pl-1">
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 z-20 pointer-events-none">
                  <FiMail
                    className={`h-5 w-5 transition-all duration-200 ${getIconColor("email", errors.email)}`}
                  />
                </div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email mapping parameter required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format structure",
                    },
                  })}
                  onFocus={() => setActiveInput("email")}
                  onBlur={() => setActiveInput("")}
                  placeholder="name@university.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border ${errors.email ? "border-rose-500 focus:ring-rose-500/10" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"} rounded-2xl outline-none focus:ring-4 text-white text-sm font-medium transition-all backdrop-blur-sm relative z-10`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-bold text-rose-400 mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Secure Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 z-20 pointer-events-none">
                  <FiLock
                    className={`h-5 w-5 transition-all duration-200 ${getIconColor("password", errors.password)}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 z-20 text-slate-400 hover:text-indigo-400 active:scale-95 transition-all duration-200 p-1 rounded-lg cursor-pointer focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                  ) : (
                    <FiEye className="h-5 w-5 opacity-70 hover:opacity-100" />
                  )}
                </button>

                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password mapping sequence required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters required",
                    },
                  })}
                  onFocus={() => setActiveInput("password")}
                  onBlur={() => setActiveInput("")}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border ${errors.password ? "border-rose-500 focus:ring-rose-500/10" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"} rounded-2xl outline-none focus:ring-4 text-white text-sm font-medium transition-all backdrop-blur-sm relative z-10`}
                />
              </div>
              {errors.password && (
                <p className="text-xs font-bold text-rose-400 mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={status.loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-500/20 border border-indigo-500/30 transition-all duration-200 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {status.loading
                ? "Processing Engine Sequence..."
                : isLoginView
                  ? "Sign In to Engine"
                  : "Complete Registration"}
              <FiArrowRight className="h-4 w-4" />
            </motion.button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800/80"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Or authenticate via
            </span>
            <div className="flex-grow border-t border-slate-800/80"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              type="button"
              onClick={() => triggerGoogleLogin()}
              disabled={status.loading}
              whileHover={{ y: -1, bg: "#161d30" }}
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-slate-900/40 border border-slate-800 text-slate-300 text-sm font-bold rounded-2xl shadow-sm hover:text-white transition-all cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </motion.button>

            <motion.button
              type="button"
              onClick={triggerGitHubLogin}
              disabled={status.loading}
              whileHover={{ y: -1, bg: "#1e2433" }}
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-[#161b22] border border-slate-800 text-white text-sm font-bold rounded-2xl shadow-sm hover:border-slate-700 transition-all cursor-pointer group"
            >
              <FaGithub className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors duration-200" />
              GitHub
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
