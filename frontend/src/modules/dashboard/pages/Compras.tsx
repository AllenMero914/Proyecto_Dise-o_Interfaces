import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Modal } from '../../../core/components/Modal';
import { api } from '../../../core/api/api';
import type { CompraDTO, ProveedorDTO, ProductoDTO, CategoriaDTO } from '../../../core/api/api';
import { useAuth } from '../../../core/context/AuthContext';

export const Compras: React.FC = () => {
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

  const [compras, setCompras] = useState<CompraDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [proveedores, setProveedores] = useState<ProveedorDTO[]>([]);
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  
  const [proveedorId, setProveedorId] = useState('');
  const [detalles, setDetalles] = useState<{ productoId: string; cantidad: string; precio: string; precioVenta: string }[]>([
    { productoId: '', cantidad: '1', precio: '', precioVenta: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const [ivaParam, setIvaParam] = useState<number>(0);
  const [aplicarIva, setAplicarIva] = useState(false);

  // Modales adicionales
  const [nuevoProveedorModal, setNuevoProveedorModal] = useState(false);
  const [formProveedor, setFormProveedor] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [submittingProveedor, setSubmittingProveedor] = useState(false);

  const [nuevaCategoriaModal, setNuevaCategoriaModal] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('');
  const [submittingCategoria, setSubmittingCategoria] = useState(false);

  const [nuevoProductoModal, setNuevoProductoModal] = useState(false);
  const [formProducto, setFormProducto] = useState({ nombre: '', descripcion: '', precio: '', precioCompra: '', stock: '0', stockMinimo: '5', categoriaId: '' });
  const [submittingProducto, setSubmittingProducto] = useState(false);

  const load = async () => {
    try {
      const [c, pv, pr, cat, params] = await Promise.all([
        api.get<CompraDTO[]>('/compras'),
        api.get<ProveedorDTO[]>('/proveedores'),
        api.get<ProductoDTO[]>('/productos'),
        api.get<CategoriaDTO[]>('/categorias?todas=true'),
        api.get<any[]>('/parametros').catch(() => [])
      ]);
      setCompras(c);
      setProveedores(pv);
      setProductos(pr.filter(p => p.activo));
      setCategorias(cat);

      const ivaSetting = params.find((param: any) => param.clave === 'IVA');
      if (ivaSetting) {
        setIvaParam(parseFloat(ivaSetting.valor));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNuevo = () => {
    setEditandoId(null);
    setProveedorId('');
    setDetalles([{ productoId: '', cantidad: '1', precio: '', precioVenta: '' }]);
    setAplicarIva(false);
    setModalOpen(true);
  };

  const openEdit = (compra: CompraDTO) => {
    setEditandoId(compra.id);
    setProveedorId(compra.proveedorId ? String(compra.proveedorId) : '');
    setAplicarIva(compra.iva > 0);
    if (compra.detalles && compra.detalles.length > 0) {
      setDetalles(compra.detalles.map(d => ({
        productoId: String(d.productoId),
        cantidad: String(d.cantidad),
        precio: String(d.precioUnitario),
        precioVenta: ''
      })));
    } else {
      setDetalles([{ productoId: '', cantidad: '1', precio: '', precioVenta: '' }]);
    }
    setModalOpen(true);
  };

  const cambiarDetalle = (i: number, field: 'productoId' | 'cantidad' | 'precio' | 'precioVenta', value: string) => {
    const copy = [...detalles];
    copy[i] = { ...copy[i], [field]: value };
    if (field === 'productoId') {
      const p = productos.find(pr => pr.id === parseInt(value));
      if (p) {
        copy[i].precio = String(p.precioCompra || p.precio);
        copy[i].precioVenta = String(p.precio);
      }
    }
    setDetalles(copy);
  };

  const agregarDetalle = () => setDetalles([...detalles, { productoId: '', cantidad: '1', precio: '', precioVenta: '' }]);
  const quitarDetalle = (i: number) => {
    if (detalles.length > 1) setDetalles(detalles.filter((_, idx) => idx !== i));
  };

  const calcularTotales = () => {
    const subtotal = detalles.reduce((sum, d) => sum + (parseFloat(d.precio || '0') * parseInt(d.cantidad || '0')), 0);
    const ivaCalculado = aplicarIva ? subtotal * (ivaParam / 100) : 0;
    const total = subtotal + ivaCalculado;
    return { subtotal, ivaCalculado, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        proveedorId: parseInt(proveedorId),
        aplicarIva,
        detalles: detalles.map(d => ({
          productoId: parseInt(d.productoId),
          cantidad: parseInt(d.cantidad),
          precioUnitario: parseFloat(d.precio),
          precioVenta: d.precioVenta ? parseFloat(d.precioVenta) : undefined
        })),
      };
      if (editandoId) {
        await api.put(`/compras/${editandoId}`, payload);
      } else {
        await api.post('/compras', payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar compra');
    } finally {
      setSubmitting(false);
    }
  };

  const crearProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProveedor(true);
    try {
      await api.post('/proveedores', formProveedor);
      setNuevoProveedorModal(false);
      setFormProveedor({ nombre: '', email: '', telefono: '', direccion: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear proveedor');
    } finally {
      setSubmittingProveedor(false);
    }
  };

  const crearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCategoria(true);
    try {
      await api.post('/categorias', { nombre: nuevaCategoriaNombre, descripcion: '' });
      setNuevaCategoriaModal(false);
      setNuevaCategoriaNombre('');
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setSubmittingCategoria(false);
    }
  };

  const crearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProducto(true);
    try {
      const body = {
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion,
        precio: parseFloat(formProducto.precio),
        precioCompra: parseFloat(formProducto.precioCompra),
        stock: parseInt(formProducto.stock),
        stockMinimo: parseInt(formProducto.stockMinimo),
        categoriaId: parseInt(formProducto.categoriaId),
      };
      await api.post('/productos', body);
      setNuevoProductoModal(false);
      setFormProducto({ nombre: '', descripcion: '', precio: '', precioCompra: '', stock: '0', stockMinimo: '5', categoriaId: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setSubmittingProducto(false);
    }
  };

  const totalGastado = compras.reduce((s, c) => s + c.total, 0);
  const totalesActuales = calcularTotales();

  return (
    <main className="main-content">
      <Topbar title="Gestión de Compras" subtitle="Administra y controla las compras realizadas" searchPlaceholder="Buscar compra..." />

      <section className="cards">
        <div className="card">
          <div className="card-icon blue"><i className="fa-solid fa-cart-plus"></i></div>
          <div className="card-info"><h2>{compras.length}</h2><p>Compras Totales</p></div>
        </div>
        <div className="card">
          <div className="card-icon green"><i className="fa-solid fa-dollar-sign"></i></div>
          <div className="card-info"><h2>${totalGastado.toFixed(2)}</h2><p>Total Gastado</p></div>
        </div>
        <div className="card">
          <div className="card-icon orange"><i className="fa-solid fa-truck"></i></div>
          <div className="card-info"><h2>{proveedores.length}</h2><p>Proveedores</p></div>
        </div>
        <div className="card">
          <div className="card-icon red"><i className="fa-solid fa-clock"></i></div>
          <div className="card-info"><h2>{compras.length}</h2><p>Registradas</p></div>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Últimas Compras</h2>
          <button onClick={openNuevo}><i className="fa-solid fa-plus"></i> Nueva Compra</button>
        </div>
        <div className="table-responsive">
          <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Proveedor</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="loading-cell">Cargando...</td></tr>
            ) : compras.length === 0 ? (
              <tr><td colSpan={7} className="loading-cell">No hay compras registradas</td></tr>
            ) : compras.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.proveedorNombre}</td>
                <td>${(c.subtotal || c.total).toFixed(2)}</td>
                <td>${(c.iva || 0).toFixed(2)}</td>
                <td><strong>${c.total.toFixed(2)}</strong></td>
                <td>{new Date(c.fecha).toLocaleString()}</td>
                <td>
                  <button className="btn-icon orange" onClick={() => openEdit(c)} title="Editar Compra">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editandoId ? "Editar Compra" : "Nueva Compra"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Proveedor
              <button type="button" onClick={() => setNuevoProveedorModal(true)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                + Nuevo Proveedor
              </button>
            </label>
            <select required value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
              <option value="">Seleccionar...</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
            <button type="button" onClick={() => setNuevaCategoriaModal(true)} style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em' }}>
              <i className="fa-solid fa-folder-plus"></i> Crear nueva categoría de productos
            </button>
            <button type="button" onClick={() => setNuevoProductoModal(true)} style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em' }}>
              <i className="fa-solid fa-plus"></i> Nuevo Producto
            </button>
          </div>

          <h4 style={{ margin: '15px 0 10px', color: '#374151' }}>Detalles de Compra</h4>
          {detalles.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 12 }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Producto</label>
                <select required value={d.productoId} onChange={e => cambiarDetalle(i, 'productoId', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ width: 80, marginBottom: 0 }}>
                <label>Cant.</label>
                <input type="number" min="1" required value={d.cantidad} onChange={e => cambiarDetalle(i, 'cantidad', e.target.value)} />
              </div>
              <div className="form-group" style={{ width: 110, marginBottom: 0 }}>
                <label>P/ Compra ($)</label>
                <input type="number" step="0.01" min="0.01" required value={d.precio} onChange={e => cambiarDetalle(i, 'precio', e.target.value)} />
              </div>
              <div className="form-group" style={{ width: 110, marginBottom: 0 }}>
                <label>P/ Venta ($)</label>
                <input type="number" step="0.01" min="0.01" required value={d.precioVenta} onChange={e => cambiarDetalle(i, 'precioVenta', e.target.value)} />
              </div>
              <button type="button" className="btn-icon delete" onClick={() => quitarDetalle(i)}>
                <i className="fa-solid fa-minus-circle"></i>
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarDetalle} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 500, marginBottom: 15 }}>
            <i className="fa-solid fa-plus"></i> Agregar producto
          </button>
          
          <div className="form-group" style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
              <input 
                type="checkbox" 
                checked={aplicarIva} 
                onChange={(e) => setAplicarIva(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Aplicar IVA ({ivaParam}%)</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '0.95em', marginBottom: '5px' }}>
              <span>Subtotal:</span>
              <span>${totalesActuales.subtotal.toFixed(2)}</span>
            </div>
            {aplicarIva && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontSize: '0.95em', marginBottom: '5px' }}>
                <span>IVA ({ivaParam}%):</span>
                <span>+ ${totalesActuales.ivaCalculado.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', fontWeight: 'bold', color: '#111827', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #d1d5db' }}>
              <span>Total a Pagar:</span>
              <span>${totalesActuales.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Registrar Compra')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODALES SECUNDARIOS */}
      <Modal open={nuevoProveedorModal} title="Nuevo Proveedor" onClose={() => setNuevoProveedorModal(false)}>
        <form onSubmit={crearProveedor}>
          <div className="form-group">
            <label>Nombre del Proveedor</label>
            <input required value={formProveedor.nombre} onChange={e => setFormProveedor({ ...formProveedor, nombre: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formProveedor.email} onChange={e => setFormProveedor({ ...formProveedor, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={formProveedor.telefono} onChange={e => setFormProveedor({ ...formProveedor, telefono: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setNuevoProveedorModal(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={submittingProveedor}>
              {submittingProveedor ? 'Guardando...' : 'Crear Proveedor'}
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
            <button type="submit" className="btn-submit" disabled={submittingCategoria}>
              {submittingCategoria ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={nuevoProductoModal} title="Nuevo Producto" onClose={() => setNuevoProductoModal(false)}>
        <form onSubmit={crearProducto}>
          <div className="form-group">
            <label>Nombre</label>
            <input required value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select required value={formProducto.categoriaId} onChange={e => setFormProducto({ ...formProducto, categoriaId: e.target.value })}>
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Precio de Compra ($)</label>
              <input type="number" step="0.01" min="0.01" required value={formProducto.precioCompra} onChange={e => setFormProducto({ ...formProducto, precioCompra: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Precio de Venta ($)</label>
              <input type="number" step="0.01" min="0.01" required value={formProducto.precio} onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setNuevoProductoModal(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={submittingProducto}>
              {submittingProducto ? 'Guardando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};
