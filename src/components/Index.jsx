import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./ModernDashboard.css";
import { 
  FaCalendarAlt, 
  FaBed, 
  FaUsers, 
  FaChartLine, 
  FaDollarSign,
  FaHotel,
  FaUserTie,
  FaCogs,
  FaEye,
  FaPlus,
  FaChair,
  FaUtensils,
  FaClipboardCheck,
  FaBroom,
  FaBell,
  FaChartBar
} from "react-icons/fa";

export default function Index() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    reservas: 0,
    usuarios: 0,
    empleados: 0,
    habitaciones: { total: 0, ocupadas: 0, disponibles: 0 },
    mesas: { total: 0, ocupadas: 0, disponibles: 0 },
    salones: { total: 0, ocupados: 0, disponibles: 0 },
    ingresos: 0
  });
  const [reservasHoy, setReservasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );

  const rol = user?.rol;
  const token = localStorage.getItem('token');

  const API_BASE_URLS = [
  "https://steady-wallaby-inviting.ngrok-free.app/geshotel/api"
];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        
        const reservasResponse = await fetch(`${API_URL}/api/reservas`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (reservasResponse.ok) {
          const reservasData = await reservasResponse.json();
          const reservasConfirmadas = reservasData.filter(r => r.estado === "confirmado");
          const reservasDelDia = reservasConfirmadas.filter(r => r.fecha === fechaSeleccionada);
          setReservasHoy(reservasDelDia);
          setStats(prev => ({ ...prev, reservas: reservasConfirmadas.length }));
        }

        if (rol === "Administrador") {
          const usuariosResponse = await fetch(`${API_URL}/api/usuarios`, {
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
            }
          });
          
          if (usuariosResponse.ok) {
            const usuariosData = await usuariosResponse.json();
            const empleados = usuariosData.filter(u => u.rol === "Usuario");
            setStats(prev => ({ 
              ...prev, 
              usuarios: usuariosData.length,
              empleados: empleados.length 
            }));
          }
        }

        const habitacionesResponse = await fetch(`${API_URL}/api/habitaciones`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (habitacionesResponse.ok) {
          const habitacionesData = await habitacionesResponse.json();
          const disponibles = habitacionesData.filter(h => h.estado === "disponible");
          setStats(prev => ({ 
            ...prev, 
            habitaciones: {
              total: habitacionesData.length,
              disponibles: disponibles.length,
              ocupadas: habitacionesData.length - disponibles.length
            }
          }));
        }

        const mesasResponse = await fetch(`${API_URL}/api/mesas`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (mesasResponse.ok) {
          const mesasData = await mesasResponse.json();
          const disponibles = mesasData.filter(m => m.estado === "disponible");
          setStats(prev => ({ 
            ...prev, 
            mesas: {
              total: mesasData.length,
              disponibles: disponibles.length,
              ocupadas: mesasData.length - disponibles.length
            }
          }));
        }

        const salonesResponse = await fetch(`${API_URL}/api/salones`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (salonesResponse.ok) {
          const salonesData = await salonesResponse.json();
          const disponibles = salonesData.filter(s => s.estado === "disponible");
          setStats(prev => ({ 
            ...prev, 
            salones: {
              total: salonesData.length,
              disponibles: disponibles.length,
              ocupados: salonesData.length - disponibles.length
            }
          }));
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fechaSeleccionada, rol, token]);
  const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="stat-icon" style={{ color }}>
        <Icon />
      </div>
      <div className="stat-content">
        <div className="stat-value">{loading ? "..." : value}</div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }) => (
    <div className="quick-action-card" onClick={onClick}>
      <div className="action-icon" style={{ backgroundColor: color }}>
        <Icon />
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  // DASHBOARD PROPIETARIO
  if (rol === "Propietario") {
    return (
      <div className="modern-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Dashboard del Propietario</h1>
            <p>Resumen ejecutivo del hotel</p>
          </div>
          <div className="date-selector">
            <FaCalendarAlt />
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={FaDollarSign}
            title="Ingresos del Mes"
            value="$25,430"
            subtitle="+12% vs mes anterior"
            color="#27ae60"
          />
          <StatCard
            icon={FaUsers}
            title="Reservas Totales"
            value={stats.reservas}
            subtitle={`${reservasHoy.length} para hoy`}
            color="#3498db"
          />
          <StatCard
            icon={FaBed}
            title="Ocupación"
            value={`${Math.round((stats.habitaciones.ocupadas / stats.habitaciones.total) * 100) || 0}%`}
            subtitle={`${stats.habitaciones.ocupadas}/${stats.habitaciones.total} habitaciones`}
            color="#e74c3c"
          />
          <StatCard
            icon={FaChartLine}
            title="Satisfacción"
            value="4.8/5"
            subtitle="Basado en 127 reseñas"
            color="#f39c12"
          />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h3>
              <FaCalendarAlt />
              Reservas de Hoy ({new Date(fechaSeleccionada).toLocaleDateString()})
            </h3>
            <div className="reservas-today">
              {loading ? (
                <div className="loading">Cargando reservas...</div>
              ) : reservasHoy.length === 0 ? (
                <div className="no-data">No hay reservas para esta fecha</div>
              ) : (
                <div className="reservas-list">
                  {reservasHoy.map((reserva) => (
                    <div key={reserva.id} className="reserva-item">
                      <div className="reserva-type">
                        {reserva.tipo === "habitacion" && <FaBed />}
                        {reserva.tipo === "mesa" && <FaUtensils />}
                        {reserva.tipo === "salon" && <FaChair />}
                      </div>
                      <div className="reserva-info">
                        <strong>{reserva.cliente || 'Cliente no especificado'}</strong>
                        <p>{reserva.tipo} - {reserva.hora || 'Hora no especificada'}</p>
                      </div>
                      <div className="reserva-status">
                        <span className={`status ${reserva.estado}`}>
                          {reserva.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h3>
              <FaChartBar />
              Métricas de Ocupación
            </h3>
            <div className="ocupacion-grid">
              <div className="ocupacion-item">
                <FaBed />
                <div>
                  <h4>Habitaciones</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(stats.habitaciones.ocupadas / stats.habitaciones.total) * 100 || 0}%`,
                        backgroundColor: '#e74c3c'
                      }}
                    ></div>
                  </div>
                  <span>{stats.habitaciones.ocupadas}/{stats.habitaciones.total}</span>
                </div>
              </div>
              <div className="ocupacion-item">
                <FaUtensils />
                <div>
                  <h4>Mesas</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(stats.mesas.ocupadas / stats.mesas.total) * 100 || 0}%`,
                        backgroundColor: '#f39c12'
                      }}
                    ></div>
                  </div>
                  <span>{stats.mesas.ocupadas}/{stats.mesas.total}</span>
                </div>
              </div>
              <div className="ocupacion-item">
                <FaChair />
                <div>
                  <h4>Salones</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(stats.salones.ocupados / stats.salones.total) * 100 || 0}%`,
                        backgroundColor: '#9b59b6'
                      }}
                    ></div>
                  </div>
                  <span>{stats.salones.ocupados}/{stats.salones.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD ADMINISTRADOR
  if (rol === "Administrador") {
    return (
      <div className="modern-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Panel de Administración</h1>
            <p>Control total del sistema hotelero</p>
          </div>
          <div className="admin-actions">
            <button className="action-btn primary">
              <FaPlus /> Nueva Reserva
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={FaUsers}
            title="Reservas Activas"
            value={stats.reservas}
            subtitle={`${reservasHoy.length} para hoy`}
            color="#3498db"
            onClick={() => navigate('/dashboard/reservas')}
          />
          <StatCard
            icon={FaUserTie}
            title="Usuarios Totales"
            value={stats.usuarios}
            subtitle={`${stats.empleados} empleados activos`}
            color="#2ecc71"
            onClick={() => navigate('/dashboard/usuarios')}
          />
          <StatCard
            icon={FaBed}
            title="Habitaciones"
            value={`${stats.habitaciones.disponibles}/${stats.habitaciones.total}`}
            subtitle="Disponibles"
            color="#e74c3c"
            onClick={() => navigate('/dashboard/habitaciones')}
          />
          <StatCard
            icon={FaCogs}
            title="Sistema"
            value="Online"
            subtitle="Todos los servicios funcionando"
            color="#27ae60"
          />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h3>
              <FaEye />
              Accesos Rápidos
            </h3>
            <div className="quick-actions-grid">
              <QuickActionCard
                icon={FaUsers}
                title="Gestión de Usuarios"
                description="Administrar usuarios y empleados"
                onClick={() => navigate('/dashboard/usuarios')}
                color="#3498db"
              />
              <QuickActionCard
                icon={FaBed}
                title="Habitaciones"
                description="Ver y gestionar habitaciones"
                onClick={() => navigate('/dashboard/habitaciones')}
                color="#e74c3c"
              />
              <QuickActionCard
                icon={FaCalendarAlt}
                title="Reservas"
                description="Administrar todas las reservas"
                onClick={() => navigate('/dashboard/reservas')}
                color="#f39c12"
              />
              <QuickActionCard
                icon={FaChair}
                title="Salones"
                description="Gestión de salones de eventos"
                onClick={() => navigate('/dashboard/salones')}
                color="#9b59b6"
              />
            </div>
          </div>

          <div className="dashboard-section">
            <h3>
              <FaBell />
              Notificaciones Recientes
            </h3>
            <div className="notifications-list">
              <div className="notification-item">
                <div className="notification-icon success">
                  <FaUsers />
                </div>
                <div className="notification-content">
                  <strong>Nueva reserva confirmada</strong>
                  <p>Habitación 201 - Cliente: María García</p>
                  <span className="time">Hace 15 minutos</span>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-icon warning">
                  <FaBroom />
                </div>
                <div className="notification-content">
                  <strong>Mantenimiento programado</strong>
                  <p>Habitación 105 requiere limpieza profunda</p>
                  <span className="time">Hace 1 hora</span>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-icon info">
                  <FaHotel />
                </div>
                <div className="notification-content">
                  <strong>Check-out completado</strong>
                  <p>Suite presidencial disponible</p>
                  <span className="time">Hace 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD USUARIO (Empleado)
  if (rol === "Usuario") {
    return (
      <div className="modern-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Panel del Empleado</h1>
            <p>Bienvenido, {user.nombre}</p>
          </div>
          <div className="employee-status">
            <div className="status-indicator online"></div>
            <span>En turno</span>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={FaClipboardCheck}
            title="Tareas Pendientes"
            value="5"
            subtitle="2 de alta prioridad"
            color="#e74c3c"
          />
          <StatCard
            icon={FaBed}
            title="Habitaciones Asignadas"
            value="8"
            subtitle="3 requieren limpieza"
            color="#f39c12"
          />
          <StatCard
            icon={FaUsers}
            title="Check-ins Hoy"
            value="12"
            subtitle="3 completados"
            color="#3498db"
          />
          <StatCard
            icon={FaChartLine}
            title="Productividad"
            value="92%"
            subtitle="Excelente rendimiento"
            color="#27ae60"
          />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h3>
              <FaClipboardCheck />
              Tareas del Día
            </h3>
            <div className="tasks-list">
              <div className="task-item priority-high">
                <div className="task-checkbox">
                  <input type="checkbox" />
                </div>
                <div className="task-content">
                  <strong>Limpieza habitación 301</strong>
                  <p>Cliente sale a las 11:00 AM</p>
                  <span className="priority-badge high">Alta prioridad</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-checkbox">
                  <input type="checkbox" />
                </div>
                <div className="task-content">
                  <strong>Preparar sala de conferencias</strong>
                  <p>Evento a las 2:00 PM</p>
                  <span className="priority-badge medium">Media prioridad</span>
                </div>
              </div>
              <div className="task-item completed">
                <div className="task-checkbox">
                  <input type="checkbox" checked />
                </div>
                <div className="task-content">
                  <strong>Check-in familia Rodríguez</strong>
                  <p>Completado a las 9:30 AM</p>
                  <span className="priority-badge completed">Completada</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h3>
              <FaCogs />
              Acceso Rápido
            </h3>
            <div className="quick-actions-grid employee">
              <QuickActionCard
                icon={FaBed}
                title="Habitaciones"
                description="Ver estado y asignaciones"
                onClick={() => navigate('/dashboard/habitaciones')}
                color="#e74c3c"
              />
              <QuickActionCard
                icon={FaUsers}
                title="Reservas"
                description="Gestionar check-ins y check-outs"
                onClick={() => navigate('/dashboard/reservas')}
                color="#3498db"
              />
              <QuickActionCard
                icon={FaUtensils}
                title="Mesas"
                description="Estado del restaurante"
                onClick={() => navigate('/dashboard/mesas')}
                color="#f39c12"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario no autorizado
  return (
    <div className="modern-dashboard">
      <div className="unauthorized">
        <h2>Acceso No Autorizado</h2>
        <p>No tienes permisos para acceder a este panel.</p>
      </div>
    </div>
  );
}