import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crimehub_token");
    const userData = localStorage.getItem("crimehub_user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("crimehub_token");
        localStorage.removeItem("crimehub_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authAPI.login({ username, password });
    localStorage.setItem("crimehub_token", data.token);
    localStorage.setItem("crimehub_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await authAPI.register(formData);
    localStorage.setItem("crimehub_token", data.token);
    localStorage.setItem("crimehub_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("crimehub_token");
    localStorage.removeItem("crimehub_user");
    setUser(null);
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    localStorage.setItem("crimehub_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
