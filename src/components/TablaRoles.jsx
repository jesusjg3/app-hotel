import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import {
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaEye,
  FaUsers,
  FaCrown,
  FaTools,
  FaCheckCircle,
  FaTimes,
  FaSave,
  FaLock,
  FaUnlock,
  FaExclamationTriangle,
  FaUserSecret,
  FaUserTie,
  FaUserCog,
  FaKey,
  FaIdBadge
} from "react-icons/fa";
import "./ModernRoles.css";

const API_BASE_URL = "http://localhost:8000/api";

export default function TablaRoles() {
  const { user } = useAuthContext();

  // Access control check
  if (!user || (user.rol !== "Administrador" && user.rol !== "Propietario")) {
    return (
      <div className="access-denied">
        <FaLock className="denied-icon" />
        <h3>Acceso Denegado</h3>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");

  // Form fields
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [estado, setEstado] = useState("activo");
  const [nivel, setNivel] = useState(1);

  const [roles, setRoles] = useState([]);
  const [rolEditando, setRolEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuariosCount, setUsuariosCount] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    usuariosAsignados: 0
  });

  // Permisos disponibles
  const permisosDisponibles = [
    { id: 'usuarios_read', label: 'Ver Usuarios', categoria: 'Usuarios' },
    { id: 'usuarios_write', label: 'Crear/Editar Usuarios', categoria: 'Usuarios' },
    { id: 'usuarios_delete', label: 'Eliminar Usuarios', categoria: 'Usuarios' },
    { id: 'habitaciones_read', label: 'Ver Habitaciones', categoria: 'Habitaciones' },
    { id: 'habitaciones_write', label: 'Crear/Editar Habitaciones', categoria: 'Habitaciones' },
    { id: 'habitaciones_delete', label: 'Eliminar Habitaciones', categoria: 'Habitaciones' },
    { id: 'reservas_read', label: 'Ver Reservas', categoria: 'Reservas' },
    { id: 'reservas_write', label: 'Crear/Editar Reservas', categoria: 'Reservas' },
    { id: 'reservas_delete', label: 'Eliminar Reservas', categoria: 'Reservas' },
    { id: 'facturas_read', label: 'Ver Facturas', categoria: 'Facturas' },
    { id: 'facturas_write', label: 'Crear Facturas', categoria: 'Facturas' },
    { id: 'reportes_read', label: 'Ver Reportes', categoria: 'Reportes' },
    { id: 'configuracion_write', label: 'Configuración del Sistema', categoria: 'Sistema' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [roles, usuariosCount]);

  const getToken = () => localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRoles(),
        fetchUsuariosCount()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
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
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const fetchUsuariosCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const usuarios = await response.json();
        const counts = {};
        usuarios.forEach(usuario => {
          const rolNombre = usuario.rol;
          counts[rolNombre] = (counts[rolNombre] || 0) + 1;
        });
        setUsuariosCount(counts);
      }
    } catch (error) {
      console.warn("No se pudo cargar el conteo de usuarios:", error);
    }
  };

  const calculateStats = () => {
    const total = roles.length;
    const activos = roles.filter(r => r.estado !== "inactivo").length;
    const inactivos = total - activos;
    const usuariosAsignados = Object.values(usuariosCount).reduce((sum, count) => sum + count, 0);
    
    setStats({ total, activos, inactivos, usuariosAsignados });
  };

  const resetFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPermisos([]);
    setEstado("activo");
    setNivel(1);
    setRolEditando(null);
    setShowForm(false);
  };

  const handlePermisoChange = (permisoId) => {
    setPermisos(prev => 
      prev.includes(permisoId) 
        ? prev.filter(p => p !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      return Swal.fire("Atención", "El nombre del rol no puede estar vacío.", "warning");
    }

    // Check for duplicate names (excluding current editing role)
    const nombreExiste = roles.some((rol) => 
      rol.nombre.toLowerCase() === nombre.trim().toLowerCase() && 
      (!rolEditando || rol.id !== rolEditando.id)
    );
    
    if (nombreExiste) {
      return Swal.fire("Atención", "Ya existe un rol con ese nombre.", "warning");
    }

    const rolData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      permisos: permisos.join(','),
      estado: estado,
      nivel: nivel
    };

    try {
      let response;
      if (rolEditando) {
        response = await fetch(`${API_BASE_URL}/roles/${rolEditando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
          },
          body: JSON.stringify(rolData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
          },
          body: JSON.stringify(rolData),
        });
      }

      if (response.ok) {
        const data = await response.json();
        Swal.fire("¡Éxito!", rolEditando ? "Rol actualizado" : "Rol creado", "success");
        
        if (rolEditando) {
          setRoles(roles.map(r => r.id === data.id ? data : r));
        } else {
          setRoles([...roles, data]);
        }
        resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire("Error", data.message || "Error al procesar el rol", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const handleEditar = (rol) => {
    setNombre(rol.nombre);
    setDescripcion(rol.descripcion || "");
    setPermisos(rol.permisos ? rol.permisos.split(',').filter(p => p) : []);
    setEstado(rol.estado || "activo");
    setNivel(rol.nivel || 1);
    setRolEditando(rol);
    setShowForm(true);
  };

  const handleEliminar = async (id, nombreRol) => {
    const usuariosConRol = usuariosCount[nombreRol] || 0;
    
    if (usuariosConRol > 0) {
      Swal.fire({
        title: "No se puede eliminar",
        text: `Este rol tiene ${usuariosConRol} usuario(s) asignado(s). Primero debe reasignar estos usuarios a otro rol.`,
        icon: "warning",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
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
        Swal.fire("¡Eliminado!", "Rol eliminado", "success");
        setRoles(roles.filter((rol) => rol.id !== id));
        if (rolEditando && rolEditando.id === id) resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire("Error", data.message || "Error al eliminar el rol", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        const rolActualizado = await response.json();
        setRoles(roles.map(r => r.id === id ? rolActualizado : r));
        Swal.fire("¡Éxito!", `Rol ${nuevoEstado}`, "success");
      }
    } catch (error) {
      Swal.fire("Error", "Error al cambiar estado", "error");
    }
  };

  // Filter and sort logic
  const filteredRoles = roles
    .filter(rol => {
      const matchesSearch = rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rol.descripcion && rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "nivel") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRolIcon = (nombre) => {
    switch (nombre?.toLowerCase()) {
      case "administrador": return <FaCrown />;
      case "propietario": return <FaUserSecret />;
      case "usuario": return <FaUserTie />;
      case "recepcionista": return <FaIdBadge />;
      case "gerente": return <FaUserCog />;
      default: return <FaUserShield />;
    }
  };

  const getRolColor = (nombre) => {
    switch (nombre?.toLowerCase()) {
      case "administrador": return "#e74c3c";
      case "propietario": return "#9b59b6";
      case "usuario": return "#3498db";
      case "recepcionista": return "#27ae60";
      case "gerente": return "#f39c12";
      default: return "#95a5a6";
    }
  };

  const getEstadoIcon = (estado) => {
    return estado === "activo" ? 
      <FaCheckCircle className="status-icon active" /> : 
      <FaTimes className="status-icon inactive" />;
  };

  const getEstadoColor = (estado) => {
    return estado === "activo" ? "#27ae60" : "#e74c3c";
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="stat-card-roles" style={{ borderColor: color }}>
      <div className="stat-icon-roles" style={{ color }}>
        <Icon />
      </div>
      <div className="stat-content-roles">
        <div className="stat-value-roles">{value}</div>
        <div className="stat-title-roles">{title}</div>
        {subtitle && <div className="stat-subtitle-roles">{subtitle}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="modern-roles">
      {/* Header */}
      <div className="roles-header">
        <div className="header-content">
          <div className="header-title">
            <FaUserShield className="title-icon" />
            <div>
              <h1>Gestión de Roles</h1>
              <p>Administra los roles y permisos del sistema</p>
            </div>
          </div>
          <button 
            className="btn-primary"
            onClick={() => { resetFormulario(); setShowForm(!showForm); }}
          >
            <FaPlus />
            {showForm ? "Cancelar" : "Nuevo Rol"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-roles">
        <StatCard
          icon={FaUserShield}
          title="Total Roles"
          value={stats.total}
          color="#8e44ad"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Roles Activos"
          value={stats.activos}
          subtitle={`${stats.total ? Math.round((stats.activos / stats.total) * 100) : 0}%`}
          color="#27ae60"
        />
        <StatCard
          icon={FaTimes}
          title="Roles Inactivos"
          value={stats.inactivos}
          subtitle={`${stats.total ? Math.round((stats.inactivos / stats.total) * 100) : 0}%`}
          color="#e74c3c"
        />
        <StatCard
          icon={FaUsers}
          title="Usuarios Asignados"
          value={stats.usuariosAsignados}
          subtitle="Total en el sistema"
          color="#3498db"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content-roles" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {rolEditando ? <FaEdit /> : <FaPlus />}
                {rolEditando ? "Editar Rol" : "Nuevo Rol"}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modern-form-roles">
              <div className="form-section">
                <h4><FaIdBadge /> Información Básica</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Rol *</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Gerente, Recepcionista"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nivel de Autoridad</label>
                    <select
                      value={nivel}
                      onChange={(e) => setNivel(parseInt(e.target.value))}
                    >
                      <option value={1}>Nivel 1 - Básico</option>
                      <option value={2}>Nivel 2 - Intermedio</option>
                      <option value={3}>Nivel 3 - Avanzado</option>
                      <option value={4}>Nivel 4 - Supervisor</option>
                      <option value={5}>Nivel 5 - Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción del rol y sus responsabilidades..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4><FaKey /> Permisos del Sistema</h4>
                <div className="permisos-grid">
                  {permisosDisponibles.reduce((acc, permiso) => {
                    const categoria = permiso.categoria;
                    if (!acc[categoria]) {
                      acc[categoria] = [];
                    }
                    acc[categoria].push(permiso);
                    return acc;
                  }, {}).constructor === Object && Object.entries(
                    permisosDisponibles.reduce((acc, permiso) => {
                      const categoria = permiso.categoria;
                      if (!acc[categoria]) {
                        acc[categoria] = [];
                      }
                      acc[categoria].push(permiso);
                      return acc;
                    }, {})
                  ).map(([categoria, permisosCategoria]) => (
                    <div key={categoria} className="permisos-categoria">
                      <h5>{categoria}</h5>
                      <div className="permisos-list">
                        {permisosCategoria.map((permiso) => (
                          <label key={permiso.id} className="permiso-checkbox">
                            <input
                              type="checkbox"
                              checked={permisos.includes(permiso.id)}
                              onChange={() => handlePermisoChange(permiso.id)}
                            />
                            <span className="checkmark">
                              <FaCheckCircle />
                            </span>
                            <span className="permiso-label">{permiso.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaSave />
                  {rolEditando ? "Actualizar" : "Crear"} Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="controls-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <FaSortAmountDown />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="nombre">Ordenar por nombre</option>
              <option value="nivel">Ordenar por nivel</option>
              <option value="estado">Ordenar por estado</option>
            </select>
          </div>

          <button 
            className={`view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <FaUserShield />
          </button>
          <button 
            className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <FaEye />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredRoles.length === 0 ? (
        <div className="empty-state">
          <FaUserShield className="empty-icon" />
          <h3>No hay roles</h3>
          <p>
            {searchTerm 
              ? "No se encontraron roles con los filtros aplicados" 
              : "Comienza creando tu primer rol"}
          </p>
          {!searchTerm && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus />
              Crear Primer Rol
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="roles-grid">
          {filteredRoles.map((rol) => {
            const roleColor = getRolColor(rol.nombre);
            const usuariosAsignados = usuariosCount[rol.nombre] || 0;
            const permisosRol = rol.permisos ? rol.permisos.split(',').filter(p => p) : [];
            
            return (
              <div key={rol.id} className={`rol-card ${rol.estado}`} style={{ borderLeftColor: roleColor }}>
                <div className="card-header">
                  <div className="rol-name">
                    <div className="rol-icon" style={{ color: roleColor }}>
                      {getRolIcon(rol.nombre)}
                    </div>
                    <div>
                      <h4>{rol.nombre}</h4>
                      <span className="nivel-badge" style={{ backgroundColor: roleColor }}>
                        Nivel {rol.nivel || 1}
                      </span>
                    </div>
                  </div>
                  <div className="rol-status" style={{ color: getEstadoColor(rol.estado) }}>
                    {getEstadoIcon(rol.estado)}
                    <span className="status-text">{rol.estado || 'activo'}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  {rol.descripcion && (
                    <p className="rol-description">{rol.descripcion}</p>
                  )}

                  <div className="rol-details">
                    <div className="detail-item">
                      <FaUsers />
                      <span>{usuariosAsignados} usuario{usuariosAsignados !== 1 ? 's' : ''} asignado{usuariosAsignados !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="detail-item">
                      <FaKey />
                      <span>{permisosRol.length} permiso{permisosRol.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {permisosRol.length > 0 && (
                    <div className="permisos-preview">
                      <h5>Permisos principales:</h5>
                      <div className="permisos-tags">
                        {permisosRol.slice(0, 3).map((permisoId) => {
                          const permiso = permisosDisponibles.find(p => p.id === permisoId);
                          return permiso ? (
                            <span key={permisoId} className="permiso-tag">
                              {permiso.label}
                            </span>
                          ) : null;
                        })}
                        {permisosRol.length > 3 && (
                          <span className="permiso-tag more">
                            +{permisosRol.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  {rol.estado === "inactivo" ? (
                    <button 
                      className="btn-activate"
                      onClick={() => handleCambiarEstado(rol.id, "activo")}
                      title="Activar rol"
                    >
                      <FaUnlock />
                    </button>
                  ) : (
                    <button 
                      className="btn-deactivate"
                      onClick={() => handleCambiarEstado(rol.id, "inactivo")}
                      title="Desactivar rol"
                    >
                      <FaLock />
                    </button>
                  )}
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditar(rol)}
                    title="Editar rol"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleEliminar(rol.id, rol.nombre)}
                    title="Eliminar rol"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Usuarios</th>
                <th>Permisos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((rol) => {
                const usuariosAsignados = usuariosCount[rol.nombre] || 0;
                const permisosRol = rol.permisos ? rol.permisos.split(',').filter(p => p) : [];
                
                return (
                  <tr key={rol.id}>
                    <td>
                      <div className="table-rol-name">
                        <div className="rol-icon" style={{ color: getRolColor(rol.nombre) }}>
                          {getRolIcon(rol.nombre)}
                        </div>
                        <div>
                          <strong>{rol.nombre}</strong>
                          {rol.descripcion && <p>{rol.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="nivel-badge-small" style={{ backgroundColor: getRolColor(rol.nombre) }}>
                        Nivel {rol.nivel || 1}
                      </span>
                    </td>
                    <td>
                      <div className="table-status" style={{ color: getEstadoColor(rol.estado) }}>
                        {getEstadoIcon(rol.estado)}
                        <span>{rol.estado || 'activo'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="usuarios-count">
                        <FaUsers />
                        <span>{usuariosAsignados}</span>
                      </div>
                    </td>
                    <td>{permisosRol.length}</td>
                    <td>
                      <div className="table-actions">
                        {rol.estado === "inactivo" ? (
                          <button 
                            className="btn-activate-small"
                            onClick={() => handleCambiarEstado(rol.id, "activo")}
                          >
                            <FaUnlock />
                          </button>
                        ) : (
                          <button 
                            className="btn-deactivate-small"
                            onClick={() => handleCambiarEstado(rol.id, "inactivo")}
                          >
                            <FaLock />
                          </button>
                        )}
                        <button 
                          className="btn-edit-small"
                          onClick={() => handleEditar(rol)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-delete-small"
                          onClick={() => handleEliminar(rol.id, rol.nombre)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
