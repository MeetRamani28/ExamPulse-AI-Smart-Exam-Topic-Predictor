import { useEffect, useState } from "react";
import { useBlueprint } from "../context/BlueprintContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayers,
  FiCornerDownRight,
  FiCalendar,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { FiZap } from "react-icons/fi";

export const PastAnalysis = () => {
  const { history, loadingHistory, fetchHistory } = useBlueprint();
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loadingHistory) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center font-sans">
        <div className="relative flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [0.95, 1.1, 0.95], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute flex items-center justify-center text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]"
          >
            <FiZap className="h-5 w-5 fill-indigo-400" />
          </motion.div>
        </div>
        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest opacity-80 animate-pulse">
          Fetching Historical Matrices...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {selectedLog ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => setSelectedLog(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FiArrowLeft /> Back to Logs
          </button>

          <div className="bg-gradient-to-br from-indigo-950/20 via-[#0d1326] to-[#070a13] border border-slate-800/60 p-6 rounded-3xl">
            <h3 className="text-xl font-black text-white truncate">
              {selectedLog.fileName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compiled on {new Date(selectedLog.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedLog.important_topics?.map((topic, idx) => (
              <div
                key={idx}
                className="bg-[#0d1326]/40 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h4 className="text-base font-black text-white tracking-tight flex items-start justify-between gap-2">
                    {topic.topic_name}
                    <FiCheckCircle className="text-cyan-400 shrink-0 mt-0.5 h-4 w-4" />
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {topic.why_it_is_important}
                  </p>
                </div>
                {topic.key_formulas_or_terms?.length > 0 && (
                  <div className="border-t border-slate-900/80 pt-4 mt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {topic.key_formulas_or_terms.map((term, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-medium text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/40"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <>
          <div className="border-b border-slate-900 pb-6">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Historical Analysis logs
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review previously evaluated secure blueprint documents.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="text-center p-12 bg-slate-950/10 border border-slate-900 rounded-3xl text-slate-500 text-sm font-medium">
              No historical documents analyzed inside this account yet.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((log, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0d1326]/40 border border-slate-800/60 rounded-2xl hover:border-slate-700/60 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
                      <FiLayers className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm font-bold text-white truncate">
                        {log.fileName}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
                        <FiCalendar className="h-3 w-3" />
                        <span>
                          {new Date(log.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold bg-slate-950 border border-slate-900 text-indigo-300 px-3 py-1 rounded-lg flex items-center gap-1">
                      <FiCornerDownRight className="h-3 w-3" />{" "}
                      {log.important_topics?.length || 0} Topics
                    </span>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      View Blueprint
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};