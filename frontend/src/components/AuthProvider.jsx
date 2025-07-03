import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem("user"); // Clear invalid data
      return null;
    }
  });

  const login = ({ user, token }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };
  
  const logout = () => { 
    localStorage.clear(); 
    setUser(null); 
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const testAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return false;
      }

      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Auth test successful:", response.data);
      return true;
    } catch (error) {
      console.error("Auth test failed:", error.response?.data || error.message);
      return false;
    }
  };

  return <AuthCtx.Provider value={{ user, login, logout, testAuth, refreshUser }}>{children}</AuthCtx.Provider>;
}
