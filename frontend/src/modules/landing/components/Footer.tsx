import React from 'react';
import { Link } from 'react-router-dom';
import logoProfact from '../../../assets/images/logoProFact.png';

interface FooterProps {
  simple?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ simple = false }) => {
  if (simple) {
    return (
      <footer>
        <div className="container">
          <div className="copy">
            © 2026 ProFact - Todos los derechos reservados
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src={logoProfact} className="footer-logo" alt="ProFact Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
            <p style={{ marginTop: '10px', color: '#cbd5e1' }}>
              Soluciones modernas de facturación electrónica y administración empresarial.
            </p>
          </div>
          <div className="footer-links">
            <h3>Empresa</h3>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/planes">Planes</Link>
            <Link to="/capacitacion">Capacitación</Link>
          </div>
          <div className="footer-links">
            <h3>Soporte</h3>
            <a href="#">Centro de ayuda</a>
            <a href="#">Privacidad</a>
          </div>
          <div className="footer-links">
            <h3>Redes</h3>
            <a href="#"><i className="fa-brands fa-facebook"></i> Facebook</a>
            <a href="#"><i className="fa-brands fa-instagram"></i> Instagram</a>
          </div>
        </div>
        <div className="copy">
          © 2026 ProFact - Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
};
