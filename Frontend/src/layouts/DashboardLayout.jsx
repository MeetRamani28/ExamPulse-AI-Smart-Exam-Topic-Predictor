import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Outlet } from "react-router-dom";
import { FiGrid, FiLayers, FiSettings, FiLogOut, FiZap } from "react-icons/fi";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-xl transition-all border ${
      isActive
        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
        : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200 cursor-pointer"
    }`;

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 font-sans grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <div className="lg:col-span-3 bg-[#0d1326]/60 border-r border-slate-800/50 p-6 flex flex-col justify-between backdrop-blur-md min-h-[200px] lg:min-h-screen">
        <div className="space-y-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <FiZap className="h-4 w-4 fill-white" />
            </div>
            <span className="font-black tracking-tight text-lg text-white">
              ExamPulse AI
            </span>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-900/40 border border-slate-800/40 p-4 rounded-2xl">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <img
                src={user?.avatar}
                alt="Student profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="truncate space-y-0.5">
              <h4 className="text-sm font-bold text-slate-200 truncate">
                {user?.name}
              </h4>
              <p className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">
                {user?.provider} Account
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink to="/dashboard" end className={navClass}>
              <FiGrid className="h-4 w-4" /> AI Workspace
            </NavLink>
            <NavLink to="/dashboard/past-analysis" className={navClass}>
              <FiLayers className="h-4 w-4" /> Past Analysis
            </NavLink>
            <NavLink to="/dashboard/settings" className={navClass}>
              <FiSettings className="h-4 w-4" /> Settings
            </NavLink>
          </nav>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-sm rounded-xl transition-all cursor-pointer mt-8 lg:mt-0"
        >
          <FiLogOut className="h-4 w-4" /> Sign Out Workspace
        </button>
      </div>

      <main className="lg:col-span-9 p-8 lg:p-12 space-y-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
