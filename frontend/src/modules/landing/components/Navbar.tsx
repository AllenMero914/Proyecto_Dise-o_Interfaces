import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoProfact from '../../../assets/images/logoProFact.png';

export const Navbar: React.FC = () => {
  const [menuActive, setMenuActive] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logoProfact} alt="ProFact" />
        </Link>
        <ul className={`nav-links ${menuActive ? 'active' : ''}`} id="menu">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/nosotros" className={location.pathname === '/nosotros' ? 'active' : ''} onClick={closeMenu}>
              Nosotros
            </Link>
          </li>
          <li>
            <Link to="/planes" className={location.pathname === '/planes' ? 'active' : ''} onClick={closeMenu}>
              Planes
            </Link>
          </li>
          <li>
            <Link to="/capacitacion" className={location.pathname === '/capacitacion' ? 'active' : ''} onClick={closeMenu}>
              Capacitación
            </Link>
          </li>
          <li>
            <Link to="/sesion" className={location.pathname === '/sesion' ? 'active' : ''} onClick={closeMenu}>
              Ingresar
            </Link>
          </li>
        </ul>
        <div className="menu-icon" onClick={toggleMenu}>
          <i className="fa-solid fa-bars"></i>
        </div>
      </div>
    </nav>
  );
};
