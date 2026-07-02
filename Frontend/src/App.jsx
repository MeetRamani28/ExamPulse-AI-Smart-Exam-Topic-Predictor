import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const fetchData = async () => {
      try {
        const response = await axios.get(baseUrl);
        setMessage(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Backend connection failed! ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">ExamPulse AI</h1>

        <div
          className={`p-4 rounded-lg font-medium ${message.includes("failed") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
        >
          {loading ? "Connecting to backend..." : message}
        </div>
      </div>
    </div>
  );
};

export default App;
