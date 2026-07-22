import React from 'react';
import equipoImg from '../../../assets/images/equipo.png';

export const Nosotros: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.confirm('¿Enviar mensaje de contacto?') && alert('Mensaje enviado correctamente');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              Conoce más sobre <span>ProFact</span>
            </h1>
            <p>
              Somos una plataforma enfocada en modernizar
              la administración empresarial mediante soluciones
              tecnológicas inteligentes.
            </p>
          </div>

          <div className="hero-image">
            <img src={equipoImg} alt="Nuestro Equipo" />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-title">
            <h2>Nuestra Filosofía</h2>
            <p>
              Construimos herramientas pensadas para empresas modernas.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fa-solid fa-bullseye"></i>
              <h3>Misión</h3>
              <p>
                Facilitar la gestión empresarial mediante soluciones
                digitales eficientes y seguras.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-eye"></i>
              <h3>Visión</h3>
              <p>
                Ser líderes en innovación tecnológica empresarial
                dentro del Ecuador.
              </p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-gem"></i>
              <h3>Valores</h3>
              <p>
                Compromiso, responsabilidad, innovación
                y confianza profesional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="container">
          <div className="section-title">
            <h2>Nuestra Ubicación</h2>
          </div>
          <div className="video-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5642.417323345561!2d-78.4878685313635!3d-0.20988196617726015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a107e1cd44b%3A0x88a284f66939ed4!2sESCUELA%20POLIT%C3%89CNICA%20NACIONAL!5e0!3m2!1ses-419!2sec!4v1776865079127!5m2!1ses-419!2sec"
              allowFullScreen={true}
              loading="lazy"
              title="Ubicación ProFact"
            ></iframe>
          </div>
        </div>
      </section>

      <section>
        <div className="container contact-grid">
          <div className="contact-card">
            <h2>Contáctanos</h2>
            <br />
            <p>
              <i className="fa-solid fa-phone"></i>
              0969198706 - 0979756845
            </p>
            <br />
            <p>
              <i className="fa-solid fa-envelope"></i>
              profact@gmail.com
            </p>
            <br />
            <p>
              <i className="fa-solid fa-location-dot"></i>
              Quito, Ecuador
            </p>
          </div>
          <div className="form-card">
            <h2>Envíanos un mensaje</h2>
            <br />
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Nombre" required />
              <input type="email" placeholder="Correo" required />
              <textarea placeholder="Mensaje" required></textarea>
              <button type="submit" className="btn-primary">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
