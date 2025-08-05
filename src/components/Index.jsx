import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import "./Sidebar.css";

export default function Index() {
  const { user } = useAuthContext();
  const [reservas, setReservas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );

  const rol = user?.rol; // ← Aquí usamos el rol por nombre

  useEffect(() => {
    if (rol !== "Propietario") return;

    const obtenerReservas = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/reservas");
        const data = await response.json();

        const confirmadas = data.filter(
          (reserva) =>
            reserva.estado === "confirmado" &&
            reserva.fecha === fechaSeleccionada
        );
        setReservas(confirmadas);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      }
    };

    obtenerReservas();
  }, [fechaSeleccionada, rol]);

  const contarPorTipo = (tipo) =>
    reservas.filter((r) => r.tipo === tipo).length;

  const renderResumen = () => (
    <div className="resumen-dashboard">
      <div className="card-resumen">
        <h2>{contarPorTipo("mesa")}</h2>
        <p>Mesas Reservadas</p>
      </div>
      <div className="card-resumen">
        <h2>{contarPorTipo("habitacion")}</h2>
        <p>Habitaciones Reservadas</p>
      </div>
      <div className="card-resumen">
        <h2>{contarPorTipo("salon")}</h2>
        <p>Salones Reservados</p>
      </div>
    </div>
  );

  const renderTabla = (tipo, titulo) => {
    const filtradas = reservas.filter((r) => r.tipo === tipo);

    return (
      <div className="seccion-tabla">
        <h3>{titulo}</h3>
        {filtradas.length === 0 ? (
          <p className="sin-reservas">No hay {tipo}s reservados</p>
        ) : (
          <table className="reserva-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.cliente}</td>
                  <td>{reserva.fecha}</td>
                  <td>{reserva.hora}</td>
                  <td>{reserva.detalle || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // 🧩 DASHBOARD PROPIETARIO
  if (rol === "Propietario") {
    return (
      <div className="hotel-panel">
        <div className="panel-encabezado">
          <h1>Dashboard del Propietario</h1>
          <div className="selector-fecha">
            <label htmlFor="fecha">Selecciona una fecha:</label>
            <input
              id="fecha"
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </div>

        {renderResumen()}

        <div className="panel-reservas">
          {renderTabla("mesa", "Mesas Reservadas")}
          {renderTabla("habitacion", "Habitaciones Reservadas")}
          {renderTabla("salon", "Salones Reservados")}
        </div>
      </div>
    );
  }

  // 🧩 DASHBOARD USUARIO (Empleado)
  if (rol === "Usuario") {
    return (
      <div className="empleado-panel">
        <h1>Panel del Empleado</h1>
        <p>Bienvenido, {user.nombre}. Aquí verás tus tareas asignadas.</p>
        {/* Puedes agregar tabla de tareas, turnos, etc. */}
      </div>
    );
  }

  // 🧩 DASHBOARD ADMINISTRADOR (opcional)
  if (rol === "Administrador") {
    return (
      <div className="admin-panel">
        <h1>Panel del Administrador</h1>
        <p>Desde aquí puedes gestionar todo el sistema.</p>
        {/* Puedes incluir estadísticas generales, acceso rápido a gestión */}
      </div>
    );
  }

  // ❌ USUARIO NO AUTORIZADO
  return (
    <div className="no-autorizado">
      <h2>No tienes permiso para acceder a este panel.</h2>
    </div>
  );
}
