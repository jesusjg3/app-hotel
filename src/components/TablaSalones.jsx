import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./TablaSalones.css";

const API_BASE_URL = "http://localhost:8000/api";

export default function TablaSalones() {
  const [showForm, setShowForm] = useState(false);
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Para crear o editar:
  const [editandoId, setEditandoId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [estado, setEstado] = useState("");
  const [precioAlquiler, setPrecioAlquiler] = useState("");

  // Obtener token almacenado
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchSalones();
  }, []);

  const fetchSalones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/salones`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSalones(data);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar salones",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de red o servidor",
      });
    }
    setLoading(false);
  };

  const resetFormulario = () => {
    setNombre("");
    setCapacidad("");
    setEstado("");
    setPrecioAlquiler("");
    setEditandoId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !capacidad || !estado.trim() || !precioAlquiler) {
      return Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Todos los campos son obligatorios.",
      });
    }

    if (isNaN(capacidad) || capacidad <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Capacidad debe ser un número positivo.",
      });
    }
    if (isNaN(precioAlquiler) || precioAlquiler <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Precio alquiler debe ser un número positivo.",
      });
    }

    const url = editandoId ? `${API_BASE_URL}/salones/${editandoId}` : `${API_BASE_URL}/salones`;
    const method = editandoId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          capacidad: Number(capacidad),
          estado: estado.trim(),
          precio_alquiler: Number(precioAlquiler),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: editandoId ? "Salón actualizado con éxito!" : "Salón creado con éxito!",
          timer: 2000,
          showConfirmButton: false,
        });
        if (editandoId) {
          setSalones(salones.map((s) => (s.id === editandoId ? data : s)));
        } else {
          setSalones([...salones, data]);
        }
        resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error al guardar el salón",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de red o servidor",
      });
    }
  };

  const handleEliminar = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Seguro que quieres eliminar este salón?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/salones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "Salón eliminado con éxito!",
          timer: 1500,
          showConfirmButton: false,
        });
        setSalones(salones.filter((s) => s.id !== id));
        if (editandoId === id) resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error al eliminar el salón",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de red o servidor",
      });
    }
  };

  const handleEditar = (salon) => {
    setNombre(salon.nombre);
    setCapacidad(salon.capacidad.toString());
    setEstado(salon.estado);
    setPrecioAlquiler(salon.precio_alquiler.toString());
    setEditandoId(salon.id);
    setShowForm(true);
  };

  return (
    <div className="hotel-panel">
      <h2>Salones</h2>

      <button
        onClick={() => {
          resetFormulario();
          setShowForm(!showForm);
        }}
        className="toggle-form-button"
      >
        {showForm ? "Cancelar" : editandoId ? "Editar Salón" : "Crear Salón"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="create-salon-form">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoFocus
          />

          <label>Capacidad:</label>
          <input
            type="number"
            min="1"
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
            required
          />

          <label>Estado:</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            required
          >
            <option value="">-- Seleccione un estado --</option>
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>

          <label>Precio alquiler:</label>
          <input
            type="number"
            min="1"
            value={precioAlquiler}
            onChange={(e) => setPrecioAlquiler(e.target.value)}
            required
          />

          <button type="submit">{editandoId ? "Actualizar" : "Guardar"}</button>
        </form>
      )}

      {loading && <p>Cargando salones...</p>}

      <div className="salones-lista">
        <h3>Salones creados:</h3>
        {salones.length === 0 && !loading ? (
          <p>No hay salones creados aún.</p>
        ) : (
          <ul>
            {salones.map((salon) => (
              <li key={salon.id} style={{ marginBottom: 8 }}>
                <b>{salon.nombre}</b> — Capacidad: {salon.capacidad} — Estado: {salon.estado} — Precio: ${salon.precio_alquiler}
                <button
                  onClick={() => handleEditar(salon)}
                  style={{ marginLeft: 12, cursor: "pointer" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(salon.id)}
                  style={{
                    marginLeft: 6,
                    color: "red",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
