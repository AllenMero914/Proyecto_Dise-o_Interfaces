import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Modal } from '../../../core/components/Modal';
import { api } from '../../../core/api/api';
import type { ProveedorDTO } from '../../../core/api/api';

import { useAuth } from '../../../core/context/AuthContext';

export const Proveedores: React.FC = () => {
  const { user } = useAuth();

  if (user?.rol === 'VENDEDOR') {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '2rem', color: '#374151', marginBottom: '10px' }}>Acceso Restringido</h2>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Tu rol de Vendedor no tiene permisos para acceder a este módulo.</p>
      </main>
    );
  }

  const [proveedores, setProveedores] = useState<ProveedorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ProveedorDTO | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const data = await api.get<ProveedorDTO[]>('/proveedores');
      setProveedores(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNuevo = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', telefono: '', direccion: '' });
    setModalOpen(true);
  };

  const openEditar = (p: ProveedorDTO) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      email: p.email || '',
      telefono: p.telefono || '',
      direccion: p.direccion || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editando) {
        await api.put(`/proveedores/${editando.id}`, form);
      } else {
        await api.post('/proveedores', form);
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.del(`/proveedores/${id}`);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filtrados = proveedores.filter(p =>
    !search || p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="main-content">
      <Topbar
        title="Gestión de Proveedores"
        subtitle="Administra la base de datos de tus proveedores"
        searchPlaceholder="Buscar por nombre..."
        onSearch={setSearch}
      />

      <section className="cards">
        <div className="card">
          <div className="card-icon green"><i className="fa-solid fa-truck"></i></div>
          <div className="card-info">
            <h2>{proveedores.length}</h2>
            <p>Proveedores Activos</p>
          </div>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Lista de Proveedores</h2>
          <button onClick={openNuevo}><i className="fa-solid fa-plus"></i> Nuevo Proveedor</button>
        </div>
        <div className="table-responsive">
          <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="loading-cell">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={6} className="loading-cell">No hay proveedores</td></tr>
            ) : filtrados.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.email || '-'}</td>
                <td>{p.telefono || '-'}</td>
                <td>{p.direccion || '-'}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditar(p)} title="Editar">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => eliminar(p.id)} title="Eliminar">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editando ? 'Editar Proveedor' : 'Nuevo Proveedor'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Proveedor</label>
            <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};
