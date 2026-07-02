import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosInstance";
import { useGoogleLogin } from "@react-oauth/google";
import { Mail, Lock, User, ShieldAlert, ArrowRight } from "lucide-react";

export const AuthPage = () => {
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ loading: false, error: null });

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: null });
  };

  // ==========================================
  // 🔐 2. Standard Form Login / Registration
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    const endpoint = isLoginView ? "/users/login" : "/users/register";
    const payload = isLoginView
      ? { email: formData.email, password: formData.password }
      : formData;

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
    onError: (error) => {
      console.error("Google popup error instance:", error);
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

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50 font-sans">
      {/* Visual Brand Space */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <span className="text-2xl font-black tracking-wider bg-white/10 px-4 py-1.5 rounded-xl border border-white/20 w-max">
          ExamPulse AI
        </span>
        <div className="max-w-md space-y-4">
          <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
            Study smarter, score higher.
          </h2>
          <p className="text-indigo-100 text-lg">
            Upload text files or notes. Let Generative AI extract critical
            concept blueprints in seconds.
          </p>
        </div>
        <p className="text-xs text-indigo-300">
          &copy; 2026 ExamPulse AI Engine Platform. All rights reserved.
        </p>
      </div>

      {/* Interface Entry Forms */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {isLoginView
                ? "Welcome back to workspace"
                : "Create your student account"}
            </h1>
            <p className="text-sm text-slate-500">
              {isLoginView
                ? "Don't have an account?"
                : "Already possess an active profile?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setStatus({ loading: false, error: null });
                }}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {isLoginView ? "Sign up free" : "Sign in here"}
              </button>
            </p>
          </div>

          {/* Feedback Handling */}
          {status.error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>{status.error}</p>
            </div>
          )}

          {/* Core Input Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginView && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@university.com"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm"
            >
              {status.loading
                ? "Processing credentials..."
                : isLoginView
                  ? "Sign In to Engine"
                  : "Complete Registration"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Provider Option Blocks */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => triggerGoogleLogin()}
              disabled={status.loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-all"
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
            </button>

            <button
              type="button"
              onClick={triggerGitHubLogin}
              disabled={status.loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-all"
            >
              <User className="h-4 w-4 text-white" />{" "}
              {/* 🔍 Fixed to render Github logo */}
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
