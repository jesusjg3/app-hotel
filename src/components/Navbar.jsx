import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login", { replace: true });
};


  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-title">Administración</span>
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
