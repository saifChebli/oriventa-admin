import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on first load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.get("/api/auth/logout", { withCredentials: true });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
