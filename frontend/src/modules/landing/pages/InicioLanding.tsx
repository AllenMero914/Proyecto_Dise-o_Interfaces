import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../../../assets/images/ProFact-index.png';

export const InicioLanding: React.FC = () => {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              Lleva tu negocio al siguiente <span>nivel digital</span>
            </h1>
            <p>
              Automatiza tu facturación electrónica, controla inventario,
              analiza tus ventas y administra tu empresa desde cualquier lugar.
            </p>
            <div className="hero-buttons">
              <Link to="/planes" className="btn-primary">
                Empezar Ahora
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <a href="#features" className="btn-secondary">
                Ver Características
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroImg} alt="ProFact Hero" />
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          <div className="stat-card">
            <i className="fa-solid fa-users"></i>
            <h3>1500+</h3>
            <p>Clientes activos</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-file-invoice"></i>
            <h3>500K+</h3>
            <p>Facturas emitidas</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-chart-line"></i>
            <h3>98%</h3>
            <p>Satisfacción</p>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-building"></i>
            <h3>24</h3>
            <p>Provincias</p>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="section-title">
            <h2>Todo lo que tu negocio necesita</h2>
            <p>
              Herramientas modernas diseñadas para mejorar la productividad empresarial.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fa-solid fa-receipt"></i>
              <h3>Facturación Electrónica</h3>
              <p>
                Emite comprobantes electrónicos válidos para el SRI.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-boxes-stacked"></i>
              <h3>Inventario</h3>
              <p>
                Gestiona productos y movimientos en tiempo real.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-chart-pie"></i>
              <h3>Reportes</h3>
              <p>
                Analiza ingresos y crecimiento empresarial.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-cloud"></i>
              <h3>En la nube</h3>
              <p>
                Accede desde cualquier dispositivo y lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="container">
          <div className="section-title">
            <h2>Descubre cómo funciona ProFact</h2>
          </div>
          <div className="video-container">
            <iframe
              src="https://www.youtube.com/embed/Juv3KC5mtzU"
              allowFullScreen
              title="Demo ProFact"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
};
