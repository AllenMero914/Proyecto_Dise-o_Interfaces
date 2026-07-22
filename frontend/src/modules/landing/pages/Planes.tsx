import React from 'react';
import planBasicoImg from '../../../assets/images/PlanBasico.png';
import planNegocioImg from '../../../assets/images/PlanNegocio.png';

export const Planes: React.FC = () => {
  return (
    <section className="planes-modernos">
      <div className="container">
        <div className="titulo-planes">
          <h1>Nuestros Planes</h1>
          <p>
            Elige el plan ideal para administrar y potenciar tu negocio.
          </p>
        </div>
        <div className="contenedor-planes-modernos">
          <div className="plan-card">
            <div className="plan-header">
              <h2>Plan Básico</h2>
            </div>
            <div className="plan-body">
              <div className="plan-price"></div>
              <div className="plan-image">
                <img src={planBasicoImg} alt="Plan Básico" />
              </div>
              <a href="/sesion" className="btn-primary">
                Adquirir Plan
              </a>
            </div>
          </div>
          <div className="plan-card destacado">
            <div className="recomendado">Más Popular</div>
            <div className="plan-header">
              <h2>Plan Negocio</h2>
            </div>
            <div className="plan-body">
              <div className="plan-price"></div>
              <div className="plan-image">
                <img src={planNegocioImg} alt="Plan Negocio" />
              </div>
              <a href="/sesion" className="btn-primary">
                Adquirir Plan
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
