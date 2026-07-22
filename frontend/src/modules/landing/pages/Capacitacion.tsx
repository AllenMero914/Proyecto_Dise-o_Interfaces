import React from 'react';
import capacitacionImg from '../../../assets/images/capacitacionimag.png';

export const Capacitacion: React.FC = () => {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              Aprende a usar <span>ProFact</span>
            </h1>
            <p>
              Capacítate mediante tutoriales y aprende
              a gestionar tu negocio de forma eficiente.
            </p>
          </div>
          <div className="hero-image">
            <img src={capacitacionImg} alt="Capacitación" />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-title">
            <h2>Empieza en 3 pasos</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fa-solid fa-file-signature"></i>
              <h3>Autoriza el SRI</h3>
              <p>
                Configura tu firma electrónica y activa el sistema.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-box"></i>
              <h3>Crea Productos</h3>
              <p>
                Registra tu inventario y organiza tus artículos.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-file-invoice"></i>
              <h3>Factura</h3>
              <p>
                Emite comprobantes electrónicos fácilmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="container">
          <div className="section-title">
            <h2>Videos de Capacitación</h2>
          </div>
          <div className="testimonials-grid">
            <div className="video-container">
              <iframe
                src="https://www.youtube.com/embed/0sbJUJ4Lnto"
                allowFullScreen={true}
                title="Capacitación Video 1"
              ></iframe>
            </div>
            <div className="video-container">
              <iframe
                src="https://www.youtube.com/embed/Wa9n9i5J0VA"
                allowFullScreen={true}
                title="Capacitación Video 2"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
