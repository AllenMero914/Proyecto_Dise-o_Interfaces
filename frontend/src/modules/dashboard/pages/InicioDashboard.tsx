import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { firestoreService, type Producto } from '../../../core/services/firestore.service';
import { useAuth } from '../../../core/context/AuthContext';

export const InicioDashboard: React.FC = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.rol === 'VENDEDOR') {
      navigate('/dashboard/ventas', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const p = await firestoreService.getAll<Producto>(firestoreService.COLLECTIONS.productos);
        setProductos(p);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (user?.rol === 'VENDEDOR') return null;

  const totalProductos = productos.length;
  const enStock = productos.filter(p => p.stock > p.stockMinimo).length;
  const bajoStock = productos.filter(p => p.stock <= p.stockMinimo && p.stock > 0).length;
  const sinStock = productos.filter(p => p.stock === 0).length;

  return (
    <main className="main-content">
      <Topbar
        title="Dashboard Principal"
        subtitle="Bienvenido al sistema de gestión empresarial ProFact"
        searchPlaceholder="Buscar..."
      />

      <section className="cards">
        <div className="card">
          <div className="card-icon blue">
            <i className="fa-solid fa-box"></i>
          </div>
          <div className="card-info">
            <h2>{totalProductos}</h2>
            <p>Total Productos</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon green">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div className="card-info">
            <h2>{enStock}</h2>
            <p>En Stock</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon orange">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="card-info">
            <h2>{bajoStock}</h2>
            <p>Bajo Stock</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon red">
            <i className="fa-solid fa-circle-xmark"></i>
          </div>
          <div className="card-info">
            <h2>{sinStock}</h2>
            <p>Sin Stock</p>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="table-section">
          <div className="table-header">
            <h2>Últimos Productos</h2>
            <button onClick={() => navigate('/dashboard/inventario')}>
              <i className="fa-solid fa-eye"></i> Ver Todo
            </button>
          </div>
          <div className="table-responsive">
            <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="loading-cell">Cargando...</td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan={5} className="loading-cell">No hay productos registrados</td></tr>
              ) : productos.slice(0, 5).map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoriaNombre}</td>
                  <td>${p.precio.toFixed(2)}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-header">
            <h2>Actividad Reciente</h2>
          </div>
          {loading ? (
            <p className="loading-cell">Cargando...</p>
          ) : productos.length === 0 ? (
            <p className="loading-cell">Sin actividad reciente</p>
          ) : productos.slice(0, 5).map((p, i) => {
            const icons = ['box', 'tag', 'dollar-sign', 'warehouse', 'exclamation-triangle'];
            const colors = ['blue', 'green', 'orange', 'blue', 'red'];
            const label = i === 0 ? 'Producto Agregado' :
              i === 1 ? 'Categoría Asignada' :
              i === 2 ? 'Precio Registrado' :
              i === 3 ? 'Stock Actualizado' : 'Alerta de Stock';
            return (
              <div className="activity" key={p.id}>
                <div className={`activity-icon ${colors[i]}`}>
                  <i className={`fa-solid fa-${icons[i]}`}></i>
                </div>
                <div>
                  <h4>{label}</h4>
                  <p>{p.nombre} - ${p.precio.toFixed(2)} · Stock: {p.stock}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
