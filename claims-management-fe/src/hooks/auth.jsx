import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    role: "", 
  });

  const [loading, setLoading] = useState(true);

  // Configure Global Axios Authorization Defaults
  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth?.token]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("auth");
      if (data) {
        const parseData = JSON.parse(data);
        setAuth({
          user: parseData.user || null,
          token: parseData.token || "",
          role: parseData.role || parseData.user?.role || "", 
        });
      }
    } catch (error) {
      console.error("Error reading auth state from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Return as an object instead of an array to prevent index mapping errors
  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
