import { useState } from "react";
import API from "../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiFileText,
  FiAlertTriangle,
  FiCpu,
} from "react-icons/fi";

export const Workspace = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: null });
  const [aiResult, setAiResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => validateAndSetFile(e.target.files[0]);

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      if (!["application/pdf", "text/plain"].includes(selectedFile.type)) {
        setStatus({
          loading: false,
          error: "Only PDF and TXT files are accepted. ❌",
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setStatus({ loading: false, error: null });
    }
  };

  const handleProcessDocument = async () => {
    if (!file) return;
    setStatus({ loading: true, error: null });
    setAiResult(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await API.post("/blueprints/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setAiResult(response.data.data);
        setStatus({ loading: false, error: null });
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "AI Extraction handshake failed.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">
          AI Blueprint Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload study materials to extract high-yield concept priority
          blueprints mapping.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-sm font-medium"
          >
            <FiAlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <p>{status.error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!aiResult && !status.loading && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden backdrop-blur-sm bg-slate-900/10 ${isDragging ? "border-indigo-500 bg-indigo-500/5 shadow-2xl" : "border-slate-800 hover:border-slate-700 bg-slate-950/20"}`}
        >
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-indigo-400 shadow-xl mb-4">
            <FiUploadCloud className="h-8 w-8 animate-bounce" />
          </div>
          <h3 className="text-lg font-black text-slate-200">
            Drag & drop your study file
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 mb-6">
            PDF or TXT formats up to 25MB.
          </p>
          <label className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer">
            Select Document
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          {file && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex items-center gap-3 px-5 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-sm w-full"
            >
              <FiFileText className="h-5 w-5 text-indigo-400 shrink-0" />
              <div className="truncate text-left flex-grow">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {file.name}
                </p>
              </div>
              <button
                onClick={handleProcessDocument}
                className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Analyze
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {status.loading && (
        <div className="min-h-[380px] flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800/40 rounded-3xl p-12 text-center">
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full"
            />
            <FiCpu className="h-6 w-6 absolute text-indigo-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-200">
            ExamPulse Neural Analysis Active...
          </h3>
        </div>
      )}

      {aiResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-indigo-950/20 via-[#0d1326] to-[#070a13] border border-slate-800/60 p-6 rounded-3xl">
            <h3 className="text-xl font-black text-white">
              Document Analysis Overview
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {aiResult.documentSummary}
            </p>
            <button
              onClick={() => {
                setAiResult(null);
                setFile(null);
              }}
              className="mt-4 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Analyze New File
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResult.blueprints?.map((blueprint, index) => (
                <div
                  key={index}
                  className="bg-[#0d1326]/40 border border-slate-800/50 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/60 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-base font-black text-white tracking-tight truncate">
                        {blueprint.topic}
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${blueprint.priority === "High" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : blueprint.priority === "Medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-slate-800 border-slate-700 text-slate-400"}`}
                      >
                        {blueprint.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {blueprint.explanation}
                    </p>
                  </div>
                  {blueprint.keyDefinitions?.length > 0 && (
                    <div className="border-t border-slate-900/80 pt-4 mt-4 space-y-1.5">
                      <h5 className="text-[10px] font-black text-indigo-400 uppercase">
                        Key Concept Metrics
                      </h5>
                      <ul className="space-y-1">
                        {blueprint.keyDefinitions.map((def, dIdx) => (
                          <li
                            key={dIdx}
                            className="text-[11px] text-slate-300 bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-900/30 font-medium"
                          >
                            {def}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
