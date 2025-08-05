import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) setUser(JSON.parse(savedUser));
  }, [token]);

  // Imprimir usuario_id en consola cuando cambie user
  useEffect(() => {
    if (user) {
      console.log("Usuario actual:", user);
      console.log("usuario_id guardado:", user.id);
    }
  }, [user]);

  const login = (token, usuario) => {
    setToken(token);
    setUser(usuario);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));
    localStorage.setItem("usuario_id", usuario.id);  // Guardar usuario_id separado
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("usuario_id");  // Limpiar usuario_id al cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
