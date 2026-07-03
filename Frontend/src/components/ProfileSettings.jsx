import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export const ProfileSettings = () => {
  const { user, login } = useAuth();
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeInput, setActiveInput] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      currentPassword: "",
      newPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedMimeTypes.includes(file.type)) {
        setStatus({
          loading: false,
          success: null,
          error:
            "Invalid format! Asset file must match PNG or JPG configurations. ❌",
        });
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setStatus({ loading: false, error: null, success: null });
    }
  };

  const onProfileSubmit = async (data) => {
    setStatus({ loading: true, error: null, success: null });

    const updatePayload = new FormData();
    updatePayload.append("name", data.name.trim());

    if (selectedFile) {
      updatePayload.append("avatar", selectedFile);
    }

    if (data.newPassword) {
      updatePayload.append("currentPassword", data.currentPassword);
      updatePayload.append("newPassword", data.newPassword);
    }

    try {
      const response = await API.put("/users/update-profile", updatePayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        login(
          response.data.user,
          response.data.token || localStorage.getItem("token"),
        );

        setStatus({
          loading: false,
          error: null,
          success: "Workspace profile updated beautifully! ✨",
        });

        reset({
          name: response.data.user.name,
          currentPassword: "",
          newPassword: "",
        });
        setSelectedFile(null);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
      }
    } catch (err) {
      setStatus({
        loading: false,
        success: null,
        error:
          err.response?.data?.message ||
          "Engine failed to process profile synchronization updates.",
      });
    }
  };

  const getIconColor = (fieldName, errorState) => {
    if (errorState)
      return "text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]";
    if (activeInput === fieldName)
      return "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]";
    return "text-slate-400 opacity-80";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-[#0d1326]/60 border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
    >
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Account Workspace Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synchronize identity metadata credentials and profile layouts.
          </p>
        </div>
        <span className="text-[10px] font-bold tracking-widest bg-slate-900 border border-slate-800 text-indigo-400 px-3.5 py-1.5 rounded-xl uppercase self-start sm:self-auto shadow-inner">
          {user?.provider || "local"} account
        </span>
      </div>

      <AnimatePresence mode="wait">
        {status.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-sm font-medium mb-6"
          >
            <FiAlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <p>{status.error}</p>
          </motion.div>
        )}
        {status.success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-sm font-medium mb-6"
          >
            <FiCheckCircle className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <p>{status.success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40 shadow-inner backdrop-blur-sm">
          <div className="relative group cursor-pointer">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500/80 transition-all shadow-xl bg-slate-950 flex items-center justify-center relative z-10">
              <img
                src={avatarPreview}
                alt="Profile collection indicator"
                className="h-full w-full object-cover"
              />
            </div>
            <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex items-center justify-center cursor-pointer text-white z-20 shadow-2xl">
              <FiCamera className="h-6 w-6 transform scale-90 group-hover:scale-100 transition-transform" />
              <input
                type="file"
                name="avatar"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-bold text-slate-200">
              Profile Avatar Image
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Supports square PNG or JPG variants. Automated face-centering
              crops render on upload updates.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Workspace Name
          </label>
          <div className="relative flex items-center">
            <FiUser
              className={`absolute left-4 z-20 transition-all h-5 w-5 ${getIconColor("name", errors.name)}`}
            />
            <input
              type="text"
              {...register("name", {
                required: "Username field parameters cannot be empty.",
              })}
              onFocus={() => setActiveInput("name")}
              onBlur={() => setActiveInput("")}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10 rounded-2xl outline-none focus:ring-4 text-white text-sm font-medium transition-all backdrop-blur-sm"
            />
          </div>
          {errors.name && (
            <p className="text-xs font-bold text-rose-400 pl-1 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 opacity-50 select-none">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Locked Email Address
          </label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-4 z-20 text-slate-600 h-5 w-5" />
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-900 rounded-2xl text-slate-500 text-sm font-medium outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {user?.provider === "local" ? (
          <div className="border-t border-slate-800/80 pt-6 mt-6 space-y-4">
            <h3 className="text-xs font-black text-indigo-400 tracking-wider uppercase">
              Rotate Security Keys (Reset Password)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password Key Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <FiLock
                    className={`absolute left-4 z-20 transition-all h-5 w-5 ${getIconColor("newPassword", errors.newPassword)}`}
                  />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword", {
                      minLength: {
                        value: 6,
                        message: "Must exceed 5 characters.",
                      },
                    })}
                    onFocus={() => setActiveInput("newPassword")}
                    onBlur={() => setActiveInput("")}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10 rounded-2xl outline-none focus:ring-4 text-white text-sm font-medium transition-all backdrop-blur-sm placeholder:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 z-20 text-slate-400 hover:text-indigo-400 transition-colors p-1"
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="h-4 w-4" />
                    ) : (
                      <FiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs font-bold text-rose-400 pl-1 mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Current Password Verification Validation Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Verify Current Password
                </label>
                <div className="relative flex items-center">
                  <FiLock
                    className={`absolute left-4 z-20 transition-all h-5 w-5 ${getIconColor("currentPassword", errors.currentPassword)}`}
                  />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    {...register("currentPassword", {
                      required: {
                        value: !!newPasswordValue,
                        message: "Required to authorize key changes.",
                      },
                    })}
                    onFocus={() => setActiveInput("currentPassword")}
                    onBlur={() => setActiveInput("")}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10 rounded-2xl outline-none focus:ring-4 text-white text-sm font-medium transition-all backdrop-blur-sm placeholder:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 z-20 text-slate-400 hover:text-indigo-400 transition-colors p-1"
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff className="h-4 w-4" />
                    ) : (
                      <FiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs font-bold text-rose-400 pl-1 mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-800/80 pt-6 mt-6">
            <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl text-xs text-slate-400 leading-relaxed">
              💡 Your workspace profile session is authenticated via third-party
              secure identity provisions (<b>{user?.provider}</b>). Local
              password reset mechanisms are handled directly by your provider's
              ecosystem controls.
            </div>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={status.loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/10 border border-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 mt-4"
        >
          {status.loading ? (
            <>
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              Syncing Profile Parameters...
            </>
          ) : (
            "Save Changes"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};
