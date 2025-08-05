import { useState } from "react";
import Swal from "sweetalert2";
import "./Sidebar.css";

const API_BASE_URL = "http://localhost:8000/api";

export default function CrearCliente() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");

  const validarNombre = (nombre) => {
    // Al menos dos palabras con letras (nombre y apellido)
    return /^\s*([A-Za-zÁÉÍÓÚáéíóúÑñ]+)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]+)(\s*[A-Za-zÁÉÍÓÚáéíóúÑñ]*)*$/.test(nombre.trim());
  };

  const validarCedula = (cedula) => {
    // Solo 10 dígitos numéricos
    return /^[0-9]{10}$/.test(cedula);
  };

  const validarTelefono = (telefono) => {
    // Solo 10 dígitos numéricos
    return /^[0-9]{10}$/.test(telefono);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarNombre(nombre.trim())) {
      return Swal.fire({
        icon: "warning",
        title: "Nombre inválido",
        text: "Ingrese nombre y apellido, separados por espacio.",
      });
    }

    if (!validarCedula(cedula.trim())) {
      return Swal.fire({
        icon: "warning",
        title: "Cédula inválida",
        text: "La cédula debe contener exactamente 10 dígitos numéricos.",
      });
    }

    if (!validarTelefono(telefono.trim())) {
      return Swal.fire({
        icon: "warning",
        title: "Teléfono inválido",
        text: "El teléfono debe contener exactamente 10 dígitos numéricos.",
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ nombre: nombre.trim(), cedula: cedula.trim(), telefono: telefono.trim() }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Cliente registrado!",
          text: "El cliente ha sido registrado con éxito.",
          timer: 2000,
          showConfirmButton: false,
        });

        setNombre("");
        setCedula("");
        setTelefono("");
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error al registrar cliente",
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

  return (
    <div className="hotel-panel">
      <div className="panel-arrow">
        <i className="arrow-icon"></i>
      </div>
      <div className="panel-content">
        <h2>Registrar Cliente</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Cédula:</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              maxLength={10}
              required
            />
          </div>
          <div>
            <label>Teléfono:</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              maxLength={10}
              required
            />
          </div>
          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
}
