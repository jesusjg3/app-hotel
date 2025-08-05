import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaUser, FaEnvelope, FaUserTag, FaEdit, FaTrashAlt, FaSearch, FaPlus, FaTh, FaList, FaUserCheck, FaCalendarAlt, FaClock, FaFilter } from "react-icons/fa";
import "./ModernEmpleados.css";

const API_BASE_URLS = [
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];


export default function TablaEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vistaActual, setVistaActual] = useState("cards");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [loading, setLoading] = useState(true);

  // Datos simulados adicionales para empleados
  const generarDatosAdicionales = (empleado) => ({
    ...empleado,
    fecha_contratacion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
    estado: Math.random() > 0.2 ? 'Activo' : 'Inactivo',
    ultimo_acceso: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    telefono: `+57 ${Math.floor(Math.random() * 900000000) + 300000000}`,
    departamento: ['Recepción', 'Limpieza', 'Cocina', 'Mantenimiento', 'Administración'][Math.floor(Math.random() * 5)]
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarRoles(), cargarEmpleados()]);
    setLoading(false);
  };

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
        const empleadosConDatos = data.map(generarDatosAdicionales);
        setEmpleados(empleadosConDatos);
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
    setMostrarFormulario(false);
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
    setMostrarFormulario(true);
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

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter(emp => {
    const coincideBusqueda = emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            emp.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            emp.departamento?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = !filtroRol || String(emp.rol_id) === filtroRol;
    
    return coincideBusqueda && coincideRol;
  });

  // Función para obtener color del estado
  const obtenerColorEstado = (estado) => {
    return estado === 'Activo' ? '#10b981' : '#ef4444';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="empleados-loading">
        <div className="loading-spinner"></div>
        <p>Cargando empleados...</p>
      </div>
    );
  }

  return (
    <div className="empleados-container">
      <div className="empleados-header">
        <div className="header-top">
          <h1>
            <FaUser className="header-icon" />
            Gestión de Empleados
          </h1>
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaPlus /> Nuevo Empleado
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{empleados.length}</div>
              <div className="stat-label">Total Empleados</div>
            </div>
            <FaUser className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{empleados.filter(e => e.estado === 'Activo').length}</div>
              <div className="stat-label">Empleados Activos</div>
            </div>
            <FaUserCheck className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{roles.length}</div>
              <div className="stat-label">Roles Disponibles</div>
            </div>
            <FaUserTag className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{new Set(empleados.map(e => e.departamento)).size}</div>
              <div className="stat-label">Departamentos</div>
            </div>
            <FaFilter className="stat-icon" />
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>
                <FaUser />
                {editandoId ? "Editar Empleado" : "Nuevo Empleado"}
              </h2>
              <button className="btn-close" onClick={resetFormulario}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="empleado-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaUser /> Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    placeholder="Ingrese el nombre completo"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaEnvelope /> Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    placeholder="empleado@hotel.com"
                    required
                    disabled={!!editandoId}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    🔒 Contraseña
                    {editandoId && <span className="hint">(dejar vacío para no cambiar)</span>}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    {...(!editandoId ? { required: true } : {})}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUserTag /> Rol
                  </label>
                  <select value={rolId} onChange={e => setRolId(e.target.value)} required>
                    <option value="" disabled>Seleccionar rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editandoId ? "Actualizar" : "Registrar"} Empleado
                </button>
                <button type="button" onClick={resetFormulario} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="empleados-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              value={filtroRol} 
              onChange={(e) => setFiltroRol(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los roles</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-controls">
          <button 
            className={`view-btn ${vistaActual === 'cards' ? 'active' : ''}`}
            onClick={() => setVistaActual('cards')}
          >
            <FaTh /> Tarjetas
          </button>
          <button 
            className={`view-btn ${vistaActual === 'table' ? 'active' : ''}`}
            onClick={() => setVistaActual('table')}
          >
            <FaList /> Tabla
          </button>
        </div>
      </div>

      <div className="empleados-content">
        {empleadosFiltrados.length === 0 ? (
          <div className="empty-state">
            <FaUser className="empty-icon" />
            <h3>No se encontraron empleados</h3>
            <p>No hay empleados que coincidan con los filtros actuales</p>
          </div>
        ) : vistaActual === 'cards' ? (
          <div className="empleados-grid">
            {empleadosFiltrados.map((emp) => (
              <div key={emp.id} className="empleado-card">
                <div className="card-header">
                  <div className="empleado-avatar">
                    <FaUser />
                  </div>
                  <div className="empleado-info">
                    <h3>{emp.nombre}</h3>
                    <span className="empleado-rol">{obtenerNombreRol(emp.rol_id)}</span>
                  </div>
                  <div className="empleado-estado" style={{ 
                    backgroundColor: obtenerColorEstado(emp.estado),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {emp.estado}
                  </div>
                </div>

                <div className="card-body">
                  <div className="empleado-detail">
                    <FaEnvelope className="detail-icon" />
                    <span>{emp.correo}</span>
                  </div>
                  
                  <div className="empleado-detail">
                    <FaCalendarAlt className="detail-icon" />
                    <span>Contratado: {formatearFecha(emp.fecha_contratacion)}</span>
                  </div>
                  
                  <div className="empleado-detail">
                    <FaClock className="detail-icon" />
                    <span>Último acceso: {formatearFecha(emp.ultimo_acceso)}</span>
                  </div>

                  {emp.telefono && (
                    <div className="empleado-detail">
                      📱 <span>{emp.telefono}</span>
                    </div>
                  )}

                  {emp.departamento && (
                    <div className="empleado-detail">
                      🏢 <span>{emp.departamento}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEditar(emp)}
                    title="Editar empleado"
                  >
                    <FaEdit /> Editar
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleEliminar(emp.id)}
                    title="Eliminar empleado"
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empleados-table-container">
            <table className="empleados-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Fecha Contratación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosFiltrados.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="empleado-cell">
                        <div className="empleado-avatar-small">
                          <FaUser />
                        </div>
                        <div>
                          <div className="empleado-nombre">{emp.nombre}</div>
                          <div className="empleado-telefono">{emp.telefono}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.correo}</td>
                    <td>
                      <span className="rol-badge">
                        {obtenerNombreRol(emp.rol_id)}
                      </span>
                    </td>
                    <td>{emp.departamento}</td>
                    <td>
                      <span 
                        className="estado-badge"
                        style={{ 
                          backgroundColor: obtenerColorEstado(emp.estado),
                          color: 'white' 
                        }}
                      >
                        {emp.estado}
                      </span>
                    </td>
                    <td>{formatearFecha(emp.fecha_contratacion)}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-edit-small" 
                          onClick={() => handleEditar(emp)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-delete-small" 
                          onClick={() => handleEliminar(emp.id)}
                          title="Eliminar"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
