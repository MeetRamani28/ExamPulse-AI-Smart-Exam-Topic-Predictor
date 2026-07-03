import { motion } from "framer-motion";
import { FiLayers, FiCornerDownRight, FiCalendar } from "react-icons/fi";

export const PastAnalysis = () => {
  const logs = [
    { title: "Chemistry-101-Midterm.pdf", date: "July 02, 2026", topics: 8 },
    {
      title: "Advanced-Data-Structures-Notes.txt",
      date: "June 28, 2026",
      topics: 12,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Historical Analysis logs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review previously evaluated secure blueprint documents.
        </p>
      </div>

      <div className="space-y-3">
        {logs.map((log, index) => (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0d1326]/40 border border-slate-800/60 rounded-2xl hover:border-slate-700/60 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner">
                <FiLayers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{log.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
                  <FiCalendar className="h-3 w-3" /> <span>{log.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold bg-slate-950 border border-slate-900 text-indigo-300 px-3 py-1 rounded-lg flex items-center gap-1">
                <FiCornerDownRight className="h-3 w-3" /> {log.topics} Topics
              </span>
              <button className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                View Blueprint
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
