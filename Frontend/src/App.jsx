import { AuthProvider, useAuth } from "./context/AuthContext";
import { BlueprintProvider } from "./context/BlueprintContext.jsx";
import { Routing } from "./routes/Routing";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

import { FiZap } from "react-icons/fi";

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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a13] text-white font-sans"
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
                  className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full"
                />

                <motion.div
                  animate={{
                    scale: [0.95, 1.1, 0.95],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="absolute flex items-center justify-center text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                >
                  <FiZap className="h-6 w-6 fill-indigo-400" />
                </motion.div>
              </div>

              <div className="space-y-1.5 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-400"
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
                  className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest opacity-80"
                >
                  Initializing Engine Workspace...
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && <Routing />}
    </>
  );
};

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BlueprintProvider>
          <AppContent />
        </BlueprintProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
