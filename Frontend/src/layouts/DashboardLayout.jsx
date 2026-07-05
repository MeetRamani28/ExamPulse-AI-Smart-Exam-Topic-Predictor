import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiLayers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-xl transition-all border ${
      isActive
        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
        : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200 cursor-pointer"
    }`;

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 font-sans flex flex-col lg:flex-row overflow-x-hidden">
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d1326]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20">
            <img
              src="/LOGO.png"
              alt="ExamPulse Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-black text-white">ExamPulse AI</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white"
        >
          {isSidebarOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-0 z-30 lg:w-72 bg-[#0d1326]/95 lg:bg-[#0d1326]/60 border-r border-slate-800/50 p-6 flex flex-col justify-between backdrop-blur-md transition-transform duration-300 ease-in-out`}
      >
        <div className="space-y-8 mt-16 lg:mt-0">
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20">
              <img
                src="/LOGO.png"
                alt="ExamPulse Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-black text-lg text-white">ExamPulse AI</span>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-900/40 border border-slate-800/40 p-4 rounded-2xl">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <img
                src={user?.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="truncate">
              <h4 className="text-sm font-bold text-slate-200 truncate">
                {user?.name}
              </h4>
              <p className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">
                {user?.provider} Account
              </p>
            </div>
          </div>

          <nav className="space-y-1" onClick={() => setIsSidebarOpen(false)}>
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 font-bold text-sm rounded-xl transition-all mt-8 lg:mt-0"
        >
          <FiLogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
