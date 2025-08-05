import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaBed,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaEye,
  FaDollarSign,
  FaTools,
  FaCheckCircle,
  FaTimes,
  FaSave,
  FaHome,
  FaHotel,
  FaUsers
} from "react-icons/fa";
import "./ModernHabitaciones.css";

const API_BASE_URL = "http://localhost:8000";

export default function TablaHabitaciones() {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [sortBy, setSortBy] = useState("numero");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Form fields
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [precioNoche, setPrecioNoche] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionEditando, setHabitacionEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    ocupadas: 0,
    mantenimiento: 0
  });

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [habitaciones]);

  const fetchHabitaciones = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/habitaciones`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setHabitaciones(data);
      } else {
        Swal.fire("Error", "Error al cargar habitaciones", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = habitaciones.length;
    const disponibles = habitaciones.filter(h => h.estado === "disponible").length;
    const ocupadas = habitaciones.filter(h => h.estado === "ocupada").length;
    const mantenimiento = habitaciones.filter(h => h.estado === "mantenimiento").length;
    
    setStats({ total, disponibles, ocupadas, mantenimiento });
  };

  const resetFormulario = () => {
    setNumero("");
    setTipo("");
    setEstado("disponible");
    setPrecioNoche("");
    setDescripcion("");
    setCapacidad("");
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

    const habitacionData = {
      numero,
      tipo,
      estado,
      precio_noche: precioNoche,
      descripcion,
      capacidad: capacidad || null
    };

    try {
      let response;
      if (habitacionEditando) {
        response = await fetch(`${API_BASE_URL}/api/habitaciones/${habitacionEditando.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(habitacionData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/habitaciones`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(habitacionData),
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (habitacionEditando) {
          setHabitaciones((prev) => prev.map((h) => (h.id === data.id ? data : h)));
          Swal.fire({ icon: "success", title: "¡Éxito!", text: "Habitación actualizada", timer: 2000, showConfirmButton: false });
        } else {
          setHabitaciones([...habitaciones, data]);
          Swal.fire({ icon: "success", title: "¡Éxito!", text: "Habitación creada", timer: 2000, showConfirmButton: false });
        }
        resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire({ icon: "error", title: "Error", text: data.message || "Error al procesar la solicitud" });
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
    setDescripcion(habitacion.descripcion || "");
    setCapacidad(habitacion.capacidad || "");
    setHabitacionEditando(habitacion);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/habitaciones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (response.ok) {
        setHabitaciones((prev) => prev.filter((h) => h.id !== id));
        Swal.fire({ icon: "success", title: "¡Eliminado!", text: "Habitación eliminada", timer: 2000, showConfirmButton: false });
        if (habitacionEditando && habitacionEditando.id === id) resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire({ icon: "error", title: "Error", text: data.message || "Error al eliminar" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Error de red o servidor" });
    }
  };

  // Filter and sort logic
  const filteredHabitaciones = habitaciones
    .filter(habitacion => {
      const matchesSearch = habitacion.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          habitacion.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "todos" || habitacion.estado === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "precio_noche") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "disponible": return <FaCheckCircle className="status-icon available" />;
      case "ocupada": return <FaBed className="status-icon occupied" />;
      case "mantenimiento": return <FaTools className="status-icon maintenance" />;
      default: return <FaCheckCircle className="status-icon" />;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "disponible": return "#27ae60";
      case "ocupada": return "#e74c3c";
      case "mantenimiento": return "#f39c12";
      default: return "#95a5a6";
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, percentage }) => (
    <div className="stat-card-rooms" style={{ borderColor: color }}>
      <div className="stat-icon-rooms" style={{ color }}>
        <Icon />
      </div>
      <div className="stat-content-rooms">
        <div className="stat-value-rooms">{value}</div>
        <div className="stat-title-rooms">{title}</div>
        {percentage !== undefined && (
          <div className="stat-percentage" style={{ color }}>
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando habitaciones...</p>
      </div>
    );
  }

  return (
    <div className="modern-habitaciones">
      {/* Header */}
      <div className="habitaciones-header">
        <div className="header-content">
          <div className="header-title">
            <FaHotel className="title-icon" />
            <div>
              <h1>Gestión de Habitaciones</h1>
              <p>Administra las habitaciones del hotel</p>
            </div>
          </div>
          <button 
            className="btn-primary"
            onClick={() => { resetFormulario(); setShowForm(!showForm); }}
          >
            <FaPlus />
            {showForm ? "Cancelar" : "Nueva Habitación"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-rooms">
        <StatCard
          icon={FaHome}
          title="Total"
          value={stats.total}
          color="#667eea"
          percentage={100}
        />
        <StatCard
          icon={FaCheckCircle}
          title="Disponibles"
          value={stats.disponibles}
          color="#27ae60"
          percentage={stats.total ? Math.round((stats.disponibles / stats.total) * 100) : 0}
        />
        <StatCard
          icon={FaBed}
          title="Ocupadas"
          value={stats.ocupadas}
          color="#e74c3c"
          percentage={stats.total ? Math.round((stats.ocupadas / stats.total) * 100) : 0}
        />
        <StatCard
          icon={FaTools}
          title="Mantenimiento"
          value={stats.mantenimiento}
          color="#f39c12"
          percentage={stats.total ? Math.round((stats.mantenimiento / stats.total) * 100) : 0}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {habitacionEditando ? <FaEdit /> : <FaPlus />}
                {habitacionEditando ? "Editar Habitación" : "Nueva Habitación"}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Número de Habitación</label>
                  <input 
                    type="text" 
                    value={numero} 
                    onChange={(e) => setNumero(e.target.value)} 
                    placeholder="Ej: 101, 201A"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select 
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value)} 
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Individual">Individual</option>
                    <option value="Doble">Doble</option>
                    <option value="Suite">Suite</option>
                    <option value="Suite Presidencial">Suite Presidencial</option>
                    <option value="Familiar">Familiar</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select 
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)} 
                    required
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio por Noche</label>
                  <div className="input-with-icon">
                    <FaDollarSign className="input-icon" />
                    <input 
                      type="number" 
                      value={precioNoche} 
                      onChange={(e) => setPrecioNoche(e.target.value)} 
                      placeholder="150.00"
                      required 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacidad (personas)</label>
                  <input 
                    type="number" 
                    value={capacidad} 
                    onChange={(e) => setCapacidad(e.target.value)} 
                    placeholder="2"
                    min="1" 
                    max="10" 
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Descripción</label>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Descripción opcional de la habitación..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaSave />
                  {habitacionEditando ? "Actualizar" : "Guardar"}
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
            placeholder="Buscar por número o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <FaFilter />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          
          <div className="filter-group">
            <FaSortAmountDown />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="numero">Ordenar por número</option>
              <option value="tipo">Ordenar por tipo</option>
              <option value="estado">Ordenar por estado</option>
              <option value="precio_noche">Ordenar por precio</option>
            </select>
          </div>

          <button 
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FaHome />
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
      {filteredHabitaciones.length === 0 ? (
        <div className="empty-state">
          <FaBed className="empty-icon" />
          <h3>No hay habitaciones</h3>
          <p>
            {searchTerm || filterStatus !== "todos" 
              ? "No se encontraron habitaciones con los filtros aplicados" 
              : "Comienza creando tu primera habitación"}
          </p>
          {!searchTerm && filterStatus === "todos" && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus />
              Crear Primera Habitación
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="habitaciones-grid">
          {filteredHabitaciones.map((habitacion) => (
            <div key={habitacion.id} className={`habitacion-card ${habitacion.estado}`}>
              <div className="card-header">
                <div className="room-number">
                  <FaBed />
                  {habitacion.numero}
                </div>
                <div className="room-status" style={{ color: getStatusColor(habitacion.estado) }}>
                  {getStatusIcon(habitacion.estado)}
                  <span className="status-text">{habitacion.estado}</span>
                </div>
              </div>
              
              <div className="card-content">
                <h4 className="room-type">{habitacion.tipo}</h4>
                {habitacion.descripcion && (
                  <p className="room-description">{habitacion.descripcion}</p>
                )}
                <div className="room-details">
                  {habitacion.capacidad && (
                    <span className="detail-item">
                      <FaUsers />
                      {habitacion.capacidad} personas
                    </span>
                  )}
                  <span className="room-price">
                    <FaDollarSign />
                    ${habitacion.precio_noche}/noche
                  </span>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEditar(habitacion)}
                  title="Editar habitación"
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleEliminar(habitacion.id)}
                  title="Eliminar habitación"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Capacidad</th>
                <th>Precio/Noche</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredHabitaciones.map((habitacion) => (
                <tr key={habitacion.id}>
                  <td>
                    <div className="table-room-number">
                      <FaBed />
                      {habitacion.numero}
                    </div>
                  </td>
                  <td>{habitacion.tipo}</td>
                  <td>
                    <div className="table-status" style={{ color: getStatusColor(habitacion.estado) }}>
                      {getStatusIcon(habitacion.estado)}
                      <span>{habitacion.estado}</span>
                    </div>
                  </td>
                  <td>{habitacion.capacidad || "-"}</td>
                  <td className="price-cell">${habitacion.precio_noche}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-edit-small"
                        onClick={() => handleEditar(habitacion)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete-small"
                        onClick={() => handleEliminar(habitacion.id)}
                      >
                        <FaTrash />
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
  );
}
