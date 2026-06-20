import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = sessionStorage.getItem("qc-auth");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (hospitalId) => {
    const data = { hospitalId };
    sessionStorage.setItem("qc-auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    sessionStorage.removeItem("qc-auth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated: !!auth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
