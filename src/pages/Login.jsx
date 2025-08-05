// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext"; // Ajusta esta ruta según tu estructura
import "./Login.css";

const API_URL = "http://localhost:8000/api/login";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalMessage("");
    setShowModal(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setModalMessage(data.message || "Error de autenticación");
        setShowModal(true);
        return;
      }

      const data = await response.json();

      if (data.token && data.usuario) {
        // Guarda token y usuario (incluye rol) en contexto y localStorage
        login(data.token, data.usuario);

        setModalMessage("¡Login exitoso! Redirigiendo...");
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
          navigate("/dashboard");
        }, 2000);
      } else {
        setModalMessage("No se recibió token o usuario del servidor");
        setShowModal(true);
      }
    } catch (err) {
      setModalMessage("Error de red o servidor");
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="login-bg">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          <div className="form-group">
            <label>Correo:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Entrar</button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            {modalMessage.toLowerCase().includes("exitoso") ? (
              <div className="modal-icon success">✔️</div>
            ) : (
              <div className="modal-icon error">❌</div>
            )}
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Ok, entendido</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
