import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  FaCog, 
  FaDollarSign, 
  FaEdit, 
  FaTrashAlt, 
  FaSearch, 
  FaPlus, 
  FaTh, 
  FaList, 
  FaCheck, 
  FaTimes,
  FaFileAlt,
  FaStar,
  FaFilter,
  FaClock
} from "react-icons/fa";
import "./ModernServiciosExtras.css";

const API_SERVICIOS_EXTRAS = [
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];



export default function ServiciosExtras() {
  const [servicios, setServicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vistaActual, setVistaActual] = useState("cards");
  const [busqueda, setBusqueda] = useState("");
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("");
  const [loading, setLoading] = useState(true);

  // Datos simulados adicionales para servicios
  const generarDatosAdicionales = (servicio) => ({
    ...servicio,
    categoria: ['Spa & Bienestar', 'Alimentación', 'Entretenimiento', 'Transporte', 'Eventos'][Math.floor(Math.random() * 5)],
    duracion: Math.floor(Math.random() * 180) + 30, // 30-210 minutos
    popularidad: Math.floor(Math.random() * 5) + 1, // 1-5 estrellas
    solicitudes_mes: Math.floor(Math.random() * 50) + 5,
    fecha_creacion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_SERVICIOS_EXTRA, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });
      if (res.ok) {
        const data = await res.json();
        const serviciosConDatos = data.map(generarDatosAdicionales);
        setServicios(serviciosConDatos);
      } else {
        Swal.fire("Error", "Error al cargar servicios extras", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      Swal.fire("Error", "Error de red cargando servicios extras", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setDisponible(true);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const validarFormulario = () => {
    if (nombre.trim().length < 3) {
      Swal.fire("Atención", "El nombre debe tener al menos 3 caracteres.", "warning");
      return false;
    }

    if (!precio || parseFloat(precio) <= 0) {
      Swal.fire("Atención", "El precio debe ser mayor a 0.", "warning");
      return false;
    }

    if (descripcion.trim().length < 10) {
      Swal.fire("Atención", "La descripción debe tener al menos 10 caracteres.", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const url = editandoId ? `${API_SERVICIOS_EXTRA}/${editandoId}` : API_SERVICIOS_EXTRA;
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
          precio: parseFloat(precio),
          descripcion: descripcion.trim(),
          disponible: disponible ? 1 : 0,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: editandoId ? "Servicio actualizado" : "Servicio creado",
          timer: 1800,
          showConfirmButton: false,
        });

        resetFormulario();
        cargarServicios();
      } else {
        const data = await res.json().catch(() => ({}));
        Swal.fire("Error", data.message || "Error guardando servicio", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      Swal.fire("Error", "Error de red al guardar servicio", "error");
    }
  };

  const handleEditar = (servicio) => {
    setNombre(servicio.nombre);
    setPrecio(servicio.precio.toString());
    setDescripcion(servicio.descripcion);
    setDisponible(!!servicio.disponible);
    setEditandoId(servicio.id);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Seguro que quieres eliminar este servicio?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_SERVICIOS_EXTRA}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        Swal.fire("Eliminado", "Servicio eliminado.", "success");
        cargarServicios();
      } else {
        Swal.fire("Error", "Error eliminando servicio.", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red al eliminar servicio.", "error");
    }
  };

  const toggleDisponibilidad = async (id, disponibilidadActual) => {
    try {
      const servicio = servicios.find(s => s.id === id);
      const res = await fetch(`${API_SERVICIOS_EXTRA}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombre: servicio.nombre,
          precio: servicio.precio,
          descripcion: servicio.descripcion,
          disponible: disponibilidadActual ? 0 : 1,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: `Servicio ${disponibilidadActual ? 'desactivado' : 'activado'}`,
          timer: 1500,
          showConfirmButton: false,
        });
        cargarServicios();
      } else {
        Swal.fire("Error", "Error actualizando disponibilidad", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  // Filtrar servicios
  const serviciosFiltrados = servicios.filter(servicio => {
    const coincideBusqueda = servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            servicio.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                            servicio.categoria?.toLowerCase().includes(busqueda.toLowerCase());
    
    let coincideDisponibilidad = true;
    if (filtroDisponibilidad === "disponible") {
      coincideDisponibilidad = servicio.disponible;
    } else if (filtroDisponibilidad === "no_disponible") {
      coincideDisponibilidad = !servicio.disponible;
    }
    
    return coincideBusqueda && coincideDisponibilidad;
  });

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderEstrellas = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        style={{ 
          color: i < rating ? '#ffd700' : '#e0e0e0',
          fontSize: '0.8rem'
        }} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="servicios-loading">
        <div className="loading-spinner"></div>
        <p>Cargando servicios extras...</p>
      </div>
    );
  }

  return (
    <div className="servicios-container">
      <div className="servicios-header">
        <div className="header-top">
          <h1>
            <FaCog className="header-icon" />
            Servicios Extras
          </h1>
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaPlus /> Nuevo Servicio
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{servicios.length}</div>
              <div className="stat-label">Total Servicios</div>
            </div>
            <FaCog className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{servicios.filter(s => s.disponible).length}</div>
              <div className="stat-label">Disponibles</div>
            </div>
            <FaCheck className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{new Set(servicios.map(s => s.categoria)).size}</div>
              <div className="stat-label">Categorías</div>
            </div>
            <FaFilter className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">
                {formatearPrecio(servicios.reduce((sum, s) => sum + s.precio, 0) / servicios.length || 0)}
              </div>
              <div className="stat-label">Precio Promedio</div>
            </div>
            <FaDollarSign className="stat-icon" />
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>
                <FaCog />
                {editandoId ? "Editar Servicio" : "Nuevo Servicio Extra"}
              </h2>
              <button className="btn-close" onClick={resetFormulario}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="servicio-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaCog /> Nombre del Servicio
                  </label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    placeholder="Ej: Masaje relajante, Spa, etc."
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaDollarSign /> Precio (COP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaFileAlt /> Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe el servicio extra en detalle..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={disponible}
                    onChange={e => setDisponible(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Servicio disponible
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editandoId ? "Actualizar" : "Crear"} Servicio
                </button>
                <button type="button" onClick={resetFormulario} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="servicios-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              value={filtroDisponibilidad} 
              onChange={(e) => setFiltroDisponibilidad(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los servicios</option>
              <option value="disponible">Solo disponibles</option>
              <option value="no_disponible">Solo no disponibles</option>
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

      <div className="servicios-content">
        {serviciosFiltrados.length === 0 ? (
          <div className="empty-state">
            <FaCog className="empty-icon" />
            <h3>No se encontraron servicios</h3>
            <p>No hay servicios que coincidan con los filtros actuales</p>
          </div>
        ) : vistaActual === 'cards' ? (
          <div className="servicios-grid">
            {serviciosFiltrados.map((servicio) => (
              <div key={servicio.id} className={`servicio-card ${!servicio.disponible ? 'no-disponible' : ''}`}>
                <div className="card-header">
                  <div className="servicio-info">
                    <h3>{servicio.nombre}</h3>
                    <span className="servicio-categoria">{servicio.categoria}</span>
                  </div>
                  <div className="servicio-precio">
                    {formatearPrecio(servicio.precio)}
                  </div>
                </div>

                <div className="card-body">
                  <p className="servicio-descripcion">{servicio.descripcion}</p>
                  
                  <div className="servicio-details">
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <span>{servicio.duracion} min</span>
                    </div>
                    
                    <div className="detail-item">
                      <div className="popularity">
                        {renderEstrellas(servicio.popularidad)}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      📊 <span>{servicio.solicitudes_mes} solicitudes/mes</span>
                    </div>
                  </div>

                  <div className="servicio-estado">
                    <span className={`estado-badge ${servicio.disponible ? 'disponible' : 'no-disponible'}`}>
                      {servicio.disponible ? <FaCheck /> : <FaTimes />}
                      {servicio.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEditar(servicio)}
                    title="Editar servicio"
                  >
                    <FaEdit /> Editar
                  </button>
                  <button 
                    className={`btn-toggle ${servicio.disponible ? 'btn-disable' : 'btn-enable'}`}
                    onClick={() => toggleDisponibilidad(servicio.id, servicio.disponible)}
                    title={servicio.disponible ? 'Desactivar' : 'Activar'}
                  >
                    {servicio.disponible ? <FaTimes /> : <FaCheck />}
                    {servicio.disponible ? 'Desactivar' : 'Activar'}
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleEliminar(servicio.id)}
                    title="Eliminar servicio"
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="servicios-table-container">
            <table className="servicios-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Duración</th>
                  <th>Popularidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {serviciosFiltrados.map((servicio) => (
                  <tr key={servicio.id} className={!servicio.disponible ? 'row-disabled' : ''}>
                    <td>
                      <div className="servicio-cell">
                        <div>
                          <div className="servicio-nombre">{servicio.nombre}</div>
                          <div className="servicio-descripcion-short">
                            {servicio.descripcion.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="categoria-badge">
                        {servicio.categoria}
                      </span>
                    </td>
                    <td className="precio-cell">
                      {formatearPrecio(servicio.precio)}
                    </td>
                    <td>{servicio.duracion} min</td>
                    <td>
                      <div className="table-popularity">
                        {renderEstrellas(servicio.popularidad)}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`estado-badge ${servicio.disponible ? 'disponible' : 'no-disponible'}`}
                      >
                        {servicio.disponible ? <FaCheck /> : <FaTimes />}
                        {servicio.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-edit-small" 
                          onClick={() => handleEditar(servicio)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className={`btn-toggle-small ${servicio.disponible ? 'btn-disable' : 'btn-enable'}`}
                          onClick={() => toggleDisponibilidad(servicio.id, servicio.disponible)}
                          title={servicio.disponible ? 'Desactivar' : 'Activar'}
                        >
                          {servicio.disponible ? <FaTimes /> : <FaCheck />}
                        </button>
                        <button 
                          className="btn-delete-small" 
                          onClick={() => handleEliminar(servicio.id)}
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
