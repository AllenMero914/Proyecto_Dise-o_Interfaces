import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { Modal } from '../../../core/components/Modal';
import logoProFact from '../../../assets/images/logoProFact.png';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const esVendedor = user?.rol === 'VENDEDOR';
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/sesion');
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logoProFact} alt="ProFact Logo" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
      <nav>
        <ul>
          {!esVendedor && (
            <li className={isActive('/dashboard') ? 'active' : ''}>
              <Link to="/dashboard">
                <i className="fa-solid fa-house"></i>
                <span>Inicio</span>
              </Link>
            </li>
          )}
          {!esVendedor && (
            <li className={isActive('/dashboard/compras') ? 'active' : ''}>
              <Link to="/dashboard/compras">
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Compras</span>
              </Link>
            </li>
          )}
          <li className={isActive('/dashboard/ventas') ? 'active' : ''}>
            <Link to="/dashboard/ventas">
              <i className="fa-solid fa-cash-register"></i>
              <span>Ventas</span>
            </Link>
          </li>
          <li className={isActive('/dashboard/inventario') ? 'active' : ''}>
            <Link to="/dashboard/inventario">
              <i className="fa-solid fa-box"></i>
              <span>Inventario</span>
            </Link>
          </li>
          {!esVendedor && (
            <li className={isActive('/dashboard/reportes') ? 'active' : ''}>
              <Link to="/dashboard/reportes">
                <i className="fa-solid fa-chart-line"></i>
                <span>Reportes</span>
              </Link>
            </li>
          )}
          {!esVendedor && (
            <li className={isActive('/dashboard/usuarios') ? 'active' : ''}>
              <Link to="/dashboard/usuarios">
                <i className="fa-solid fa-users"></i>
                <span>Usuarios</span>
              </Link>
            </li>
          )}
          <li className={isActive('/dashboard/clientes') ? 'active' : ''}>
            <Link to="/dashboard/clientes">
              <i className="fa-solid fa-handshake"></i>
              <span>Clientes</span>
            </Link>
          </li>
          {!esVendedor && (
            <li className={isActive('/dashboard/proveedores') ? 'active' : ''}>
              <Link to="/dashboard/proveedores">
                <i className="fa-solid fa-truck"></i>
                <span>Proveedores</span>
              </Link>
            </li>
          )}
          {!esVendedor && (
            <li className={isActive('/dashboard/configuracion') ? 'active' : ''}>
              <Link to="/dashboard/configuracion">
                <i className="fa-solid fa-gear"></i>
                <span>Configuración</span>
              </Link>
            </li>
          )}
          <li>
            <a href="/sesion" onClick={handleLogoutClick}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Cerrar Sesión</span>
            </a>
          </li>
        </ul>
      </nav>

      <Modal open={logoutModalOpen} title="Cerrar Sesión" onClose={() => setLogoutModalOpen(false)}>
        <p style={{ marginBottom: '20px' }}>¿Está seguro que desea cerrar sesión?</p>
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => setLogoutModalOpen(false)}>Cancelar</button>
          <button type="button" className="btn-submit" onClick={confirmLogout} style={{ background: '#dc2626' }}>Cerrar Sesión</button>
        </div>
      </Modal>
    </aside>
  );
};
