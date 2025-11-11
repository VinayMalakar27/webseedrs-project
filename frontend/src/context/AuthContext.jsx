import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/users/me");
        setUser(res.data?.user || res.data);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const newToken = res.data.token;
    const userData = res.data.user;
    localStorage.setItem("token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    const newToken = res.data.token;
    const userData = res.data.user;
    localStorage.setItem("token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  // Accept either JSON object or FormData (for avatar upload)
  const updateProfile = async (payload) => {
    try {
      let res;
      if (payload instanceof FormData) {
        res = await api.put("/users/profile", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put("/users/profile", payload);
      }
      const updated = res.data?.user || res.data;
      setUser(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setUser, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
