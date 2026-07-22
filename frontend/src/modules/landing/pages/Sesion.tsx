import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import logoProfact from '../../../assets/images/logoProFact.png';

export const Sesion: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, nombre);
      }
      if (success) {
        navigate('/dashboard');
      } else {
        alert(isLogin ? 'Usuario o contraseña incorrectos' : 'Error al registrar. El correo ya puede estar en uso.');
      }
    } catch {
      alert('Error al procesar. Intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-left">
        <div className="login-box">
          <img src={logoProfact} alt="ProFact Logo" className="login-logo" />
          <h1>{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h1>
          <p className="login-text">
            {isLogin
              ? 'Ingresa a tu cuenta para administrar tu empresa de manera inteligente.'
              : 'Regístrate para comenzar a gestionar tu empresa.'}
          </p>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="input-group">
              <i className="fa-solid fa-envelope"></i>
              <input
                type={isLogin ? 'text' : 'email'}
                placeholder={isLogin ? 'Usuario o correo' : 'Correo electrónico'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Registrarse'}
            </button>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-arrow-left"></i>
                Volver a la Página Principal
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className="login-right"></div>
    </section>
  );
};
