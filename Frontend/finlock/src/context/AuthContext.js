import { createContext, useEffect, useState, useContext } from "react";
import axios from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get("/api/v1/users/me", {
          withCredentials: true,
        });
        setUser(res.data.data);
      } catch (err) {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
