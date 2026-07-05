/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(Cookies.get("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const secureToken = Cookies.get("token");

    if (secureToken) {
      setToken(secureToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse cached user metadata:", error);
          setUser({ name: "ExamPulse Student", avatar: "" });
        }
      } else {
        setUser({ name: "ExamPulse Student", avatar: "" });
      }
    } else {
      logout();
    }
    setLoading(false);
  }, []);

  const login = (userData, sessionToken) => {
    setUser(userData);
    setToken(sessionToken);

    if (sessionToken) {
      Cookies.set("token", sessionToken, {
        expires: 7,
        secure: window.location.protocol === "https:",
        sameSite: "strict",
      });
    }
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);