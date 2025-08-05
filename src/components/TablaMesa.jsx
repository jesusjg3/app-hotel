import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  FaUtensils, 
  FaUsers, 
  FaEdit, 
  FaTrashAlt, 
  FaSearch, 
  FaPlus, 
  FaTh, 
  FaList, 
  FaCheck, 
  FaTimes,
  FaClock,
  FaTools,
  FaFilter,
  FaChair
} from "react-icons/fa";
import "./ModernMesas.css";

const API_BASE_URLS = [
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];

export default function TablaMesa() {
  const [mesas, setMesas] = useState([]);
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vistaActual, setVistaActual] = useState("cards");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [loading, setLoading] = useState(true);

  // Datos simulados adicionales para mesas
  const generarDatosAdicionales = (mesa) => ({
    ...mesa,
    ubicacion: ['Terraza', 'Salón Principal', 'Jardín', 'Zona VIP', 'Bar'][Math.floor(Math.random() * 5)],
    tipo: capacidad <= 2 ? 'Íntima' : capacidad <= 4 ? 'Familiar' : capacidad <= 6 ? 'Grupo' : 'Evento',
    reservas_hoy: Math.floor(Math.random() * 3),
    ultima_limpieza: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
    ingresos_mes: Math.floor(Math.random() * 500000) + 100000
  });

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_MESAS, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });
      if (res.ok) {
        const data = await res.json();
        const mesasConDatos = data.map(generarDatosAdicionales);
        setMesas(mesasConDatos);
      } else {
        Swal.fire("Error", "Error al cargar mesas", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      Swal.fire("Error", "Error de red cargando mesas", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setNumero("");
    setCapacidad("");
    setEstado("disponible");
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const validarFormulario = () => {
    if (!numero.trim()) {
      Swal.fire("Atención", "El número de mesa es obligatorio.", "warning");
      return false;
    }

    if (!capacidad || parseInt(capacidad) < 1) {
      Swal.fire("Atención", "La capacidad debe ser al menos 1.", "warning");
      return false;
    }

    if (parseInt(capacidad) > 20) {
      Swal.fire("Atención", "La capacidad máxima es de 20 personas.", "warning");
      return false;
    }

    // Verificar si el número de mesa ya existe (solo al crear)
    if (!editandoId) {
      const numeroExistente = mesas.some(
        mesa => mesa.numero.toString() === numero.trim()
      );
      if (numeroExistente) {
        Swal.fire("Atención", "Ya existe una mesa con este número.", "warning");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const url = editandoId ? `${API_MESAS}/${editandoId}` : API_MESAS;
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          numero: numero.trim(),
          capacidad: parseInt(capacidad),
          estado: estado,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: editandoId ? "Mesa actualizada" : "Mesa creada",
          timer: 1800,
          showConfirmButton: false,
        });

        resetFormulario();
        cargarMesas();
      } else {
        const data = await res.json().catch(() => ({}));
        Swal.fire("Error", data.message || "Error guardando mesa", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      Swal.fire("Error", "Error de red al guardar mesa", "error");
    }
  };

  const handleEditar = (mesa) => {
    setNumero(mesa.numero.toString());
    setCapacidad(mesa.capacidad.toString());
    setEstado(mesa.estado);
    setEditandoId(mesa.id);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Seguro que quieres eliminar esta mesa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_MESAS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        Swal.fire("Eliminada", "Mesa eliminada.", "success");
        cargarMesas();
      } else {
        Swal.fire("Error", "Error eliminando mesa.", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red al eliminar mesa.", "error");
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const mesa = mesas.find(m => m.id === id);
      const res = await fetch(`${API_MESAS}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          numero: mesa.numero,
          capacidad: mesa.capacidad,
          estado: nuevoEstado,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: `Mesa marcada como ${nuevoEstado}`,
          timer: 1500,
          showConfirmButton: false,
        });
        cargarMesas();
      } else {
        Swal.fire("Error", "Error actualizando estado", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  // Filtrar mesas
  const mesasFiltradas = mesas.filter(mesa => {
    const coincideBusqueda = mesa.numero.toString().includes(busqueda) ||
                            mesa.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
                            mesa.tipo?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = !filtroEstado || mesa.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'disponible': return '#10b981';
      case 'ocupada': return '#f59e0b';
      case 'mantenimiento': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'disponible': return <FaCheck />;
      case 'ocupada': return <FaClock />;
      case 'mantenimiento': return <FaTools />;
      default: return <FaTimes />;
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mesas-loading">
        <div className="loading-spinner"></div>
        <p>Cargando mesas...</p>
      </div>
    );
  }

  return (
    <div className="mesas-container">
      <div className="mesas-header">
        <div className="header-top">
          <h1>
            <FaUtensils className="header-icon" />
            Gestión de Mesas
          </h1>
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaPlus /> Nueva Mesa
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{mesas.length}</div>
              <div className="stat-label">Total Mesas</div>
            </div>
            <FaUtensils className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{mesas.filter(m => m.estado === 'disponible').length}</div>
              <div className="stat-label">Disponibles</div>
            </div>
            <FaCheck className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{mesas.filter(m => m.estado === 'ocupada').length}</div>
              <div className="stat-label">Ocupadas</div>
            </div>
            <FaClock className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{mesas.reduce((sum, m) => sum + m.capacidad, 0)}</div>
              <div className="stat-label">Capacidad Total</div>
            </div>
            <FaUsers className="stat-icon" />
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>
                <FaUtensils />
                {editandoId ? "Editar Mesa" : "Nueva Mesa"}
              </h2>
              <button className="btn-close" onClick={resetFormulario}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="mesa-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    🔢 Número de Mesa
                  </label>
                  <input 
                    type="text" 
                    value={numero} 
                    onChange={e => setNumero(e.target.value)} 
                    placeholder="Ej: 1, A1, VIP-01"
                    maxLength="10"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUsers /> Capacidad (personas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={capacidad}
                    onChange={e => setCapacidad(e.target.value)}
                    placeholder="4"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaChair /> Estado de la Mesa
                </label>
                <select value={estado} onChange={e => setEstado(e.target.value)} required>
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editandoId ? "Actualizar" : "Crear"} Mesa
                </button>
                <button type="button" onClick={resetFormulario} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mesas-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar mesas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Solo disponibles</option>
              <option value="ocupada">Solo ocupadas</option>
              <option value="mantenimiento">En mantenimiento</option>
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

      <div className="mesas-content">
        {mesasFiltradas.length === 0 ? (
          <div className="empty-state">
            <FaUtensils className="empty-icon" />
            <h3>No se encontraron mesas</h3>
            <p>No hay mesas que coincidan con los filtros actuales</p>
          </div>
        ) : vistaActual === 'cards' ? (
          <div className="mesas-grid">
            {mesasFiltradas.map((mesa) => (
              <div key={mesa.id} className={`mesa-card ${mesa.estado}`}>
                <div className="card-header">
                  <div className="mesa-info">
                    <h3>Mesa {mesa.numero}</h3>
                    <span className="mesa-ubicacion">{mesa.ubicacion}</span>
                  </div>
                  <div 
                    className="mesa-estado"
                    style={{ backgroundColor: obtenerColorEstado(mesa.estado) }}
                  >
                    {obtenerIconoEstado(mesa.estado)}
                    {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
                  </div>
                </div>

                <div className="card-body">
                  <div className="mesa-detail">
                    <FaUsers className="detail-icon" />
                    <span>Capacidad: {mesa.capacidad} personas</span>
                  </div>
                  
                  <div className="mesa-detail">
                    <FaChair className="detail-icon" />
                    <span>Tipo: {mesa.tipo}</span>
                  </div>
                  
                  <div className="mesa-detail">
                    📅 <span>Reservas hoy: {mesa.reservas_hoy}</span>
                  </div>

                  <div className="mesa-detail">
                    🧽 <span>Última limpieza: {formatearHora(mesa.ultima_limpieza)}</span>
                  </div>

                  <div className="mesa-detail">
                    💰 <span>Ingresos mes: {formatearPrecio(mesa.ingresos_mes)}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEditar(mesa)}
                    title="Editar mesa"
                  >
                    <FaEdit /> Editar
                  </button>
                  
                  {mesa.estado !== 'disponible' && (
                    <button 
                      className="btn-available"
                      onClick={() => cambiarEstado(mesa.id, 'disponible')}
                      title="Marcar como disponible"
                    >
                      <FaCheck /> Disponible
                    </button>
                  )}
                  
                  {mesa.estado !== 'ocupada' && (
                    <button 
                      className="btn-occupied"
                      onClick={() => cambiarEstado(mesa.id, 'ocupada')}
                      title="Marcar como ocupada"
                    >
                      <FaClock /> Ocupar
                    </button>
                  )}
                  
                  <button 
                    className="btn-delete" 
                    onClick={() => handleEliminar(mesa.id)}
                    title="Eliminar mesa"
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mesas-table-container">
            <table className="mesas-table">
              <thead>
                <tr>
                  <th>Mesa</th>
                  <th>Ubicación</th>
                  <th>Capacidad</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Reservas Hoy</th>
                  <th>Ingresos Mes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesasFiltradas.map((mesa) => (
                  <tr key={mesa.id} className={`row-${mesa.estado}`}>
                    <td>
                      <div className="mesa-cell">
                        <div className="mesa-numero">#{mesa.numero}</div>
                      </div>
                    </td>
                    <td>{mesa.ubicacion}</td>
                    <td>
                      <span className="capacidad-badge">
                        <FaUsers /> {mesa.capacidad}
                      </span>
                    </td>
                    <td>
                      <span className="tipo-badge">
                        {mesa.tipo}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="estado-badge"
                        style={{ 
                          backgroundColor: obtenerColorEstado(mesa.estado),
                          color: 'white' 
                        }}
                      >
                        {obtenerIconoEstado(mesa.estado)}
                        {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
                      </span>
                    </td>
                    <td>{mesa.reservas_hoy}</td>
                    <td>{formatearPrecio(mesa.ingresos_mes)}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-edit-small" 
                          onClick={() => handleEditar(mesa)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        {mesa.estado !== 'disponible' && (
                          <button 
                            className="btn-available-small"
                            onClick={() => cambiarEstado(mesa.id, 'disponible')}
                            title="Disponible"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button 
                          className="btn-delete-small" 
                          onClick={() => handleEliminar(mesa.id)}
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
