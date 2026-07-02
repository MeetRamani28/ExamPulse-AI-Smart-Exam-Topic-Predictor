import { AuthProvider, useAuth } from "./context/AuthContext";
import { Routing } from "./routes/Routing";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🛰️ App Content Wrapper
 * Extracts the loading state from AuthContext and shows the animated engine overlay
 */
const AppContent = () => {
  const { loading } = useAuth();

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.4, ease: "easeInOut" },
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white font-sans"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                  className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                />
                <span className="absolute text-xl font-black text-indigo-400">
                  ⚡
                </span>
              </div>

              <div className="space-y-1 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black tracking-wider text-slate-100"
                >
                  ExamPulse AI
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="text-xs text-indigo-300 font-bold uppercase tracking-widest"
                >
                  Initializing Engine Workspace...
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render core router views if validation processes have terminated */}
      {!loading && <Routing />}
    </>
  );
};

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
