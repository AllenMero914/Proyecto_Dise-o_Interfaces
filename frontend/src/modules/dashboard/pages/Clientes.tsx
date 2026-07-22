import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Modal } from '../../../core/components/Modal';
import { api } from '../../../core/api/api';
import type { ClienteDTO } from '../../../core/api/api';

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ClienteDTO | null>(null);
  const [form, setForm] = useState({ identificacion: '', nombre: '', telefono: '', direccion: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const data = await api.get<ClienteDTO[]>('/clientes');
      setClientes(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNuevo = () => {
    setEditando(null);
    setForm({ identificacion: '', nombre: '', telefono: '', direccion: '', email: '' });
    setModalOpen(true);
  };

  const openEditar = (c: ClienteDTO) => {
    setEditando(c);
    setForm({
      identificacion: c.identificacion,
      nombre: c.nombre,
      telefono: c.telefono || '',
      direccion: c.direccion || '',
      email: c.email || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editando) {
        await api.put(`/clientes/${editando.id}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await api.del(`/clientes/${id}`);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filtrados = clientes.filter(c =>
    !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || c.identificacion.includes(search)
  );

  return (
    <main className="main-content">
      <Topbar
        title="Gestión de Clientes"
        subtitle="Administra la base de datos de tus clientes"
        searchPlaceholder="Buscar por nombre o CI/RUC..."
        onSearch={setSearch}
      />

      <section className="cards">
        <div className="card">
          <div className="card-icon blue"><i className="fa-solid fa-users"></i></div>
          <div className="card-info">
            <h2>{clientes.length}</h2>
            <p>Clientes Activos</p>
          </div>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Lista de Clientes</h2>
          <button onClick={openNuevo}><i className="fa-solid fa-plus"></i> Nuevo Cliente</button>
        </div>
        <div className="table-responsive">
          <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Identificación</th>
              <th>Nombre / Razón Social</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="loading-cell">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={7} className="loading-cell">No hay clientes</td></tr>
            ) : filtrados.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.identificacion}</td>
                <td>{c.nombre}</td>
                <td>{c.telefono || '-'}</td>
                <td>{c.email || '-'}</td>
                <td>{c.direccion || '-'}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditar(c)} title="Editar">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => eliminar(c.id)} title="Eliminar">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editando ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Identificación (CI/RUC)</label>
            <input required value={form.identificacion} onChange={e => setForm({ ...form, identificacion: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Nombre / Razón Social</label>
            <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
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
