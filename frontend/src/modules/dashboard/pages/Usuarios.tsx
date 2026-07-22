import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Modal } from '../../../core/components/Modal';
import { firestoreService, type Usuario } from '../../../core/services/firestore.service';
import { useAuth } from '../../../core/context/AuthContext';
import { createUserWithEmailAndPassword, type Auth } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../../core/config/firebase.config';

export const Usuarios: React.FC = () => {
  const { user } = useAuth();

  if (user?.rol === 'VENDEDOR') {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '2rem', color: '#374151', marginBottom: '10px' }}>Acceso Restringido</h2>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Tu rol no tiene permisos para acceder a este módulo.</p>
      </main>
    );
  }

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '', rol: 'user' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const u = await firestoreService.getAll<Usuario>(firestoreService.COLLECTIONS.usuarios);
      setUsuarios(u);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNuevo = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', contrasena: '', rol: 'user' });
    setModalOpen(true);
  };

  const openEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, contrasena: '', rol: u.rol });
    setModalOpen(true);
  };

  const crearUsuarioFirebase = async (email: string, password: string): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) return false;

    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    try {
      const cred = await createUserWithEmailAndPassword(auth as Auth, email, password);
      await signOutTemp(auth as Auth);
      return true;
    } catch {
      return false;
    }
  };

  const signOutTemp = async (authInstance: Auth) => {
    const { signOut } = await import('firebase/auth');
    await signOut(authInstance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editando) {
        await firestoreService.update(firestoreService.COLLECTIONS.usuarios, editando.id, {
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
        });
      } else {
        const authCreated = await crearUsuarioFirebase(form.email, form.contrasena);

        await firestoreService.create(firestoreService.COLLECTIONS.usuarios, {
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          activo: true,
        });

        if (!authCreated && isFirebaseConfigured) {
          alert('Usuario creado en base de datos pero no en Authentication. Use la página de registro (/sesion) para crear credenciales de acceso.');
        }
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstado = async (u: Usuario) => {
    try {
      await firestoreService.update(firestoreService.COLLECTIONS.usuarios, u.id, {
        activo: !u.activo,
      });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await firestoreService.remove(firestoreService.COLLECTIONS.usuarios, id);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const activos = usuarios.filter(u => u.activo).length;
  const admins = usuarios.filter(u => u.rol === 'admin').length;

  return (
    <main className="main-content">
      <Topbar title="Gestión de Usuarios" subtitle="Administra los usuarios del sistema" searchPlaceholder="Buscar usuario..." />

      <section className="cards">
        <div className="card">
          <div className="card-icon blue"><i className="fa-solid fa-users"></i></div>
          <div className="card-info"><h2>{usuarios.length}</h2><p>Usuarios Totales</p></div>
        </div>
        <div className="card">
          <div className="card-icon green"><i className="fa-solid fa-user-check"></i></div>
          <div className="card-info"><h2>{activos}</h2><p>Activos</p></div>
        </div>
        <div className="card">
          <div className="card-icon orange"><i className="fa-solid fa-user-plus"></i></div>
          <div className="card-info"><h2>{usuarios.length - activos}</h2><p>Inactivos</p></div>
        </div>
        <div className="card">
          <div className="card-icon red"><i className="fa-solid fa-user-shield"></i></div>
          <div className="card-info"><h2>{admins}</h2><p>Administradores</p></div>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Lista de Usuarios</h2>
          <button onClick={openNuevo}><i className="fa-solid fa-plus"></i> Nuevo Usuario</button>
        </div>
        <div className="table-responsive">
          <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="loading-cell">Cargando...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={6} className="loading-cell">No hay usuarios registrados</td></tr>
            ) : usuarios.map((u, index) => (
              <tr key={u.id}>
                <td>{index + 1}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>
                  <span className={`status ${u.activo ? 'completed' : 'pending'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditar(u)} title="Editar">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button className="btn-icon toggle" onClick={() => toggleEstado(u)} title={u.activo ? 'Desactivar' : 'Activar'}>
                    <i className={`fa-solid ${u.activo ? 'fa-ban' : 'fa-check'}`}></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => eliminar(u.id)} title="Eliminar">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editando ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Contraseña {editando && <span style={{ color: '#6b7280', fontWeight: 400 }}>(dejar vacío para mantener)</span>}</label>
            <input type="password" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} required={!editando} minLength={6} />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option value="admin">Administrador (Acceso Total)</option>
              <option value="user">Usuario (Acceso Limitado)</option>
            </select>
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
