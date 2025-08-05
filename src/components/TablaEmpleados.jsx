import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API_USUARIOS = "http://localhost:8000/api/usuarios";
const API_ROLES = "http://localhost:8000/api/roles";

export default function TablaEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarRoles();
    cargarEmpleados();
  }, []);

  async function cargarRoles() {
    try {
      const res = await fetch(API_ROLES, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (!rolId && data.length > 0) setRolId(String(data[0].id));
      } else {
        Swal.fire("Error", "Error al cargar roles", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Error de red cargando roles", "error");
    }
  }

  async function cargarEmpleados() {
    try {
      const res = await fetch(API_USUARIOS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Empleados recibidos:", data);
        setEmpleados(data);
      } else {
        Swal.fire("Error", "Error al cargar empleados", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Error de red cargando empleados", "error");
    }
  }

  const resetFormulario = () => {
    setNombre("");
    setCorreo("");
    setPassword("");
    if (roles.length > 0) setRolId(String(roles[0].id));
    else setRolId("");
    setEditandoId(null);
  };

  const validarFormulario = () => {
    if (nombre.trim().length < 3) {
      Swal.fire("Atención", "El nombre debe tener al menos 3 caracteres.", "warning");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      Swal.fire("Atención", "Ingrese un correo electrónico válido.", "warning");
      return false;
    }

    if (!editandoId) {
      const emailExistente = empleados.some(
        (emp) => emp.correo.toLowerCase() === correo.trim().toLowerCase()
      );
      if (emailExistente) {
        Swal.fire("Atención", "El correo ya está registrado.", "warning");
        return false;
      }
    }

    if (!editandoId && password.trim().length < 6) {
      Swal.fire("Atención", "La contraseña debe tener al menos 6 caracteres.", "warning");
      return false;
    }

    if (!rolId) {
      Swal.fire("Atención", "Debe seleccionar un rol.", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const url = editandoId ? `${API_USUARIOS}/${editandoId}` : API_USUARIOS;
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          ...(password ? { password } : {}),
          rol_id: rolId,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: editandoId ? "Empleado actualizado" : "Empleado registrado",
          timer: 1800,
          showConfirmButton: false,
        });

        
        resetFormulario();
        cargarEmpleados();
      } else {
        const data = await res.json().catch(() => ({}));
        Swal.fire("Error", data.message || "Error guardando empleado", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Error de red al guardar empleado", "error");
    }
  };

  const handleEditar = (emp) => {
    setNombre(emp.nombre);
    setCorreo(emp.correo);
    setRolId(String(emp.rol_id));
    setEditandoId(emp.id);
    setPassword("");
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Seguro que quieres eliminar este empleado?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_USUARIOS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        Swal.fire("Eliminado", "Empleado eliminado.", "success");
        cargarEmpleados();
      } else {
        Swal.fire("Error", "Error eliminando empleado.", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red al eliminar empleado.", "error");
    }
  };

  // Función para obtener nombre de rol por id
  const obtenerNombreRol = (id) => {
    const rol = roles.find((r) => String(r.id) === String(id));
    return rol ? rol.nombre : id;
  };

  return (
    <div
      className="hotel-panel"
      style={{ maxWidth: 700, margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif" }}
    >
      <h2>{editandoId ? "Editar Empleado" : "Registrar Empleado"}</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2rem" }}
      >
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />

        <label>Correo:</label>
        <input
          type="email"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
          disabled={!!editandoId}
        />

        <label>
          Contraseña: {editandoId && <small>(dejar vacío para no cambiar)</small>}
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          {...(!editandoId ? { required: true } : {})}
        />

        <label>Rol:</label>
        <select value={rolId} onChange={e => setRolId(e.target.value)} required>
          <option value="" disabled>
            -- Selecciona un rol --
          </option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 10 }}>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {editandoId ? "Actualizar" : "Registrar"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={resetFormulario}
              style={{ marginLeft: 10, padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2>Empleados registrados</h2>
      {empleados.length === 0 ? (
        <p>No hay empleados registrados</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Nombre</th>
              <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Correo</th>
              <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Rol</th>
              <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 8 }}>{emp.nombre}</td>
                <td style={{ padding: 8 }}>{emp.correo}</td>
                <td style={{ padding: 8 }}>{obtenerNombreRol(emp.rol_id)}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => handleEditar(emp)}
                    style={{ marginRight: 8, cursor: "pointer", padding: "4px 8px" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(emp.id)}
                    style={{ color: "red", cursor: "pointer", padding: "4px 8px" }}
                  >
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
