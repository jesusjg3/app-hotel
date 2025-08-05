import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./TablaHabitaciones.css";

const API_BASE_URL = "http://localhost:8000";

export default function TablaHabitaciones() {
  const [showForm, setShowForm] = useState(false);
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [precioNoche, setPrecioNoche] = useState("");
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionEditando, setHabitacionEditando] = useState(null);

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const fetchHabitaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/habitaciones`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setHabitaciones(data);
      } else {
        Swal.fire("Error", "Error al cargar habitaciones (¿token inválido?)", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const resetFormulario = () => {
    setNumero("");
    setTipo("");
    setEstado("disponible");
    setPrecioNoche("");
    setHabitacionEditando(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const numeroDuplicado = habitaciones.some(
      (h) => h.numero === numero && (!habitacionEditando || h.id !== habitacionEditando.id)
    );
    if (numeroDuplicado) {
      return Swal.fire({
        icon: "error",
        title: "Número duplicado",
        text: "Ya existe una habitación con ese número.",
      });
    }

    try {
      if (habitacionEditando) {
        const response = await fetch(`${API_BASE_URL}/api/habitaciones/${habitacionEditando.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ numero, tipo, estado, precio_noche: precioNoche }),
        });
        if (response.ok) {
          const data = await response.json();
          setHabitaciones((prev) => prev.map((h) => (h.id === data.id ? data : h)));
          Swal.fire({ icon: "success", title: "¡Éxito!", text: "Habitación actualizada con éxito", timer: 2000, showConfirmButton: false });
          resetFormulario();
        } else {
          const data = await response.json();
          Swal.fire({ icon: "error", title: "Error", text: data.message || "Error al actualizar la habitación" });
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/habitaciones`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ numero, tipo, estado, precio_noche: precioNoche }),
        });
        if (response.ok) {
          const nuevaHabitacion = await response.json();
          setHabitaciones([...habitaciones, nuevaHabitacion]);
          Swal.fire({ icon: "success", title: "¡Éxito!", text: "Habitación creada con éxito", timer: 2000, showConfirmButton: false });
          resetFormulario();
        } else {
          const data = await response.json();
          Swal.fire({ icon: "error", title: "Error", text: data.message || "Error al crear la habitación" });
        }
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Error de red o servidor" });
    }
  };

  const handleEditar = (habitacion) => {
    setNumero(habitacion.numero);
    setTipo(habitacion.tipo);
    setEstado(habitacion.estado);
    setPrecioNoche(habitacion.precio_noche);
    setHabitacionEditando(habitacion);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta habitación?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/habitaciones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (response.ok) {
        setHabitaciones((prev) => prev.filter((h) => h.id !== id));
        Swal.fire({ icon: "success", title: "¡Eliminado!", text: "Habitación eliminada con éxito", timer: 2000, showConfirmButton: false });
        if (habitacionEditando && habitacionEditando.id === id) resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire({ icon: "error", title: "Error", text: data.message || "Error al eliminar la habitación" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Error de red o servidor" });
    }
  };

  return (
    <div className="hotel-panel">
      <h2>Habitaciones</h2>

      <button className="toggle-form-button" onClick={() => { resetFormulario(); setShowForm(!showForm); }}>
        {showForm ? "Cancelar" : habitacionEditando ? "Editar Habitación" : "Crear Habitación"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="create-habitacion-form">
          <div>
            <label>Número:</label>
            <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required />
          </div>
          <div>
            <label>Tipo:</label>
            <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} required />
          </div>
          <div className="estado-container">
            <label>Estado:</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div>
            <label>Precio por noche:</label>
            <input type="number" value={precioNoche} onChange={(e) => setPrecioNoche(e.target.value)} required min="0" step="0.01" />
          </div>
          <button type="submit">{habitacionEditando ? "Actualizar" : "Guardar"}</button>
        </form>
      )}

      <h3>Habitaciones creadas:</h3>

      {habitaciones.length === 0 ? (
        <p>No hay habitaciones creadas aún.</p>
      ) : (
        <table className="habitaciones-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Precio por noche</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((habitacion) => (
              <tr key={habitacion.id}>
                <td>{habitacion.numero}</td>
                <td>{habitacion.tipo}</td>
                <td>{habitacion.estado}</td>
                <td>${habitacion.precio_noche}</td>
                <td>
                  <button className="btn-editar" onClick={() => handleEditar(habitacion)}>
                    Editar
                  </button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(habitacion.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
