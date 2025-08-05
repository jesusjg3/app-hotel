import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import './Navbar.css';
import { useAuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const rol = user?.rol;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Título del panel según el rol
  const getTituloPorRol = () => {
    if (rol === "Administrador") return "Administración";
    if (rol === "Usuario") return "Usuario";
    if (rol === "Propietario") return "Propietario";
    return "Sistema"; // Por defecto
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-title">{getTituloPorRol()}</span>
      </div>
      <div className="navbar-user">
        <FaUserCircle size={40} />
        <button className="navbar-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
