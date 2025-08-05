import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaSortAmountDown,
  FaEye,
  FaUser,
  FaBed,
  FaUtensils,
  FaChair,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimes,
  FaSave,
  FaCreditCard,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaServicestack,
  FaExclamationTriangle,
  FaCheck,
  FaUsers,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";
import "./ModernReservas.css";

const API_BASE_URLS = [
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];

const API_BASE_URL = `${API_BASE_URLS[0]}/reservas`;
export default function TablaReservas() {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [sortBy, setSortBy] = useState("fecha_inicio");
  const [sortOrder, setSortOrder] = useState("desc");

  // Form states
  const [clientes, setClientes] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [tipoReserva, setTipoReserva] = useState("");
  const [mesas, setMesas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [salones, setSalones] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [idObjeto, setIdObjeto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [huespedes, setHuespedes] = useState("");
  const [comentarios, setComentarios] = useState("");
  
  const [reservas, setReservas] = useState([]);
  const [serviciosExtras, setServiciosExtras] = useState([]);
  const [serviciosExtrasSeleccionados, setServiciosExtrasSeleccionados] = useState([]);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    canceladas: 0,
    ingresosTotales: 0
  });

  const navigate = useNavigate();

  // Función para asegurar formato YYYY-MM-DD
  const formatearFechaISO = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [reservas]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const [
        resClientes,
        resMesas,
        resHabitaciones,
        resSalones,
        resReservas,
        resServiciosExtras,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/mesas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/habitaciones`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/salones`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/reservas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/servicios-extra`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resClientes.ok) setClientes(await resClientes.json());
      if (resMesas.ok) setMesas(await resMesas.json());
      if (resHabitaciones.ok) setHabitaciones(await resHabitaciones.json());
      if (resSalones.ok) setSalones(await resSalones.json());
      if (resReservas.ok) setReservas(await resReservas.json());
      if (resServiciosExtras.ok) setServiciosExtras(await resServiciosExtras.json());
    } catch (error) {
      Swal.fire("Error", "Error cargando datos iniciales", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = reservas.length;
    const pendientes = reservas.filter(r => r.estado === "pendiente").length;
    const confirmadas = reservas.filter(r => r.estado === "confirmada" || r.estado === "confirmado").length;
    const canceladas = reservas.filter(r => r.estado === "cancelada" || r.estado === "cancelado").length;
    
    // Simulate revenue calculation (would need actual pricing data)
    const ingresosTotales = confirmadas * 150; // Average revenue per confirmed reservation
    
    setStats({ total, pendientes, confirmadas, canceladas, ingresosTotales });
  };

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(filtroCliente.toLowerCase())
  );

  const toggleServicioExtra = (servicio) => {
    const exists = serviciosExtrasSeleccionados.find(
      (s) => s.servicio_extra_id === servicio.id
    );
    if (exists) {
      setServiciosExtrasSeleccionados(
        serviciosExtrasSeleccionados.filter(
          (s) => s.servicio_extra_id !== servicio.id
        )
      );
    } else {
      setServiciosExtrasSeleccionados([
        ...serviciosExtrasSeleccionados,
        { servicio_extra_id: servicio.id, cantidad: 1, precio: servicio.precio },
      ]);
    }
  };

  const cambiarCantidad = (servicioId, cantidad) => {
    if (cantidad < 1) cantidad = 1;
    setServiciosExtrasSeleccionados((prev) =>
      prev.map((s) =>
        s.servicio_extra_id === servicioId ? { ...s, cantidad: Number(cantidad) } : s
      )
    );
  };

  const limpiarFormulario = () => {
    setClienteId("");
    setTipoReserva("");
    setIdObjeto("");
    setFechaInicio("");
    setFechaFin("");
    setHoraInicio("");
    setHoraFin("");
    setHuespedes("");
    setComentarios("");
    setServiciosExtrasSeleccionados([]);
    setReservaEditando(null);
    setFiltroCliente("");
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId || !tipoReserva || !idObjeto || !fechaInicio || !fechaFin) {
      return Swal.fire("Error", "Complete todos los campos requeridos", "error");
    }

    const hoy = new Date();
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (fechaInicioDate < new Date(hoy.setHours(0, 0, 0, 0))) {
      return Swal.fire("Error", "La fecha de inicio no puede ser anterior a hoy.", "error");
    }
    if (fechaFinDate < fechaInicioDate) {
      return Swal.fire("Error", "La fecha de fin no puede ser anterior a la fecha de inicio.", "error");
    }

    // Check for conflicts
    const conflicto = reservas.some((reserva) => {
      if (
        reserva.tipo_reserva === tipoReserva &&
        reserva.id_objeto === idObjeto &&
        reserva.id !== (reservaEditando ? reservaEditando.id : null) &&
        (reserva.estado === "confirmada" || reserva.estado === "confirmado" || reserva.estado === "pendiente")
      ) {
        const inicioExistente = new Date(reserva.fecha_inicio);
        const finExistente = new Date(reserva.fecha_fin);

        if (
          (fechaInicioDate <= finExistente) &&
          (fechaFinDate >= inicioExistente)
        ) {
          return true;
        }
      }
      return false;
    });

    if (conflicto) {
      return Swal.fire(
        "Error",
        `La ${tipoReserva === "habitacion" ? "habitación" : tipoReserva === "mesa" ? "mesa" : "salón"} seleccionada no está disponible en las fechas indicadas.`,
        "error"
      );
    }

    try {
      const token = localStorage.getItem("token");
      const reservaData = {
        cliente_id: clienteId,
        tipo_reserva: tipoReserva,
        id_objeto: idObjeto,
        fecha_inicio: formatearFechaISO(fechaInicio),
        fecha_fin: formatearFechaISO(fechaFin),
        hora_inicio: horaInicio || null,
        hora_fin: horaFin || null,
        huespedes: huespedes || null,
        comentarios: comentarios || null,
        estado: reservaEditando ? reservaEditando.estado : "pendiente",
      };

      let response;
      if (reservaEditando) {
        response = await fetch(`${API_BASE_URL}/reservas/${reservaEditando.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservaData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/reservas`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservaData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        return Swal.fire("Error", errorData.message || "Error al procesar la reserva", "error");
      }

      const reservaGuardada = await response.json();

      // Handle extra services if creating new reservation
      if (!reservaEditando && serviciosExtrasSeleccionados.length > 0) {
        for (const servicio of serviciosExtrasSeleccionados) {
          await fetch(`${API_BASE_URL}/reservas/${reservaGuardada.id}/servicios`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reserva_id: reservaGuardada.id,
              servicio_extra_id: servicio.servicio_extra_id,
              cantidad: servicio.cantidad,
              precio_total: servicio.precio * servicio.cantidad,
            }),
          });
        }
      }

      if (reservaEditando) {
        setReservas((prev) =>
          prev.map((r) => (r.id === reservaGuardada.id ? reservaGuardada : r))
        );
        Swal.fire("¡Éxito!", "Reserva actualizada", "success");
      } else {
        setReservas((prev) => [...prev, reservaGuardada]);
        Swal.fire("¡Éxito!", "Reserva creada", "success");
      }
      
      limpiarFormulario();
    } catch (error) {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const handleEditar = (reserva) => {
    setReservaEditando(reserva);
    setClienteId(reserva.cliente_id || "");
    setTipoReserva(reserva.tipo_reserva || "");
    setIdObjeto(reserva.id_objeto || "");
    setFechaInicio(reserva.fecha_inicio?.slice(0, 10));
    setFechaFin(reserva.fecha_fin?.slice(0, 10));
    setHoraInicio(reserva.hora_inicio || "");
    setHoraFin(reserva.hora_fin || "");
    setHuespedes(reserva.huespedes || "");
    setComentarios(reserva.comentarios || "");
    setServiciosExtrasSeleccionados([]);
    setShowForm(true);
  };

  const handleEliminarReserva = async (id) => {
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

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/reservas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setReservas((prev) => prev.filter((r) => r.id !== id));
        Swal.fire("¡Eliminado!", "Reserva eliminada", "success");
      } else {
        Swal.fire("Error", "Error al eliminar la reserva", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const handleConfirmarPago = (reservaId) => {
    navigate(`/dashboard/crear-factura/${reservaId}`);
  };

  const handleCambiarEstado = async (reservaId, nuevoEstado) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        const reservaActualizada = await response.json();
        setReservas((prev) =>
          prev.map((r) => (r.id === reservaId ? reservaActualizada : r))
        );
        Swal.fire("¡Éxito!", `Reserva ${nuevoEstado}`, "success");
      }
    } catch (error) {
      Swal.fire("Error", "Error al cambiar estado", "error");
    }
  };

  // Filter and sort logic
  const filteredReservas = reservas
    .filter(reserva => {
      const cliente = clientes.find(c => c.id === reserva.cliente_id);
      const clienteNombre = cliente ? cliente.nombre.toLowerCase() : "";
      
      const matchesSearch = clienteNombre.includes(searchTerm.toLowerCase()) ||
                          reserva.tipo_reserva.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "todos" || reserva.estado === filterStatus;
      const matchesType = filterType === "todos" || reserva.tipo_reserva === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy.includes("fecha")) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "pendiente": return <FaHourglassHalf className="status-icon pending" />;
      case "confirmada":
      case "confirmado": return <FaCheckCircle className="status-icon confirmed" />;
      case "cancelada":
      case "cancelado": return <FaTimes className="status-icon cancelled" />;
      default: return <FaHourglassHalf className="status-icon" />;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "pendiente": return "#f39c12";
      case "confirmada":
      case "confirmado": return "#27ae60";
      case "cancelada":
      case "cancelado": return "#e74c3c";
      default: return "#95a5a6";
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "habitacion": return <FaBed />;
      case "mesa": return <FaUtensils />;
      case "salon": return <FaChair />;
      default: return <FaCalendarAlt />;
    }
  };

  const getObjectName = (reserva) => {
    if (reserva.tipo_reserva === "habitacion") {
      const habitacion = habitaciones.find(h => h.id === reserva.id_objeto);
      return habitacion ? `Habitación ${habitacion.numero}` : `Habitación ID ${reserva.id_objeto}`;
    } else if (reserva.tipo_reserva === "mesa") {
      const mesa = mesas.find(m => m.id === reserva.id_objeto);
      return mesa ? `Mesa ${mesa.numero}` : `Mesa ID ${reserva.id_objeto}`;
    } else if (reserva.tipo_reserva === "salon") {
      const salon = salones.find(s => s.id === reserva.id_objeto);
      return salon ? salon.nombre : `Salón ID ${reserva.id_objeto}`;
    }
    return "N/A";
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="stat-card-reservas" style={{ borderColor: color }}>
      <div className="stat-icon-reservas" style={{ color }}>
        <Icon />
      </div>
      <div className="stat-content-reservas">
        <div className="stat-value-reservas">{value}</div>
        <div className="stat-title-reservas">{title}</div>
        {subtitle && <div className="stat-subtitle-reservas">{subtitle}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="modern-reservas">
      {/* Header */}
      <div className="reservas-header">
        <div className="header-content">
          <div className="header-title">
            <FaCalendarAlt className="title-icon" />
            <div>
              <h1>Gestión de Reservas</h1>
              <p>Administra todas las reservas del hotel</p>
            </div>
          </div>
          <button 
            className="btn-primary"
            onClick={() => { limpiarFormulario(); setShowForm(!showForm); }}
          >
            <FaPlus />
            {showForm ? "Cancelar" : "Nueva Reserva"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-reservas">
        <StatCard
          icon={FaCalendarAlt}
          title="Total Reservas"
          value={stats.total}
          color="#3498db"
        />
        <StatCard
          icon={FaHourglassHalf}
          title="Pendientes"
          value={stats.pendientes}
          subtitle={`${stats.total ? Math.round((stats.pendientes / stats.total) * 100) : 0}%`}
          color="#f39c12"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Confirmadas"
          value={stats.confirmadas}
          subtitle={`${stats.total ? Math.round((stats.confirmadas / stats.total) * 100) : 0}%`}
          color="#27ae60"
        />
        <StatCard
          icon={FaMoneyBillWave}
          title="Ingresos Est."
          value={`$${stats.ingresosTotales.toLocaleString()}`}
          subtitle="Por reservas confirmadas"
          color="#9b59b6"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content-reserva" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {reservaEditando ? <FaEdit /> : <FaPlus />}
                {reservaEditando ? "Editar Reserva" : "Nueva Reserva"}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modern-form-reserva">
              <div className="form-section">
                <h4><FaUser /> Información del Cliente</h4>
                
                <div className="form-group">
                  <label>Buscar Cliente</label>
                  <div className="search-input">
                    <FaSearch className="input-icon" />
                    <input
                      type="text"
                      placeholder="Escribe para buscar cliente..."
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cliente *</label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccione Cliente --</option>
                    {clientesFiltrados.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} - {c.telefono || 'Sin teléfono'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4><FaMapMarkerAlt /> Información de la Reserva</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Reserva *</label>
                    <select
                      value={tipoReserva}
                      onChange={(e) => {
                        setTipoReserva(e.target.value);
                        setIdObjeto("");
                      }}
                      required
                    >
                      <option value="">-- Seleccione --</option>
                      <option value="habitacion">Habitación</option>
                      <option value="mesa">Mesa</option>
                      <option value="salon">Salón</option>
                    </select>
                  </div>
                  
                  {tipoReserva && (
                    <div className="form-group">
                      <label>
                        {tipoReserva === "habitacion" ? "Habitación" : 
                         tipoReserva === "mesa" ? "Mesa" : "Salón"} *
                      </label>
                      <select
                        value={idObjeto}
                        onChange={(e) => setIdObjeto(e.target.value)}
                        required
                      >
                        <option value="">-- Seleccione {tipoReserva} --</option>
                        {tipoReserva === "habitacion" && habitaciones.map((h) => (
                          <option key={h.id} value={h.id}>
                            Habitación {h.numero} - {h.tipo} (${h.precio_noche}/noche)
                          </option>
                        ))}
                        {tipoReserva === "mesa" && mesas.map((m) => (
                          <option key={m.id} value={m.id}>
                            Mesa {m.numero} - {m.capacidad} personas
                          </option>
                        ))}
                        {tipoReserva === "salon" && salones.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre} - {s.capacidad} personas (${s.precio_alquiler}/evento)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha Inicio *</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin *</label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      required
                      min={fechaInicio || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hora Inicio</label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora Fin</label>
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Número de Huéspedes</label>
                    <input
                      type="number"
                      value={huespedes}
                      onChange={(e) => setHuespedes(e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Comentarios Adicionales</label>
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Solicitudes especiales, alergias, etc."
                    rows="3"
                  />
                </div>
              </div>

              {!reservaEditando && serviciosExtras.length > 0 && (
                <div className="form-section">
                  <h4><FaServicestack /> Servicios Extras</h4>
                  <div className="servicios-grid">
                    {serviciosExtras.map((servicio) => {
                      const seleccionado = serviciosExtrasSeleccionados.find(
                        (s) => s.servicio_extra_id === servicio.id
                      );
                      return (
                        <div key={servicio.id} className="servicio-item">
                          <label className="servicio-checkbox">
                            <input
                              type="checkbox"
                              checked={!!seleccionado}
                              onChange={() => toggleServicioExtra(servicio)}
                            />
                            <span className="checkmark"></span>
                            <div className="servicio-info">
                              <span className="servicio-nombre">{servicio.nombre}</span>
                              <span className="servicio-precio">${servicio.precio}</span>
                            </div>
                          </label>
                          {seleccionado && (
                            <input
                              type="number"
                              min="1"
                              value={seleccionado.cantidad}
                              onChange={(e) => cambiarCantidad(servicio.id, e.target.value)}
                              className="cantidad-input"
                              placeholder="Cant."
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaSave />
                  {reservaEditando ? "Actualizar" : "Crear"} Reserva
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
            placeholder="Buscar por cliente o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <FaFilter />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelada">Cancelada</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="todos">Todos los tipos</option>
              <option value="habitacion">Habitaciones</option>
              <option value="mesa">Mesas</option>
              <option value="salon">Salones</option>
            </select>
          </div>
          
          <div className="filter-group">
            <FaSortAmountDown />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="fecha_inicio">Ordenar por fecha inicio</option>
              <option value="fecha_fin">Ordenar por fecha fin</option>
              <option value="estado">Ordenar por estado</option>
              <option value="tipo_reserva">Ordenar por tipo</option>
            </select>
          </div>

          <button 
            className={`view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <FaCalendarAlt />
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
      {filteredReservas.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <h3>No hay reservas</h3>
          <p>
            {searchTerm || filterStatus !== "todos" || filterType !== "todos"
              ? "No se encontraron reservas con los filtros aplicados" 
              : "Comienza creando tu primera reserva"}
          </p>
          {!searchTerm && filterStatus === "todos" && filterType === "todos" && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus />
              Crear Primera Reserva
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="reservas-grid">
          {filteredReservas.map((reserva) => {
            const cliente = clientes.find(c => c.id === reserva.cliente_id);
            const diasReserva = Math.ceil((new Date(reserva.fecha_fin) - new Date(reserva.fecha_inicio)) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={reserva.id} className={`reserva-card ${reserva.estado}`}>
                <div className="card-header">
                  <div className="reserva-type">
                    {getTipoIcon(reserva.tipo_reserva)}
                    <div>
                      <h4>{getObjectName(reserva)}</h4>
                      <span className="tipo-badge">{reserva.tipo_reserva}</span>
                    </div>
                  </div>
                  <div className="reserva-status" style={{ color: getStatusColor(reserva.estado) }}>
                    {getStatusIcon(reserva.estado)}
                    <span className="status-text">{reserva.estado}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="cliente-info">
                    <div className="info-item">
                      <FaUser />
                      <span>{cliente ? cliente.nombre : `Cliente ID ${reserva.cliente_id}`}</span>
                    </div>
                    {cliente && cliente.telefono && (
                      <div className="info-item">
                        <FaPhone />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente && cliente.email && (
                      <div className="info-item">
                        <FaEnvelope />
                        <span>{cliente.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="reserva-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <div>
                        <strong>Fechas:</strong>
                        <p>{new Date(reserva.fecha_inicio).toLocaleDateString()} - {new Date(reserva.fecha_fin).toLocaleDateString()}</p>
                        <span className="duration">{diasReserva} día{diasReserva > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {(reserva.hora_inicio || reserva.hora_fin) && (
                      <div className="detail-item">
                        <FaClock />
                        <div>
                          <strong>Horario:</strong>
                          <p>{reserva.hora_inicio || '00:00'} - {reserva.hora_fin || '23:59'}</p>
                        </div>
                      </div>
                    )}

                    {reserva.huespedes && (
                      <div className="detail-item">
                        <FaUsers />
                        <div>
                          <strong>Huéspedes:</strong>
                          <p>{reserva.huespedes} persona{reserva.huespedes > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    )}

                    {reserva.comentarios && (
                      <div className="detail-item comentarios">
                        <strong>Comentarios:</strong>
                        <p>{reserva.comentarios}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-actions">
                  {reserva.estado === "pendiente" && (
                    <>
                      <button 
                        className="btn-confirm"
                        onClick={() => handleCambiarEstado(reserva.id, "confirmada")}
                        title="Confirmar reserva"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className="btn-pay"
                        onClick={() => handleConfirmarPago(reserva.id)}
                        title="Procesar pago"
                      >
                        <FaCreditCard />
                      </button>
                    </>
                  )}
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditar(reserva)}
                    title="Editar reserva"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleEliminarReserva(reserva.id)}
                    title="Eliminar reserva"
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
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Recurso</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservas.map((reserva) => {
                const cliente = clientes.find(c => c.id === reserva.cliente_id);
                
                return (
                  <tr key={reserva.id}>
                    <td>
                      <div className="table-cliente">
                        <FaUser />
                        <div>
                          <strong>{cliente ? cliente.nombre : `ID ${reserva.cliente_id}`}</strong>
                          {cliente && cliente.telefono && <p>{cliente.telefono}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-tipo">
                        {getTipoIcon(reserva.tipo_reserva)}
                        <span>{reserva.tipo_reserva}</span>
                      </div>
                    </td>
                    <td>{getObjectName(reserva)}</td>
                    <td>{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                    <td>{new Date(reserva.fecha_fin).toLocaleDateString()}</td>
                    <td>
                      <div className="table-status" style={{ color: getStatusColor(reserva.estado) }}>
                        {getStatusIcon(reserva.estado)}
                        <span>{reserva.estado}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        {reserva.estado === "pendiente" && (
                          <>
                            <button 
                              className="btn-confirm-small"
                              onClick={() => handleCambiarEstado(reserva.id, "confirmada")}
                              title="Confirmar"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="btn-pay-small"
                              onClick={() => handleConfirmarPago(reserva.id)}
                              title="Pagar"
                            >
                              <FaCreditCard />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn-edit-small"
                          onClick={() => handleEditar(reserva)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-delete-small"
                          onClick={() => handleEliminarReserva(reserva.id)}
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
