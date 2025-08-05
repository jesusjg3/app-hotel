import { NavLink } from "react-router-dom";
import {
  FaHotel,
  FaBed,
  FaUsers,
  FaUserTie,
  FaChair,
  FaUserShield,
  FaLaptop
} from "react-icons/fa";
import "./Sidebar.css";
import { useAuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuthContext();

  if (!user) return null;

  const rol = user.rol;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">

        {/* Inicio para Admin y Propietario */}
        {(rol === "Administrador" || rol === "Propietario") && (
          <NavLink to="/dashboard/index" className="sidebar-btn">
            <FaLaptop /> <span>Inicio</span>
          </NavLink>
        )}

        {/* Habitaciones para Admin y Usuario */}
        {(rol === "Administrador" || rol === "Usuario") && (
          <NavLink to="/dashboard/habitaciones" className="sidebar-btn">
            <FaBed /> <span>Habitaciones</span>
          </NavLink>
        )}

        {/* Salones para Admin y Usuario */}
        {(rol === "Administrador" || rol === "Usuario") && (
          <NavLink to="/dashboard/salones" className="sidebar-btn">
            <FaChair /> <span>Salones</span>
          </NavLink>
        )}

        {/* Roles solo Admin */}
        {rol === "Administrador" && (
          <NavLink to="/dashboard/roles" className="sidebar-btn">
            <FaUserShield /> <span>Roles</span>
          </NavLink>
        )}

        {/* Empleados para Admin y Propietario */}
        {(rol === "Administrador" || rol === "Propietario") && (
          <NavLink to="/dashboard/empleados" className="sidebar-btn">
            <FaUserTie /> <span>Empleados</span>
          </NavLink>
        )}

        {/* Reservas para Admin y Usuario */}
        {(rol === "Administrador" || rol === "Usuario") && (
          <NavLink to="/dashboard/reservas" className="sidebar-btn">
            <FaUsers /> <span>Reservas</span>
          </NavLink>
        )}

        {/* Usuarios solo Admin */}
        {rol === "Administrador" && (
          <NavLink to="/dashboard/usuarios" className="sidebar-btn">
            <FaUsers /> <span>Usuarios</span>
          </NavLink>
        )}

        {/* Mesas para Admin y Usuario */}
        {(rol === "Administrador" || rol === "Usuario") && (
          <NavLink to="/dashboard/mesas" className="sidebar-btn">
            <FaHotel /> <span>Mesas</span>
          </NavLink>
        )}

      </nav>
    </aside>
  );
}
