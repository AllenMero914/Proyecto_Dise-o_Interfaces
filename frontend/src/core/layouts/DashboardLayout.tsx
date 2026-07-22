import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../../modules/dashboard/components/Sidebar';
import '../../dashboard.css';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Establecer el color de fondo del body para el dashboard
    document.body.style.backgroundColor = '#eef2ff';
    return () => {
      // Restaurar el color de fondo original al salir del dashboard
      document.body.style.backgroundColor = '#f8fafc';
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/sesion" replace />;
  }

  const esVendedor = user?.rol === 'VENDEDOR';
  const rutasProhibidasVendedor = ['/dashboard/compras', '/dashboard/reportes', '/dashboard/usuarios', '/dashboard/proveedores'];

  if (esVendedor && rutasProhibidasVendedor.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
  );
};
