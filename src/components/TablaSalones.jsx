import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  FaChair, 
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
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaCrown,
  FaTheaterMasks,
  FaHeart,
  FaWifi,
  FaParking,
  FaUtensils,
  FaMusic,
  FaMicrophone
} from "react-icons/fa";
import "./ModernSalones.css";

const API_BASE_URLS = [
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];


export default function TablaSalones() {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCapacity, setFilterCapacity] = useState("todos");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");

  // Form fields
  const [nombre, setNombre] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [precioAlquiler, setPrecioAlquiler] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [servicios, setServicios] = useState([]);
  const [ubicacion, setUbicacion] = useState("");

  const [salones, setSalones] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    ocupados: 0,
    mantenimiento: 0,
    capacidadTotal: 0
  });

  // Servicios disponibles
  const serviciosDisponibles = [
    { id: 'wifi', label: 'WiFi', icon: FaWifi },
    { id: 'estacionamiento', label: 'Estacionamiento', icon: FaParking },
    { id: 'catering', label: 'Catering', icon: FaUtensils },
    { id: 'sonido', label: 'Sistema de Sonido', icon: FaMusic },
    { id: 'microfono', label: 'Micrófono', icon: FaMicrophone },
  ];

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchSalones();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [salones]);

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
        Swal.fire("Error", "Error al cargar salones", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = salones.length;
    const disponibles = salones.filter(s => s.estado === "disponible").length;
    const ocupados = salones.filter(s => s.estado === "ocupado").length;
    const mantenimiento = salones.filter(s => s.estado === "mantenimiento").length;
    const capacidadTotal = salones.reduce((sum, salon) => sum + (salon.capacidad || 0), 0);
    
    setStats({ total, disponibles, ocupados, mantenimiento, capacidadTotal });
  };

  const resetFormulario = () => {
    setNombre("");
    setCapacidad("");
    setEstado("disponible");
    setPrecioAlquiler("");
    setDescripcion("");
    setTipo("");
    setServicios([]);
    setUbicacion("");
    setEditandoId(null);
    setShowForm(false);
  };

  const handleServicioChange = (servicioId) => {
    setServicios(prev => 
      prev.includes(servicioId) 
        ? prev.filter(s => s !== servicioId)
        : [...prev, servicioId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !capacidad || !estado.trim() || !precioAlquiler) {
      return Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Nombre, capacidad, estado y precio son obligatorios.",
      });
    }

    const salonData = {
      nombre: nombre.trim(),
      capacidad: Number(capacidad),
      estado: estado.trim(),
      precio_alquiler: Number(precioAlquiler),
      descripcion: descripcion.trim(),
      tipo: tipo.trim(),
      servicios: servicios.join(','),
      ubicacion: ubicacion.trim()
    };

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
        body: JSON.stringify(salonData),
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: editandoId ? "Salón actualizado" : "Salón creado",
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de red o servidor",
      });
    }
  };

  const handleEliminar = async (id) => {
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
          title: "¡Eliminado!",
          text: "Salón eliminado",
          timer: 2000,
          showConfirmButton: false,
        });
        setSalones(salones.filter((s) => s.id !== id));
        if (editandoId === id) resetFormulario();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error al eliminar",
        });
      }
    } catch (error) {
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
    setDescripcion(salon.descripcion || "");
    setTipo(salon.tipo || "");
    setServicios(salon.servicios ? salon.servicios.split(',').filter(s => s) : []);
    setUbicacion(salon.ubicacion || "");
    setEditandoId(salon.id);
    setShowForm(true);
  };

  // Filter and sort logic
  const filteredSalones = salones
    .filter(salon => {
      const matchesSearch = salon.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (salon.tipo && salon.tipo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === "todos" || salon.estado === filterStatus;
      const matchesCapacity = filterCapacity === "todos" || 
        (filterCapacity === "pequeno" && salon.capacidad <= 50) ||
        (filterCapacity === "mediano" && salon.capacidad > 50 && salon.capacidad <= 150) ||
        (filterCapacity === "grande" && salon.capacidad > 150);
      
      return matchesSearch && matchesStatus && matchesCapacity;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "precio_alquiler" || sortBy === "capacidad") {
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
      case "ocupado": return <FaCalendarAlt className="status-icon occupied" />;
      case "mantenimiento": return <FaTools className="status-icon maintenance" />;
      default: return <FaCheckCircle className="status-icon" />;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "disponible": return "#27ae60";
      case "ocupado": return "#e74c3c";
      case "mantenimiento": return "#f39c12";
      default: return "#95a5a6";
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "conferencia": return <FaBuilding />;
      case "boda": return <FaHeart />;
      case "teatro": return <FaTheaterMasks />;
      case "vip": return <FaCrown />;
      default: return <FaChair />;
    }
  };

  const getCapacityLevel = (capacidad) => {
    if (capacidad <= 50) return { level: "Pequeño", color: "#3498db" };
    if (capacidad <= 150) return { level: "Mediano", color: "#f39c12" };
    return { level: "Grande", color: "#e74c3c" };
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="stat-card-salones" style={{ borderColor: color }}>
      <div className="stat-icon-salones" style={{ color }}>
        <Icon />
      </div>
      <div className="stat-content-salones">
        <div className="stat-value-salones">{value}</div>
        <div className="stat-title-salones">{title}</div>
        {subtitle && <div className="stat-subtitle-salones">{subtitle}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando salones...</p>
      </div>
    );
  }

  return (
    <div className="modern-salones">
      {/* Header */}
      <div className="salones-header">
        <div className="header-content">
          <div className="header-title">
            <FaChair className="title-icon" />
            <div>
              <h1>Gestión de Salones</h1>
              <p>Administra los salones de eventos del hotel</p>
            </div>
          </div>
          <button 
            className="btn-primary"
            onClick={() => { resetFormulario(); setShowForm(!showForm); }}
          >
            <FaPlus />
            {showForm ? "Cancelar" : "Nuevo Salón"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-salones">
        <StatCard
          icon={FaBuilding}
          title="Total Salones"
          value={stats.total}
          color="#667eea"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Disponibles"
          value={stats.disponibles}
          subtitle={`${stats.total ? Math.round((stats.disponibles / stats.total) * 100) : 0}%`}
          color="#27ae60"
        />
        <StatCard
          icon={FaCalendarAlt}
          title="Ocupados"
          value={stats.ocupados}
          subtitle={`${stats.total ? Math.round((stats.ocupados / stats.total) * 100) : 0}%`}
          color="#e74c3c"
        />
        <StatCard
          icon={FaUsers}
          title="Capacidad Total"
          value={stats.capacidadTotal}
          subtitle="personas"
          color="#9b59b6"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editandoId ? <FaEdit /> : <FaPlus />}
                {editandoId ? "Editar Salón" : "Nuevo Salón"}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modern-form-large">
              <div className="form-section">
                <h4>Información Básica</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Salón</label>
                    <input 
                      type="text" 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      placeholder="Ej: Salón Imperial, Salón de Bodas"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Salón</label>
                    <select 
                      value={tipo} 
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="conferencia">Conferencia</option>
                      <option value="boda">Boda</option>
                      <option value="teatro">Teatro</option>
                      <option value="vip">VIP</option>
                      <option value="multiproposito">Multipropósito</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Capacidad (personas)</label>
                    <input 
                      type="number" 
                      value={capacidad} 
                      onChange={(e) => setCapacidad(e.target.value)} 
                      placeholder="100"
                      required 
                      min="1" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select 
                      value={estado} 
                      onChange={(e) => setEstado(e.target.value)} 
                      required
                    >
                      <option value="disponible">Disponible</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio de Alquiler</label>
                    <div className="input-with-icon">
                      <FaDollarSign className="input-icon" />
                      <input 
                        type="number" 
                        value={precioAlquiler} 
                        onChange={(e) => setPrecioAlquiler(e.target.value)} 
                        placeholder="500.00"
                        required 
                        min="0" 
                        step="0.01" 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ubicación</label>
                    <input 
                      type="text" 
                      value={ubicacion} 
                      onChange={(e) => setUbicacion(e.target.value)} 
                      placeholder="Piso 2, Ala Norte"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Servicios Incluidos</h4>
                <div className="servicios-grid">
                  {serviciosDisponibles.map((servicio) => (
                    <label key={servicio.id} className="servicio-checkbox">
                      <input
                        type="checkbox"
                        checked={servicios.includes(servicio.id)}
                        onChange={() => handleServicioChange(servicio.id)}
                      />
                      <span className="checkmark">
                        <servicio.icon />
                      </span>
                      <span className="servicio-label">{servicio.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                    placeholder="Descripción detallada del salón, características especiales, etc."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaSave />
                  {editandoId ? "Actualizar" : "Guardar"}
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
            placeholder="Buscar por nombre o tipo..."
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
              <option value="ocupado">Ocupado</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          
          <div className="filter-group">
            <FaUsers />
            <select value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)}>
              <option value="todos">Todas las capacidades</option>
              <option value="pequeno">Pequeño (≤50)</option>
              <option value="mediano">Mediano (51-150)</option>
              <option value="grande">Grande (&gt;150)</option>
            </select>
          </div>
          
          <div className="filter-group">
            <FaSortAmountDown />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="nombre">Ordenar por nombre</option>
              <option value="capacidad">Ordenar por capacidad</option>
              <option value="estado">Ordenar por estado</option>
              <option value="precio_alquiler">Ordenar por precio</option>
            </select>
          </div>

          <button 
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FaChair />
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
      {filteredSalones.length === 0 ? (
        <div className="empty-state">
          <FaChair className="empty-icon" />
          <h3>No hay salones</h3>
          <p>
            {searchTerm || filterStatus !== "todos" || filterCapacity !== "todos"
              ? "No se encontraron salones con los filtros aplicados" 
              : "Comienza creando tu primer salón"}
          </p>
          {!searchTerm && filterStatus === "todos" && filterCapacity === "todos" && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus />
              Crear Primer Salón
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="salones-grid">
          {filteredSalones.map((salon) => {
            const capacityInfo = getCapacityLevel(salon.capacidad);
            const salonServicios = salon.servicios ? salon.servicios.split(',').filter(s => s) : [];
            
            return (
              <div key={salon.id} className={`salon-card ${salon.estado}`}>
                <div className="card-header">
                  <div className="salon-name">
                    {getTipoIcon(salon.tipo)}
                    <div>
                      <h4>{salon.nombre}</h4>
                      {salon.tipo && <span className="salon-type">{salon.tipo}</span>}
                    </div>
                  </div>
                  <div className="salon-status" style={{ color: getStatusColor(salon.estado) }}>
                    {getStatusIcon(salon.estado)}
                    <span className="status-text">{salon.estado}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="salon-details">
                    <div className="detail-item">
                      <FaUsers />
                      <span>{salon.capacidad} personas</span>
                      <span className="capacity-badge" style={{ backgroundColor: capacityInfo.color }}>
                        {capacityInfo.level}
                      </span>
                    </div>
                    
                    {salon.ubicacion && (
                      <div className="detail-item">
                        <FaBuilding />
                        <span>{salon.ubicacion}</span>
                      </div>
                    )}
                    
                    <div className="salon-price">
                      <FaDollarSign />
                      <span>${salon.precio_alquiler}/evento</span>
                    </div>
                  </div>

                  {salon.descripcion && (
                    <p className="salon-description">{salon.descripcion}</p>
                  )}

                  {salonServicios.length > 0 && (
                    <div className="servicios-incluidos">
                      <h5>Servicios incluidos:</h5>
                      <div className="servicios-list">
                        {salonServicios.map((servicioId) => {
                          const servicio = serviciosDisponibles.find(s => s.id === servicioId);
                          return servicio ? (
                            <span key={servicioId} className="servicio-tag">
                              <servicio.icon />
                              {servicio.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditar(salon)}
                    title="Editar salón"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleEliminar(salon.id)}
                    title="Eliminar salón"
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
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Precio/Evento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalones.map((salon) => (
                <tr key={salon.id}>
                  <td>
                    <div className="table-salon-name">
                      {getTipoIcon(salon.tipo)}
                      {salon.nombre}
                    </div>
                  </td>
                  <td>{salon.tipo || "-"}</td>
                  <td>
                    <div className="table-capacity">
                      <FaUsers />
                      <span>{salon.capacidad}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-status" style={{ color: getStatusColor(salon.estado) }}>
                      {getStatusIcon(salon.estado)}
                      <span>{salon.estado}</span>
                    </div>
                  </td>
                  <td>{salon.ubicacion || "-"}</td>
                  <td className="price-cell">${salon.precio_alquiler}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-edit-small"
                        onClick={() => handleEditar(salon)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete-small"
                        onClick={() => handleEliminar(salon.id)}
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
