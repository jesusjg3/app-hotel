import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import TablaHabitaciones from "../components/TablaHabitaciones";
import TablaSalones from "../components/TablaSalones";
import TablaRoles from "../components/TablaRoles";
import TablaEmpleados from "../components/TablaEmpleados";
import TablaUsuarios from "../components/TablaUsuarios";
import TablaReservas from "../components/TablaReservas";
import Index from "../components/Index";
import "./Dashboard.css";
import CrearFactura from "../components/CrearFactura";
import TablaMesa from "../components/TablaMesa";


export default function Dashboard() {
  return (
    <div className="dashboard-root">
      <Navbar />
      <div className="dashboard-main">
        <Sidebar />
        <main className="dashboard-content">
          <Routes>
            <Route path="/" element={<Navigate to="index" />} />
            <Route path="index" element={<Index />} />
            <Route path="habitaciones" element={<TablaHabitaciones />} />
            <Route path="salones" element={<TablaSalones />} />
            <Route path="roles" element={<TablaRoles />} />
            <Route path="empleados" element={<TablaEmpleados />} />
            <Route path="usuarios" element={<TablaUsuarios />} />
            <Route path="reservas" element={<TablaReservas />} />
            <Route path="crear-factura/:reservaId" element={<CrearFactura />} /> {/* <-- AQUI */}
            <Route path="mesas" element={<TablaMesa />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
