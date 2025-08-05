// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// Try different possible API URLs
const API_BASE_URLS = [
  "http://localhost:8000/api",
  "http://127.0.0.1:8000/api",
  "http://localhost:8080/api",
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking"); // checking, online, offline
  const navigate = useNavigate();

  const { login } = useAuthContext();

  // Test API connection and detect working endpoint
  React.useEffect(() => {
    const testConnection = async () => {
      let connectionFound = false;
      for (const baseUrl of API_BASE_URLS) {
        try {
          const response = await fetch(`${baseUrl}/user`, {
            method: "GET",
            headers: { "Accept": "application/json" },
            mode: "cors",
          });
          console.log(`✅ API test for ${baseUrl}:`, response.status);
          if (response.status !== 500) {
            setBackendStatus("online");
            connectionFound = true;
            break;
          }
        } catch (err) {
          console.warn(`❌ API test failed for ${baseUrl}:`, err.message);
        }
      }
      if (!connectionFound) {
        setBackendStatus("offline");
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalMessage("");
    setShowModal(false);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        mode: "cors",
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setModalMessage(data.message || data.error || "Error de autenticación");
        setShowModal(true);
        return;
      }

      const data = await response.json();

      if (data.token && data.usuario) {
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
      console.error("Fetch error:", err);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setModalMessage("🔌 No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8000");
      } else {
        setModalMessage(`Error de conexión: ${err.message}`);
      }
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #f0f4f8, #dbe9f1)",
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    padding: "20px",
  };

  const wrapperStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "400px",
    animation: "fadeIn 0.5s ease-in-out",
  };

  const titleStyle = {
    color: "#05445e",
    fontSize: "32px",
    fontWeight: "700",
    margin: "0",
    flex: "1",
  };

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const labelStyle = {
    color: "#333333",
    fontSize: "15.2px",
    fontWeight: "600",
    marginBottom: "6px",
  };

  const inputStyle = {
    backgroundColor: "#f7fafc",
    border: "1.5px solid #ccdbe2",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "16px",
    fontFamily: "Arial",
    outline: "none",
    transition: "border 0.3s ease, box-shadow 0.3s ease",
  };

  const inputFocusStyle = {
    borderColor: "#00aaff",
    boxShadow: "0 0 0 3px rgba(0, 170, 255, 0.2)",
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #00b4d8, #0077b6)",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    color: "white",
    fontSize: "17.6px",
    fontWeight: "700",
    fontFamily: "Arial",
    cursor: "pointer",
    transition: "transform 0.2s ease, background 0.3s ease",
    opacity: isLoading ? 0.7 : 1,
    pointerEvents: isLoading ? "none" : "auto",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  };

  const modalContentStyle = {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    textAlign: "center",
    width: "90%",
    maxWidth: "340px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    animation: "fadeIn 0.4s ease-out",
  };

  const modalIconStyle = {
    fontSize: "2.8rem",
    marginBottom: "10px",
  };

  const modalTextStyle = {
    fontSize: "1.1rem",
    fontWeight: "500",
    marginBottom: "20px",
    color: "#333",
  };

  const modalButtonStyle = {
    background: "#0077b6",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    width: "100%",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <form style={formStyle} onSubmit={handleSubmit}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px"
            }}>
              <h2 style={titleStyle}>Iniciar sesión</h2>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: backendStatus === "online" ? "#2ecc71" :
                       backendStatus === "offline" ? "#e74c3c" : "#f39c12"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: backendStatus === "online" ? "#2ecc71" :
                                   backendStatus === "offline" ? "#e74c3c" : "#f39c12"
                }}></div>
                {backendStatus === "online" ? "Backend Online" :
                 backendStatus === "offline" ? "Backend Offline" : "Verificando..."}
              </div>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Correo:</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            <button 
              type="submit" 
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = "linear-gradient(90deg, #0096c7, #023e8a)";
                  e.target.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = "linear-gradient(90deg, #00b4d8, #0077b6)";
                  e.target.style.transform = "scale(1)";
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{
              ...modalIconStyle,
              color: modalMessage.toLowerCase().includes("exitoso") ? "#2ecc71" : "#e74c3c"
            }}>
              {modalMessage.toLowerCase().includes("exitoso") ? "✔️" : "❌"}
            </div>
            <p style={modalTextStyle}>{modalMessage}</p>
            <button 
              onClick={() => setShowModal(false)}
              style={modalButtonStyle}
              onMouseEnter={(e) => e.target.style.background = "#005f85"}
              onMouseLeave={(e) => e.target.style.background = "#0077b6"}
            >
              Ok, entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
