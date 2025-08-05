// API Service for Hotel Management
const API_BASE_URL = "http://localhost:8000/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      "Authorization": `Bearer ${this.token}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Reservas
  async getReservas() {
    return this.request('/reservas');
  }

  async getReservasByDate(fecha) {
    const reservas = await this.getReservas();
    return reservas.filter(r => r.fecha === fecha && r.estado === "confirmado");
  }

  // Usuarios
  async getUsuarios() {
    return this.request('/usuarios');
  }

  async getEmpleados() {
    const usuarios = await this.getUsuarios();
    return usuarios.filter(u => u.rol === "Usuario");
  }

  // Habitaciones
  async getHabitaciones() {
    return this.request('/habitaciones');
  }

  async getHabitacionesStats() {
    const habitaciones = await this.getHabitaciones();
    const total = habitaciones.length;
    const disponibles = habitaciones.filter(h => h.estado === "disponible").length;
    const ocupadas = total - disponibles;
    return {
      total,
      disponibles,
      ocupadas,
      porcentajeOcupacion: Math.round((ocupadas / total) * 100) || 0
    };
  }

  // Mesas
  async getMesas() {
    return this.request('/mesas');
  }

  async getMesasStats() {
    const mesas = await this.getMesas();
    const total = mesas.length;
    const disponibles = mesas.filter(m => m.estado === "disponible").length;
    const ocupadas = total - disponibles;
    return {
      total,
      disponibles,
      ocupadas,
      porcentajeOcupacion: Math.round((ocupadas / total) * 100) || 0
    };
  }

  // Salones
  async getSalones() {
    return this.request('/salones');
  }

  async getSalonesStats() {
    const salones = await this.getSalones();
    const total = salones.length;
    const disponibles = salones.filter(s => s.estado === "disponible").length;
    const ocupados = total - disponibles;
    return {
      total,
      disponibles,
      ocupados,
      porcentajeOcupacion: Math.round((ocupados / total) * 100) || 0
    };
  }

  // Dashboard Stats
  async getDashboardStats() {
    try {
      const [reservas, usuarios, habitaciones, mesas, salones] = await Promise.all([
        this.getReservas(),
        this.getUsuarios().catch(() => []),
        this.getHabitacionesStats().catch(() => ({ total: 0, disponibles: 0, ocupadas: 0 })),
        this.getMesasStats().catch(() => ({ total: 0, disponibles: 0, ocupadas: 0 })),
        this.getSalonesStats().catch(() => ({ total: 0, disponibles: 0, ocupados: 0 }))
      ]);

      const empleados = usuarios.filter(u => u.rol === "Usuario");

      return {
        reservas: {
          total: reservas.length,
          confirmadas: reservas.filter(r => r.estado === "confirmado").length,
          pendientes: reservas.filter(r => r.estado === "pendiente").length,
          canceladas: reservas.filter(r => r.estado === "cancelado").length
        },
        usuarios: {
          total: usuarios.length,
          empleados: empleados.length,
          administradores: usuarios.filter(u => u.rol === "Administrador").length
        },
        habitaciones,
        mesas,
        salones,
        ingresos: {
          mes: Math.random() * 50000 + 20000, // Simulado por ahora
          dia: Math.random() * 2000 + 500
        }
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        reservas: { total: 0, confirmadas: 0, pendientes: 0, canceladas: 0 },
        usuarios: { total: 0, empleados: 0, administradores: 0 },
        habitaciones: { total: 0, disponibles: 0, ocupadas: 0 },
        mesas: { total: 0, disponibles: 0, ocupadas: 0 },
        salones: { total: 0, disponibles: 0, ocupados: 0 },
        ingresos: { mes: 0, dia: 0 }
      };
    }
  }

  // Notificaciones simuladas
  getNotifications() {
    return [
      {
        id: 1,
        type: "success",
        title: "Nueva reserva confirmada",
        message: "Habitación 201 - Cliente: María García",
        time: "Hace 15 minutos",
        icon: "users"
      },
      {
        id: 2,
        type: "warning",
        title: "Mantenimiento programado",
        message: "Habitación 105 requiere limpieza profunda",
        time: "Hace 1 hora",
        icon: "broom"
      },
      {
        id: 3,
        type: "info",
        title: "Check-out completado",
        message: "Suite presidencial disponible",
        time: "Hace 2 horas",
        icon: "hotel"
      }
    ];
  }

  // Tareas para empleados (simuladas)
  getEmployeeTasks() {
    return [
      {
        id: 1,
        title: "Limpieza habitación 301",
        description: "Cliente sale a las 11:00 AM",
        priority: "high",
        completed: false
      },
      {
        id: 2,
        title: "Preparar sala de conferencias",
        description: "Evento a las 2:00 PM",
        priority: "medium",
        completed: false
      },
      {
        id: 3,
        title: "Check-in familia Rodríguez",
        description: "Completado a las 9:30 AM",
        priority: "low",
        completed: true
      }
    ];
  }
}

export default new ApiService();
