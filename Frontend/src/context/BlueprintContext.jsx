import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import API from "../api/axiosInstance";

const BlueprintContext = createContext(null);

export const BlueprintProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentBlueprint, setCurrentBlueprint] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      const userId = user._id || user.id;
      if (!userId) return;

      const socketUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "") || "http://localhost:3000";

      const socketInstance = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket"],
      });

      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        console.log("🔌 Real-time workspace synchronization pipe linked.");
        socketInstance.emit("join-workspace", userId);
      });

      socketInstance.on("blueprint-status", (payload) => {
        setPipelineStatus(payload.message);
      });

      socketInstance.on("blueprint-complete", (payload) => {
        setIsProcessing(false);
        setPipelineStatus("");
        setCurrentBlueprint(payload.data);
        setHistory((prev) => [payload.data, ...prev]);
      });

      socketInstance.on("blueprint-error", (payload) => {
        setIsProcessing(false);
        setPipelineStatus("");
        alert(`❌ Pipeline Error: ${payload.message}`);
      });

      return () => {
        socketInstance.disconnect();
      };
    } catch (err) {
      console.error("Failed to bootstrap realtime socket layer", err);
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await API.get("/blueprints/history");
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load historical analysis data:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const processDocumentBlueprint = async (fileObject) => {
    if (!fileObject) return;
    try {
      setIsProcessing(true);
      setCurrentBlueprint(null);
      setPipelineStatus("Uploading study document...");

      const formData = new FormData();
      formData.append("document", fileObject);

      await API.post("/blueprints/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      setIsProcessing(false);
      setPipelineStatus("");
      alert(err.response?.data?.message || "Document engine execution failure.");
    }
  };

  return (
    <BlueprintContext.Provider
      value={{
        history,
        loadingHistory,
        currentBlueprint,
        pipelineStatus,
        isProcessing,
        setCurrentBlueprint,
        fetchHistory,
        processDocumentBlueprint,
      }}
    >
      {children}
    </BlueprintContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBlueprint = () => {
  const context = useContext(BlueprintContext);
  if (!context) {
    throw new Error("useBlueprint must be nested inside a secure BlueprintProvider.");
  }
  return context;
};