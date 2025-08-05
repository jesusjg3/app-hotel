import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import { 
  FaFileInvoiceDollar, 
  FaUser, 
  FaCalendarAlt, 
  FaBed,
  FaUtensils,
  FaChair,
  FaDollarSign,
  FaPercent,
  FaCalculator,
  FaSave,
  FaPrint,
  FaArrowLeft,
  FaServicestack,
  FaReceipt,
  FaCreditCard,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaClock,
  FaUsers,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";
import "./ModernFactura.css";

const API_BASE_URL = "http://localhost:8000/api";
const API_BASE_URL_REMOTE = "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api";

export default function CrearFactura() {
  const { reservaId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Main data states
  const [reserva, setReserva] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [recursoReservado, setRecursoReservado] = useState(null);
  const [serviciosExtras, setServiciosExtras] = useState([]);
  
  // Calculation states
  const [precioBase, setPrecioBase] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [tipoDescuento, setTipoDescuento] = useState("fijo"); // 'fijo' or 'porcentaje'
  const [tasaImpuesto, setTasaImpuesto] = useState(12); // 12% default
  const [comentarios, setComentarios] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [facturaCreada, setFacturaCreada] = useState(null);

  useEffect(() => {
    if (reservaId) {
      fetchDatosCompletos();
    } else {
      setError("ID de reserva no válido");
      setLoading(false);
    }
  }, [reservaId]);

  const fetchDatosCompletos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token de autenticación");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Obtener reserva
      const resReserva = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!resReserva.ok) {
        throw new Error(`Error ${resReserva.status}: No se pudo cargar la reserva`);
      }

      const dataReserva = await resReserva.json();
      setReserva(dataReserva);

      // 2. Obtener cliente
      if (dataReserva.cliente_id) {
        try {
          const resCliente = await fetch(`${API_BASE_URL}/clientes/${dataReserva.cliente_id}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
          if (resCliente.ok) {
            const dataCliente = await resCliente.json();
            setCliente(dataCliente);
          }
        } catch (error) {
          console.warn("No se pudo cargar información del cliente:", error);
        }
      }

      // 3. Obtener servicios extras de la reserva
      try {
        const resServicios = await fetch(`${API_BASE_URL}/reservas/${reservaId}/servicios`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (resServicios.ok) {
          const dataServicios = await resServicios.json();
          setServiciosExtras(Array.isArray(dataServicios) ? dataServicios : []);
        }
      } catch (error) {
        console.warn("No se pudieron cargar servicios extras:", error);
        setServiciosExtras([]);
      }

      // 4. Obtener información del recurso reservado (habitación, mesa o salón)
      await fetchRecursoInfo(dataReserva, token);

    } catch (error) {
      console.error("Error cargando datos:", error);
      setError(error.message || "Error cargando información de la reserva");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecursoInfo = async (reservaData, token) => {
    try {
      let urlRecurso = "";
      let precioCampo = "";

      if (reservaData.tipo_reserva === "habitacion") {
        urlRecurso = `${API_BASE_URL}/habitaciones/${reservaData.id_objeto}`;
        precioCampo = "precio_noche";
      } else if (reservaData.tipo_reserva === "mesa") {
        urlRecurso = `${API_BASE_URL}/mesas/${reservaData.id_objeto}`;
        precioCampo = "precio_unitario";
      } else if (reservaData.tipo_reserva === "salon") {
        urlRecurso = `${API_BASE_URL}/salones/${reservaData.id_objeto}`;
        precioCampo = "precio_alquiler";
      }

      if (urlRecurso) {
        const resRecurso = await fetch(urlRecurso, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        if (resRecurso.ok) {
          const dataRecurso = await resRecurso.json();
          setRecursoReservado(dataRecurso);
          
          // Calcular precio base
          const precioUnitario = parseFloat(dataRecurso[precioCampo]) || 0;
          const diasReserva = calcularDiasReserva(reservaData);
          const precioCalculado = precioUnitario * diasReserva;
          setPrecioBase(precioCalculado);
        }
      }
    } catch (error) {
      console.warn("Error cargando información del recurso:", error);
    }
  };

  const calcularDiasReserva = (reservaData) => {
    if (!reservaData.fecha_inicio || !reservaData.fecha_fin) return 1;
    
    const inicio = new Date(reservaData.fecha_inicio);
    const fin = new Date(reservaData.fecha_fin);
    const diffMs = fin - inicio;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDias > 0 ? diffDias : 1;
  };

  // Cálculos de facturación
  const subtotalServicios = serviciosExtras.reduce(
    (total, servicio) => total + (parseFloat(servicio.precio_total) || 0),
    0
  );

  const subtotal = precioBase + subtotalServicios;
  
  const montoDescuento = tipoDescuento === "porcentaje" 
    ? (subtotal * descuento) / 100 
    : descuento;
  
  const subtotalConDescuento = subtotal - montoDescuento;
  const impuesto = (subtotalConDescuento * tasaImpuesto) / 100;
  const total = subtotalConDescuento + impuesto;

  const handleCrearFactura = async (e) => {
    e.preventDefault();
    
    if (!reserva || !user) {
      setError("Datos incompletos para crear la factura");
      return;
    }

    if (total <= 0) {
      setError("El total de la factura debe ser mayor a cero");
      return;
    }

    const result = await Swal.fire({
      title: "Confirmar Facturación",
      html: `
        <div style="text-align: left;">
          <p><strong>Cliente:</strong> ${cliente?.nombre || 'N/A'}</p>
          <p><strong>Reserva:</strong> ${getRecursoNombre()} - ${reserva.tipo_reserva}</p>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <p><strong>Método de pago:</strong> ${metodoPago}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#27ae60",
      cancelButtonColor: "#e74c3c",
      confirmButtonText: "Sí, crear factura",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setProcesando(true);
    setError("");

    try {
      const facturaData = {
        cliente_id: reserva.cliente_id,
        usuario_id: user.id,
        reserva_id: reserva.id,
        tipo_reserva: reserva.tipo_reserva,
        id_objeto: reserva.id_objeto,
        fecha_inicio: reserva.fecha_inicio,
        fecha_fin: reserva.fecha_fin,
        precio_base: precioBase,
        servicios_extra: serviciosExtras.map(s => ({
          servicio_extra_id: s.servicio_extra_id || s.servicio_id,
          cantidad: s.cantidad,
          precio_total: s.precio_total
        })),
        subtotal: subtotal,
        descuento: montoDescuento,
        tipo_descuento: tipoDescuento,
        impuesto: impuesto,
        tasa_impuesto: tasaImpuesto,
        total: total,
        metodo_pago: metodoPago,
        comentarios: comentarios,
        estado: "pagada"
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/facturar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(facturaData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al crear la factura");
      }

      setFacturaCreada(responseData);
      
      // Update reservation status to confirmed/paid
      await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "confirmada" }),
      });

      await Swal.fire({
        title: "¡Factura Creada!",
        text: `Factura #${responseData.id} creada exitosamente`,
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error creando factura:", error);
      setError(error.message || "Error al crear la factura");
      
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo crear la factura",
        icon: "error",
      });
    } finally {
      setProcesando(false);
    }
  };

  const getRecursoNombre = () => {
    if (!recursoReservado || !reserva) return "N/A";
    
    if (reserva.tipo_reserva === "habitacion") {
      return `Habitación ${recursoReservado.numero}`;
    } else if (reserva.tipo_reserva === "mesa") {
      return `Mesa ${recursoReservado.numero}`;
    } else if (reserva.tipo_reserva === "salon") {
      return recursoReservado.nombre;
    }
    return "Recurso desconocido";
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "habitacion": return <FaBed />;
      case "mesa": return <FaUtensils />;
      case "salon": return <FaChair />;
      default: return <FaReceipt />;
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleVolver = () => {
    navigate("/dashboard/reservas");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información de la reserva...</p>
      </div>
    );
  }

  if (error && !reserva) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <h3>Error al cargar la reserva</h3>
        <p>{error}</p>
        <button className="btn-secondary" onClick={handleVolver}>
          <FaArrowLeft />
          Volver a Reservas
        </button>
      </div>
    );
  }

  return (
    <div className="modern-factura">
      {/* Header */}
      <div className="factura-header">
        <div className="header-content">
          <div className="header-title">
            <FaFileInvoiceDollar className="title-icon" />
            <div>
              <h1>Crear Factura</h1>
              <p>Generar factura para la reserva</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleVolver}>
              <FaArrowLeft />
              Volver
            </button>
            {facturaCreada && (
              <button className="btn-print" onClick={handleImprimir}>
                <FaPrint />
                Imprimir
              </button>
            )}
          </div>
        </div>
      </div>

      {facturaCreada ? (
        // Factura creada exitosamente
        <div className="factura-completada">
          <div className="success-message">
            <FaCheck className="success-icon" />
            <h2>¡Factura Creada Exitosamente!</h2>
            <p>Factura #{facturaCreada.id}</p>
          </div>

          <div className="factura-preview">
            <div className="preview-header">
              <h3>Resumen de la Factura</h3>
            </div>
            <div className="preview-content">
              <div className="preview-row">
                <span>Cliente:</span>
                <span>{cliente?.nombre || 'N/A'}</span>
              </div>
              <div className="preview-row">
                <span>Reserva:</span>
                <span>{getRecursoNombre()}</span>
              </div>
              <div className="preview-row">
                <span>Período:</span>
                <span>
                  {reserva?.fecha_inicio && new Date(reserva.fecha_inicio).toLocaleDateString()} - 
                  {reserva?.fecha_fin && new Date(reserva.fecha_fin).toLocaleDateString()}
                </span>
              </div>
              <div className="preview-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {montoDescuento > 0 && (
                <div className="preview-row">
                  <span>Descuento:</span>
                  <span>-${montoDescuento.toFixed(2)}</span>
                </div>
              )}
              <div className="preview-row">
                <span>Impuesto ({tasaImpuesto}%):</span>
                <span>${impuesto.toFixed(2)}</span>
              </div>
              <div className="preview-row total-row">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Formulario de creación de factura
        <div className="factura-form-container">
          {/* Información de la Reserva */}
          <div className="info-section">
            <h3>
              <FaCalendarAlt />
              Información de la Reserva
            </h3>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-header">
                  {getTipoIcon(reserva?.tipo_reserva)}
                  <h4>{getRecursoNombre()}</h4>
                </div>
                <div className="info-details">
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>
                      {reserva?.fecha_inicio && new Date(reserva.fecha_inicio).toLocaleDateString()} - 
                      {reserva?.fecha_fin && new Date(reserva.fecha_fin).toLocaleDateString()}
                    </span>
                  </div>
                  {reserva?.hora_inicio && (
                    <div className="detail-item">
                      <FaClock />
                      <span>{reserva.hora_inicio} - {reserva.hora_fin || 'N/A'}</span>
                    </div>
                  )}
                  {reserva?.huespedes && (
                    <div className="detail-item">
                      <FaUsers />
                      <span>{reserva.huespedes} huéspedes</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="duration-badge">
                      {calcularDiasReserva(reserva)} día{calcularDiasReserva(reserva) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              {cliente && (
                <div className="info-card">
                  <div className="info-header">
                    <FaUser />
                    <h4>Cliente</h4>
                  </div>
                  <div className="info-details">
                    <div className="detail-item">
                      <FaIdCard />
                      <span>{cliente.nombre}</span>
                    </div>
                    {cliente.telefono && (
                      <div className="detail-item">
                        <FaPhone />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.email && (
                      <div className="detail-item">
                        <FaEnvelope />
                        <span>{cliente.email}</span>
                      </div>
                    )}
                    {cliente.direccion && (
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{cliente.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desglose de Costos */}
          <div className="costos-section">
            <h3>
              <FaCalculator />
              Desglose de Costos
            </h3>

            <div className="costos-grid">
              {/* Precio Base */}
              <div className="costo-item">
                <div className="costo-header">
                  <FaDollarSign />
                  <span>Precio Base</span>
                </div>
                <div className="costo-value">${precioBase.toFixed(2)}</div>
                <div className="costo-description">
                  {reserva?.tipo_reserva === "habitacion" && `${recursoReservado?.precio_noche || 0}/noche × ${calcularDiasReserva(reserva)} días`}
                  {reserva?.tipo_reserva === "mesa" && `${recursoReservado?.precio_unitario || 0}/uso × ${calcularDiasReserva(reserva)} días`}
                  {reserva?.tipo_reserva === "salon" && `${recursoReservado?.precio_alquiler || 0}/evento × ${calcularDiasReserva(reserva)} días`}
                </div>
              </div>

              {/* Servicios Extras */}
              <div className="costo-item">
                <div className="costo-header">
                  <FaServicestack />
                  <span>Servicios Extras</span>
                </div>
                <div className="costo-value">${subtotalServicios.toFixed(2)}</div>
                <div className="costo-description">
                  {serviciosExtras.length} servicio{serviciosExtras.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Subtotal */}
              <div className="costo-item subtotal">
                <div className="costo-header">
                  <FaReceipt />
                  <span>Subtotal</span>
                </div>
                <div className="costo-value">${subtotal.toFixed(2)}</div>
              </div>
            </div>

            {/* Servicios Extras Detail */}
            {serviciosExtras.length > 0 && (
              <div className="servicios-detail">
                <h4>Detalle de Servicios Extras:</h4>
                <div className="servicios-list">
                  {serviciosExtras.map((servicio, index) => (
                    <div key={index} className="servicio-item">
                      <span className="servicio-nombre">
                        Servicio ID: {servicio.servicio_extra_id || servicio.servicio_id}
                      </span>
                      <span className="servicio-cantidad">Cantidad: {servicio.cantidad}</span>
                      <span className="servicio-precio">${parseFloat(servicio.precio_total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formulario de Facturación */}
          <form onSubmit={handleCrearFactura} className="factura-form">
            <div className="form-section">
              <h3>
                <FaPercent />
                Ajustes de Facturación
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Descuento</label>
                  <select
                    value={tipoDescuento}
                    onChange={(e) => setTipoDescuento(e.target.value)}
                  >
                    <option value="fijo">Descuento Fijo ($)</option>
                    <option value="porcentaje">Descuento Porcentaje (%)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Descuento {tipoDescuento === "porcentaje" ? "(%)" : "($)"}
                  </label>
                  <input
                    type="number"
                    value={descuento}
                    onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                    min="0"
                    max={tipoDescuento === "porcentaje" ? "100" : subtotal}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tasa de Impuesto (%)</label>
                  <input
                    type="number"
                    value={tasaImpuesto}
                    onChange={(e) => setTasaImpuesto(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Comentarios Adicionales</label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comentarios sobre la factura..."
                  rows="3"
                />
              </div>
            </div>

            {/* Resumen Final */}
            <div className="resumen-final">
              <h3>Resumen Final</h3>
              <div className="resumen-grid">
                <div className="resumen-item">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {montoDescuento > 0 && (
                  <div className="resumen-item descuento">
                    <span>
                      Descuento {tipoDescuento === "porcentaje" ? `(${descuento}%)` : ""}:
                    </span>
                    <span>-${montoDescuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="resumen-item">
                  <span>Impuesto ({tasaImpuesto}%):</span>
                  <span>${impuesto.toFixed(2)}</span>
                </div>
                <div className="resumen-item total">
                  <span>Total a Pagar:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleVolver}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={procesando || total <= 0}
              >
                {procesando ? (
                  <>
                    <div className="spinner-small"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Crear Factura
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
