import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrearFactura from "./components/CrearFactura";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/factura/:id" element={<CrearFactura />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
