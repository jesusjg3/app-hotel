import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext"; // Ajusta ruta según tu estructura
import Swal from "sweetalert2";
import "./TablaRoles.css";

const API_BASE_URL = "http://localhost:8000/api";

export default function TablaRoles() {
  const { user } = useAuthContext();

  if (!user || (user.rol !== "Administrador" && user.rol !== "Propietario")) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        Acceso denegado. No tienes permisos para ver esta página.
      </p>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        Swal.fire("Error", "Error al cargar roles", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
    setLoading(false);
  };

  const resetFormulario = () => {
    setNombre("");
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!nombre.trim()) {
      return Swal.fire("Atención", "El nombre del rol no puede estar vacío.", "warning");
    }
    if (roles.some((rol) => rol.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      return Swal.fire("Atención", "Ya existe un rol con ese nombre.", "warning");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire("Éxito", "Rol creado con éxito!", "success");
        setRoles([...roles, data]);
        resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire("Error", data.message || "Error al crear el rol", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar este rol?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        Swal.fire("Eliminado", "Rol eliminado con éxito!", "success");
        setRoles(roles.filter((rol) => rol.id !== id));
      } else {
        const data = await response.json();
        Swal.fire("Error", data.message || "Error al eliminar el rol", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  return (
    <div className="hotel-panel">
      <div className="panel-arrow">
        <i className="arrow-icon"></i>
      </div>
      <div className="panel-content">
        <h2>Roles</h2>

        <button
          onClick={() => {
            resetFormulario();
            setShowForm(!showForm);
          }}
          className="toggle-form-button"
        >
          {showForm ? "Cancelar" : "Crear Rol"}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="create-habitacion-form">
            <div>
              <label>Nombre del rol:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
                required
              />
            </div>
            <button type="submit">Guardar</button>
          </form>
        )}

        {loading && <p>Cargando roles...</p>}

        <div className="habitaciones-lista">
          <h3>Roles creados:</h3>
          {roles.length === 0 && !loading ? (
            <p>No hay roles creados aún.</p>
          ) : (
            <ul>
              {roles.map((rol) => (
                <li key={rol.id} style={{ marginBottom: 6 }}>
                  {rol.nombre}{" "}
                  <button
                    onClick={() => handleEliminar(rol.id)}
                    style={{
                      marginLeft: 10,
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
    </div>
  );
}
