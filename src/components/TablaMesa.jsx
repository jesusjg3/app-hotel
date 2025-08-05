import React, { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api";

export default function CrearMesa() {
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState(1);
  const [estado, setEstado] = useState("disponible");
  const [mensaje, setMensaje] = useState("");

  const handleCrearMesa = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!numero.trim()) {
      setMensaje("El número de mesa es obligatorio");
      return;
    }
    if (capacidad < 1) {
      setMensaje("La capacidad debe ser al menos 1");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      };

      const response = await fetch(`${API_BASE_URL}/mesas`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          numero,
          capacidad,
          estado,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errores = Object.values(errorData.errors).flat().join(", ");
          setMensaje("Errores: " + errores);
        } else if (errorData.message) {
          setMensaje("Error: " + errorData.message);
        } else {
          setMensaje("Error al crear mesa");
        }
        return;
      }

      setMensaje("Mesa creada con éxito");
      setNumero("");
      setCapacidad(1);
      setEstado("disponible");
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Crear Mesa</h2>
      {mensaje && (
        <div
          style={{
            marginBottom: 10,
            color: mensaje.startsWith("Error") ? "red" : "green",
          }}
        >
          {mensaje}
        </div>
      )}
      <form onSubmit={handleCrearMesa}>
        <div style={{ marginBottom: 10 }}>
          <label>Número de mesa:</label>
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
            maxLength={10}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Capacidad:</label>
          <input
            type="number"
            value={capacidad}
            onChange={(e) => setCapacidad(Number(e.target.value))}
            required
            min={1}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Estado:</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            required
            style={{ width: "100%" }}
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Crear Mesa
        </button>
      </form>
    </div>
  );
}
