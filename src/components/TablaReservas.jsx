import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./TablaReservas.css";

const API_BASE_URL = "http://localhost:8000/api";

export default function CrearReserva() {
  // Estados para reserva
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
  const [mensaje, setMensaje] = useState("");
  const [reservas, setReservas] = useState([]);
  const [serviciosExtras, setServiciosExtras] = useState([]);
  const [serviciosExtrasSeleccionados, setServiciosExtrasSeleccionados] = useState([]);
  const [reservaEditando, setReservaEditando] = useState(null);

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
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
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
        setMensaje("Error cargando datos iniciales");
      }
    };

    fetchData();
  }, []);

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
    setServiciosExtrasSeleccionados([]);
    setReservaEditando(null);
    setFiltroCliente("");
    setMensaje("");
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
    if (fechaFinDate < new Date(hoy.setHours(0, 0, 0, 0))) {
      return Swal.fire("Error", "La fecha de fin no puede ser anterior a hoy.", "error");
    }
    if (fechaFinDate < fechaInicioDate) {
      return Swal.fire("Error", "La fecha de fin no puede ser anterior a la fecha de inicio.", "error");
    }

    const conflicto = reservas.some((reserva) => {
      if (
        reserva.tipo_reserva === tipoReserva &&
        reserva.id_objeto === idObjeto &&
        reserva.id !== (reservaEditando ? reservaEditando.id : null)
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

      if (reservaEditando) {
        const res = await fetch(`${API_BASE_URL}/reservas/${reservaEditando.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cliente_id: clienteId,
            tipo_reserva: tipoReserva,
            id_objeto: idObjeto,
            fecha_inicio: formatearFechaISO(fechaInicio),
            fecha_fin: formatearFechaISO(fechaFin),
            estado: reservaEditando.estado,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          return Swal.fire("Error", err.message || "Error al actualizar reserva", "error");
        }

        const reservaActualizada = await res.json();
        setReservas((prev) =>
          prev.map((r) => (r.id === reservaActualizada.id ? reservaActualizada : r))
        );
        Swal.fire("¡Éxito!", "Reserva actualizada con éxito.", "success");
        limpiarFormulario();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reservas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo_reserva: tipoReserva,
          id_objeto: idObjeto,
          fecha_inicio: formatearFechaISO(fechaInicio),
          fecha_fin: formatearFechaISO(fechaFin),
          estado: "pendiente",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return Swal.fire("Error", errorData.message || "Error al crear la reserva", "error");
      }

      const nuevaReserva = await response.json();

      for (const servicio of serviciosExtrasSeleccionados) {
        const detalleResponse = await fetch(
          `${API_BASE_URL}/reservas/${nuevaReserva.id}/servicios`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reserva_id: nuevaReserva.id,
              servicio_extra_id: servicio.servicio_extra_id,
              cantidad: servicio.cantidad,
              precio_total: servicio.precio * servicio.cantidad,
            }),
          }
        );

        if (!detalleResponse.ok) {
          const errorDetalle = await detalleResponse.json();
          Swal.fire(
            "Advertencia",
            `Reserva creada, pero error al guardar detalle: ${errorDetalle.message || ""}`,
            "warning"
          );
          return;
        }
      }

      setReservas((prev) => [...prev, nuevaReserva]);
      Swal.fire("¡Éxito!", "Reserva creada con éxito.", "success");
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
    setMensaje("");
    setServiciosExtrasSeleccionados([]);
  };

  const handleEliminarReserva = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Estás seguro de eliminar esta reserva?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/reservas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setReservas((prev) => prev.filter((r) => r.id !== id));
        Swal.fire("¡Éxito!", "Reserva eliminada con éxito.", "success");
      } else {
        Swal.fire("Error", "Error al eliminar la reserva", "error");
      }
    } catch {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  const handleConfirmarPago = (reservaId) => {
    navigate(`/factura/${reservaId}`);
  };

  return (
    <div className="contenedor-reserva">
      <h2>{reservaEditando ? "Editar Reserva" : "Crear Reserva"}</h2>

      {mensaje && (
        <div className={`mensaje ${mensaje.startsWith("Error") ? "error" : "exito"}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario-reserva">
        <div className="form-group">
          <label>Buscar Cliente:</label>
          <input
            type="text"
            placeholder="Escribe para buscar cliente..."
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            style={{ marginBottom: "8px", padding: "6px", width: "100%" }}
          />
        </div>

        <div className="form-group">
          <label>Cliente:</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">-- Seleccione Cliente --</option>
            {clientesFiltrados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de Reserva:</label>
          <select
            value={tipoReserva}
            onChange={(e) => {
              setTipoReserva(e.target.value);
              setIdObjeto("");
              setMensaje("");
            }}
            required
          >
            <option value="">-- Seleccione --</option>
            <option value="habitacion">Habitación</option>
            <option value="mesa">Mesa</option>
            <option value="salon">Salón</option>
          </select>
        </div>

        {tipoReserva === "habitacion" && (
          <div className="form-group">
            <label>Habitación:</label>
            <select
              value={idObjeto}
              onChange={(e) => setIdObjeto(e.target.value)}
              required
            >
              <option value="">-- Seleccione Habitación --</option>
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.numero}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipoReserva === "mesa" && (
          <div className="form-group">
            <label>Mesa:</label>
            <select
              value={idObjeto}
              onChange={(e) => setIdObjeto(e.target.value)}
              required
            >
              <option value="">-- Seleccione Mesa --</option>
              {mesas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.numero}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipoReserva === "salon" && (
          <div className="form-group">
            <label>Salón:</label>
            <select
              value={idObjeto}
              onChange={(e) => setIdObjeto(e.target.value)}
              required
            >
              <option value="">-- Seleccione Salón --</option>
              {salones.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Servicios Extras (puedes seleccionar varios):</label>
          {serviciosExtras.length === 0 && <p>No hay servicios extra disponibles.</p>}
          {serviciosExtras.map((servicio) => {
            const seleccionado = serviciosExtrasSeleccionados.find(
              (s) => s.servicio_extra_id === servicio.id
            );
            return (
              <div key={servicio.id} className="servicio-extra-item">
                <label>
                  <input
                    type="checkbox"
                    checked={!!seleccionado}
                    onChange={() => toggleServicioExtra(servicio)}
                  />{" "}
                  {servicio.nombre} - ${servicio.precio}
                </label>
                {seleccionado && (
                  <input
                    type="number"
                    min="1"
                    value={seleccionado.cantidad}
                    onChange={(e) => cambiarCantidad(servicio.id, e.target.value)}
                    className="cantidad-servicio"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button type="submit" className={`btn-submit ${reservaEditando ? "actualizar" : "crear"}`}>
          {reservaEditando ? "Actualizar Reserva" : "Crear Reserva"}
        </button>
      </form>

      <hr className="separador" />

      <h3>Reservas creadas</h3>
      {reservas.length === 0 && <p>No hay reservas creadas aún.</p>}

      <table className="tabla-reservas">
        <thead>
          <tr>
            <th>Cliente ID</th>
            <th>Tipo</th>
            <th>ID Objeto</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((res) => (
            <tr key={res.id}>
              <td>{res.cliente_id}</td>
              <td>{res.tipo_reserva}</td>
              <td>
                {res.tipo_reserva === "habitacion" &&
                  habitaciones.find((h) => h.id === res.id_objeto)?.numero}
                {res.tipo_reserva === "mesa" &&
                  mesas.find((m) => m.id === res.id_objeto)?.numero}
                {res.tipo_reserva === "salon" &&
                  salones.find((s) => s.id === res.id_objeto)?.nombre}
              </td>
              <td>{res.fecha_inicio?.slice(0, 10)}</td>
              <td>{res.fecha_fin?.slice(0, 10)}</td>
              <td>{res.estado}</td>
              <td>
                {res.estado === "pendiente" && (
                  <button
                    onClick={() => handleConfirmarPago(res.id)}
                    className="btn-confirmar"
                  >
                    Confirmar Pago
                  </button>
                )}
                <button onClick={() => handleEditar(res)} className="btn-editar">
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarReserva(res.id)}
                  className="btn-eliminar"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
