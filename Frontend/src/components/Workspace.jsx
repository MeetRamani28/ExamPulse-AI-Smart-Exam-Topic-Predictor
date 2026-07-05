import { useState } from "react";
import { useBlueprint } from "../context/BlueprintContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiCpu,
  FiCheckCircle,
  FiActivity,
  FiBookmark,
  FiFileText,
  FiAlertCircle,
  FiX, 
} from "react-icons/fi";

export const Workspace = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const {
    currentBlueprint,
    pipelineStatus,
    isProcessing,
    processDocumentBlueprint,
  } = useBlueprint();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type !== "application/pdf") {
      alert("Invalid format! Only PDF configurations are allowed inside this context. ❌");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      processDocumentBlueprint(selectedFile);
    }
  };

  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100 font-sans">
      {/* Upper Navigation Header Section */}
      <div className="border-b border-slate-800/80 pb-6 mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          ExamPulse AI Core Workspace
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload large study guide PDFs to synchronize neural RAG analysis maps instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ==========================================
            LEFT COLUMN: The Document Ingestion Portal Card
           ========================================== */}
        <div className="bg-[#0d1326]/60 border border-slate-800/60 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FiUploadCloud className="text-indigo-400" /> Document Ingestion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer group transition-all h-48 relative ${
                dragActive
                  ? "border-cyan-400 bg-cyan-950/20"
                  : "border-slate-800 hover:border-indigo-500/50 bg-slate-950/40"
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center text-center px-2 relative group/file">
                  {!isProcessing && (
                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-4 -right-12 p-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg transition-all cursor-pointer z-30"
                      title="Remove file"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                  <FiFileText className="h-10 w-10 text-indigo-400 mb-2 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 max-w-[180px] truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <FiUploadCloud className="h-10 w-10 text-slate-500 group-hover:text-indigo-400 mb-2 transition-all" />
                  <span className="text-xs font-bold text-slate-300">
                    Drag & Drop or Click to browse
                  </span>
                  <span className="text-[10px] text-slate-600 mt-1 font-medium">
                    Supports secure application/pdf frameworks up to 25MB
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>

            <motion.button
              type="submit"
              disabled={!selectedFile || isProcessing}
              whileHover={{ scale: !selectedFile || isProcessing ? 1 : 1.01 }}
              whileTap={{ scale: !selectedFile || isProcessing ? 1 : 0.99 }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800/40 disabled:cursor-not-allowed font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10 border border-indigo-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <FiActivity className="animate-spin text-cyan-400 h-4 w-4" />
                  Processing Matrix...
                </>
              ) : (
                "Generate Exam Blueprint"
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border-t border-slate-800/80 pt-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
                    <FiCpu className="animate-spin h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Pipeline Status
                    </p>
                    <p className="text-xs font-bold text-cyan-300 mt-0.5 truncate animate-pulse">
                      {pipelineStatus || "Initializing Cloud Stream Handshake..."}
                    </p>
                  </div>
                </div>

                <div className="relative w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full transition-all duration-500"
                    style={{
                      width: pipelineStatus.includes("STEP-1")
                        ? "33%"
                        : pipelineStatus.includes("STEP-2")
                          ? "66%"
                          : pipelineStatus.includes("STEP-3")
                            ? "90%"
                            : "15%",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==========================================
            RIGHT COLUMN: Blueprint Content Rendering View Dashboard
           ========================================== */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!currentBlueprint && !isProcessing && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-16 border border-slate-900 bg-slate-950/20 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center mb-4 shadow-inner">
                  <FiBookmark className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-300">
                  Workspace Context Empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  No evaluation parameters have been compiled inside this
                  operational session layout container frameset yet.
                </p>
              </motion.div>
            )}

            {isProcessing && !currentBlueprint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-[#0d1326]/20 border border-slate-900 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded-md w-2/3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-800/60 rounded-md w-full" />
                      <div className="h-3 bg-slate-800/60 rounded-md w-5/6" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-5 bg-slate-900 rounded-md w-12" />
                      <div className="h-5 bg-slate-900 rounded-md w-16" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {currentBlueprint && (
              <motion.div
                key="blueprint-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Active View Master Details Card Banner */}
                <div className="bg-gradient-to-br from-indigo-950/20 via-[#0d1326] to-[#070a13] border border-indigo-500/10 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full shadow-sm">
                    Active Extraction Workspace
                  </span>
                  <h2 className="text-xl font-black text-white mt-4 tracking-tight truncate">
                    {currentBlueprint.fileName}
                  </h2>
                </div>

                {!currentBlueprint.important_topics ||
                currentBlueprint.important_topics.length === 0 ? (
                  <div className="p-5 bg-amber-500/5 border border-amber-500/10 text-amber-300 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                    <FiAlertCircle className="h-5 w-5 shrink-0" />
                    <p>
                      No high-yield topics map fields returned. Verify
                      underlying document asset densities format arrays.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentBlueprint.important_topics.map((topic, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="bg-[#0d1326]/40 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between shadow-md hover:border-slate-700/60 transition-all backdrop-blur-sm group relative"
                      >
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-white tracking-tight flex items-start justify-between gap-3">
                            <span className="truncate group-hover:text-indigo-300 transition-colors">
                              {topic.topic_name}
                            </span>
                            <FiCheckCircle className="text-cyan-400 shrink-0 mt-0.5 h-4 w-4 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]" />
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {topic.why_it_is_important}
                          </p>
                        </div>

                        {topic.key_formulas_or_terms &&
                          topic.key_formulas_or_terms.length > 0 && (
                            <div className="border-t border-slate-900/80 pt-4 mt-4">
                              <div className="flex flex-wrap gap-1.5">
                                {topic.key_formulas_or_terms.map(
                                  (term, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[9px] font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/40 uppercase tracking-wider shadow-inner"
                                    >
                                      {term}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};