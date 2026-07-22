import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Modal } from '../../../core/components/Modal';
import { firestoreService, type Producto, type Categoria } from '../../../core/services/firestore.service';
import { useAuth } from '../../../core/context/AuthContext';

export const Inventario: React.FC = () => {
  const { user } = useAuth();
  const esVendedor = user?.rol === 'VENDEDOR';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', stockMinimo: '', categoriaId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [nuevaCategoriaModal, setNuevaCategoriaModal] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('');
  const [nuevaCategoriaSubmitting, setNuevaCategoriaSubmitting] = useState(false);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        firestoreService.getAll<Producto>(firestoreService.COLLECTIONS.productos),
        firestoreService.getAll<Categoria>(firestoreService.COLLECTIONS.categorias),
      ]);
      setProductos(p);
      setCategorias(c);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNuevo = () => {
    setEditando(null);
    setForm({ nombre: '', descripcion: '', precio: '', stock: '', stockMinimo: '', categoriaId: '' });
    setModalOpen(true);
  };

  const openEditar = (p: Producto) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: String(p.precio),
      stock: String(p.stock),
      stockMinimo: String(p.stockMinimo),
      categoriaId: p.categoriaId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cat = categorias.find(c => c.id === form.categoriaId);
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        stockMinimo: parseInt(form.stockMinimo),
        categoriaId: form.categoriaId,
        categoriaNombre: cat?.nombre || '',
        activo: true,
      };
      if (editando) {
        await firestoreService.update(firestoreService.COLLECTIONS.productos, editando.id, body);
      } else {
        await firestoreService.create(firestoreService.COLLECTIONS.productos, body);
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const crearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setNuevaCategoriaSubmitting(true);
    try {
      await firestoreService.create(firestoreService.COLLECTIONS.categorias, {
        nombre: nuevaCategoriaNombre,
        descripcion: '',
      });
      setNuevaCategoriaModal(false);
      setNuevaCategoriaNombre('');
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setNuevaCategoriaSubmitting(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await firestoreService.remove(firestoreService.COLLECTIONS.productos, id);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filtrados = productos.filter(p =>
    !search || p.nombre.toLowerCase().includes(search.toLowerCase())
  );
  const enStock = productos.filter(p => p.stock > p.stockMinimo).length;
  const bajoStock = productos.filter(p => p.stock <= p.stockMinimo && p.stock > 0).length;
  const sinStock = productos.filter(p => p.stock === 0).length;

  return (
    <main className="main-content">
      <Topbar
        title="Inventario de Productos"
        subtitle="Gestiona y controla tus productos en tiempo real"
        searchPlaceholder="Buscar producto..."
        onSearch={setSearch}
      />

      <section className="cards">
        <div className="card">
          <div className="card-icon blue"><i className="fa-solid fa-boxes-stacked"></i></div>
          <div className="card-info">
            <h2>{productos.length}</h2>
            <p>Total Productos</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon green"><i className="fa-solid fa-layer-group"></i></div>
          <div className="card-info">
            <h2>{enStock}</h2>
            <p>En Stock</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon orange"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div className="card-info">
            <h2>{bajoStock}</h2>
            <p>Bajo Stock</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon red"><i className="fa-solid fa-circle-xmark"></i></div>
          <div className="card-info">
            <h2>{sinStock}</h2>
            <p>Sin Stock</p>
          </div>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Lista de Productos</h2>
          {!esVendedor && <button onClick={openNuevo}><i className="fa-solid fa-plus"></i> Nuevo Producto</button>}
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
              <th>Stock Mín</th>
              <th>Estado</th>
              {!esVendedor && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="loading-cell">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={8} className="loading-cell">No hay productos</td></tr>
            ) : filtrados.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.nombre}</td>
                <td>{p.categoriaNombre}</td>
                <td>${p.precio.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.stockMinimo}</td>
                <td>
                  {p.stock === 0 ? <span className="status danger">Sin Stock</span> :
                   p.stock <= p.stockMinimo ? <span className="status warning">Bajo Stock</span> :
                   <span className="status available">Disponible</span>}
                </td>
                {!esVendedor && (
                  <td>
                    <button className="btn-icon edit" onClick={() => openEditar(p)} title="Editar">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className="btn-icon delete" onClick={() => eliminar(p.id)} title="Eliminar">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editando ? 'Editar Producto' : 'Nuevo Producto'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Categoría
              <button type="button" onClick={() => setNuevaCategoriaModal(true)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                + Nueva Categoría
              </button>
            </label>
            <select required value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Precio ($)</label>
            <input type="number" step="0.01" min="0.01" required value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" min="0" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Stock Mínimo</label>
            <input type="number" min="0" required value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={nuevaCategoriaModal} title="Nueva Categoría" onClose={() => setNuevaCategoriaModal(false)}>
        <form onSubmit={crearCategoria}>
          <div className="form-group">
            <label>Nombre de Categoría</label>
            <input required value={nuevaCategoriaNombre} onChange={e => setNuevaCategoriaNombre(e.target.value)} autoFocus />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setNuevaCategoriaModal(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={nuevaCategoriaSubmitting}>
              {nuevaCategoriaSubmitting ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};
