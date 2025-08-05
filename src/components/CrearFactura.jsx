import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8000/api";

export default function CrearFactura() {
  const { id } = useParams();
  const { user } = useAuthContext();

  const [reserva, setReserva] = useState(null);
  const [precioBase, setPrecioBase] = useState(0);
  const [serviciosExtras, setServiciosExtras] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Obtener reserva
        const resReserva = await fetch(`${API_BASE_URL}/reservas/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!resReserva.ok) throw new Error("No se pudo cargar la reserva");
        const dataReserva = await resReserva.json();
        setReserva(dataReserva);

        // Obtener servicios extras
        const resServicios = await fetch(`${API_BASE_URL}/reservas/${id}/servicios`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!resServicios.ok) throw new Error("No se pudo cargar servicios extras");
        const dataServicios = await resServicios.json();
        setServiciosExtras(dataServicios);

        // Obtener precio base según tipo de reserva
        let urlPrecio = "";
        if (dataReserva.tipo_reserva === "habitacion") {
          urlPrecio = `${API_BASE_URL}/habitaciones/${dataReserva.id_objeto}`; // fijate que la tabla sea habitacions
        } else if (dataReserva.tipo_reserva === "mesa") {
          urlPrecio = `${API_BASE_URL}/mesas/${dataReserva.id_objeto}`;
        } else if (dataReserva.tipo_reserva === "salon") {
          urlPrecio = `${API_BASE_URL}/salones/${dataReserva.id_objeto}`;
        }

        if (!urlPrecio) {
          setPrecioBase(0);
          return;
        }

        const resPrecio = await fetch(urlPrecio, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!resPrecio.ok) throw new Error("No se pudo obtener el precio del objeto reservado");
        const dataPrecio = await resPrecio.json();

        let precioUnitario = 0;
        if (dataReserva.tipo_reserva === "habitacion") {
          precioUnitario = parseFloat(dataPrecio.precio_noche) || 0;
        } else if (dataReserva.tipo_reserva === "mesa") {
          precioUnitario = parseFloat(dataPrecio.precio_unitario) || 0;
        } else if (dataReserva.tipo_reserva === "salon") {
          precioUnitario = parseFloat(dataPrecio.precio_alquiler) || 0;
        }

        const inicio = new Date(dataReserva.fecha_inicio);
        const fin = new Date(dataReserva.fecha_fin);
        const diffMs = fin - inicio;
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;

        const precioCalculado = precioUnitario * diffDias;
        setPrecioBase(precioCalculado);
      } catch (error) {
        console.error(error);
        setMensaje(error.message);
      }
    };

    fetchDatos();
  }, [id]);

  const subtotalServicios = serviciosExtras.reduce(
    (total, s) => total + (parseFloat(s.precio_total) || 0),
    0
  );

  const subtotal = precioBase + subtotalServicios;
  const impuesto = subtotal * 0.12;
  const total = subtotal + impuesto - descuento;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    if (!user?.id) {
      setMensaje("Usuario no autenticado");
      setCargando(false);
      return;
    }
    if (!reserva?.id) {
      setMensaje("Reserva inválida o no cargada");
      setCargando(false);
      return;
    }
    if (total <= 0) {
      setMensaje("El total no puede ser cero. Verifique precios y descuentos.");
      setCargando(false);
      return;
    }

    const factura = {
      cliente_id: reserva.cliente_id,
      usuario_id: user.id,
      reservas: [
        {
          tipo_reserva: reserva.tipo_reserva,
          id_objeto: reserva.id_objeto,
          fecha_inicio: reserva.fecha_inicio,
          fecha_fin: reserva.fecha_fin,
        },
      ],
      servicios_extra: serviciosExtras.map((s) => ({
        servicio_extra_id: s.servicio_extra_id ?? s.servicio_id,
        cantidad: s.cantidad,
      })),
      descuento: Number(descuento),
    };

    console.log("JSON enviado al backend:", JSON.stringify(factura, null, 2));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/facturar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(factura),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (!res.ok) {
        setMensaje(data.message || "Error al crear factura");
      } else {
        setMensaje("Factura creada con éxito");
      }
    } catch (error) {
      console.error("Error de red o servidor:", error);
      setMensaje("Error de red o servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Crear Factura</h2>

      {mensaje && <p style={{ color: mensaje.includes("Error") ? "red" : "green" }}>{mensaje}</p>}

      {reserva ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Cliente ID:</label>
            <input type="text" value={reserva.cliente_id} readOnly />
          </div>
          <div>
            <label>Usuario ID:</label>
            <input type="text" value={user?.id || ""} readOnly />
          </div>
          <div>
            <label>Precio base reserva:</label>
            <input type="text" value={precioBase.toFixed(2)} readOnly />
          </div>
          <div>
            <label>Subtotal servicios extras:</label>
            <input type="text" value={subtotalServicios.toFixed(2)} readOnly />
          </div>
          <div>
            <label>Subtotal:</label>
            <input type="text" value={subtotal.toFixed(2)} readOnly />
          </div>
          <div>
            <label>Impuesto (12%):</label>
            <input type="text" value={impuesto.toFixed(2)} readOnly />
          </div>
          <div>
            <label>Descuento:</label>
            <input
              type="number"
              value={descuento}
              min="0"
              step="0.01"
              onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Total:</label>
            <input type="text" value={total.toFixed(2)} readOnly />
          </div>

          <h3>Servicios Extras</h3>
          <ul>
            {serviciosExtras.length === 0 && <li>No hay servicios extra</li>}
            {serviciosExtras.map((s, i) => (
              <li key={i}>
                Servicio ID: {s.servicio_extra_id ?? s.servicio_id}, Cantidad: {s.cantidad}, Total: ${parseFloat(s.precio_total).toFixed(2)}
              </li>
            ))}
          </ul>

          <button type="submit" disabled={cargando}>
            {cargando ? "Creando factura..." : "Crear Factura"}
          </button>
        </form>
      ) : (
        <p>Cargando reserva...</p>
      )}
    </div>
  );
}
