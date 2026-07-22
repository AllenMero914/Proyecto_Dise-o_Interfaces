import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Modal } from '../../../core/components/Modal';
import { api } from '../../../core/api/api';
import type { VentaDTO, ProductoDTO, ClienteDTO } from '../../../core/api/api';
import jsPDF from 'jspdf';

import logoProFact from '../../../assets/images/logoProFact.png';

export const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<VentaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [detalles, setDetalles] = useState<{ productoId: string; cantidad: string }[]>([
    { productoId: '', cantidad: '1' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  
  const [ivaParam, setIvaParam] = useState<number>(0);
  const [aplicarIva, setAplicarIva] = useState(false);

  const [nuevoClienteModal, setNuevoClienteModal] = useState(false);
  const [formCliente, setFormCliente] = useState({ nombre: '', identificacion: '', email: '', telefono: '' });
  const [submittingCliente, setSubmittingCliente] = useState(false);

  const load = async () => {
    try {
      const [v, p, c, params] = await Promise.all([
        api.get<VentaDTO[]>('/ventas'),
        api.get<ProductoDTO[]>('/productos'),
        api.get<ClienteDTO[]>('/clientes'),
        api.get<any[]>('/parametros').catch(() => [])
      ]);
      setVentas(v);
      setProductos(p.filter(pr => pr.activo && pr.stock > 0));
      setClientes(c);
      
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
    setClienteSeleccionado('');
    setDetalles([{ productoId: '', cantidad: '1' }]);
    setAplicarIva(false);
    setModalOpen(true);
  };

  const openEdit = (venta: VentaDTO) => {
    setEditandoId(venta.id);
    setClienteSeleccionado(venta.clienteId ? String(venta.clienteId) : '');
    setAplicarIva(venta.iva > 0);
    if (venta.detalles && venta.detalles.length > 0) {
      setDetalles(venta.detalles.map(d => ({
        productoId: String(d.productoId),
        cantidad: String(d.cantidad)
      })));
    } else {
      setDetalles([{ productoId: '', cantidad: '1' }]);
    }
    setModalOpen(true);
  };

  const cambiarDetalle = (i: number, field: 'productoId' | 'cantidad', value: string) => {
    const copy = [...detalles];
    copy[i] = { ...copy[i], [field]: value };
    setDetalles(copy);
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, { productoId: '', cantidad: '1' }]);
  };

  const quitarDetalle = (i: number) => {
    if (detalles.length > 1) setDetalles(detalles.filter((_, idx) => idx !== i));
  };

  const calcularTotales = () => {
    const subtotal = detalles.reduce((sum, d) => {
      const p = productos.find(pr => pr.id === parseInt(d.productoId));
      return sum + (p ? p.precio * parseInt(d.cantidad || '0') : 0);
    }, 0);
    const ivaCalculado = aplicarIva ? subtotal * (ivaParam / 100) : 0;
    const total = subtotal + ivaCalculado;
    return { subtotal, ivaCalculado, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        clienteId: parseInt(clienteSeleccionado),
        aplicarIva,
        detalles: detalles.map(d => ({
          productoId: parseInt(d.productoId),
          cantidad: parseInt(d.cantidad),
        })),
      };
      if (editandoId) {
        await api.put(`/ventas/${editandoId}`, payload);
      } else {
        await api.post('/ventas', payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar venta');
    } finally {
      setSubmitting(false);
    }
  };

  const crearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCliente(true);
    try {
      await api.post('/clientes', { ...formCliente, activo: true });
      setNuevoClienteModal(false);
      setFormCliente({ nombre: '', identificacion: '', email: '', telefono: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setSubmittingCliente(false);
    }
  };

  const generarFactura = async (venta: VentaDTO) => {
    const doc = new jsPDF();

    // Top Left (Logo and title)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ProFact', 14, 15);
    
    try {
      const img = new Image();
      img.src = logoProFact;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      doc.addImage(img, 'PNG', 14, 18, 25, 25 * (img.height / img.width));
    } catch (e) {
      console.error("Error cargando el logo", e);
    }

    // Title 'Nota de Entrega'
    doc.setFontSize(14);
    doc.text('Nota de Entrega', 100, 25, { align: 'center' });

    // Top Right Address & Grid
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const addressX = 136;
    doc.text('10470 NW 26 Street', addressX, 15);
    doc.text('Doral, Florida 33172', addressX, 19);
    doc.text('0241-8963254', addressX, 23);

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(addressX, 28, 60, 12);
    doc.line(addressX, 34, addressX + 60, 34);
    doc.line(addressX + 30, 28, addressX + 30, 40);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date', addressX + 15, 32, { align: 'center' });
    doc.text('Invoice #', addressX + 45, 32, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    const invoiceDate = new Date(venta.fecha).toLocaleDateString();
    doc.text(invoiceDate, addressX + 15, 38, { align: 'center' });
    const invoiceId = venta.id.toString().padStart(8, '0');
    doc.text(invoiceId, addressX + 45, 38, { align: 'center' });

    // Bill To / Ship To
    const startY = 48;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Bill To', 14, startY);
    doc.text('Ship To', 105, startY);

    doc.rect(14, startY + 2, 88, 20);
    doc.rect(105, startY + 2, 91, 20);

    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${venta.clienteNombre || 'Consumidor Final'}`, 16, startY + 8);
    doc.text(`CI/RUC: ${venta.clienteIdentificacion || '9999999999'}`, 16, startY + 14);

    // Meta Info Row
    const metaY = 75;
    doc.setFont('helvetica', 'bold');
    doc.text('P.O Number', 27, metaY, { align: 'center' });
    doc.text('Terms', 60, metaY, { align: 'center' });
    doc.text('Rep', 95, metaY, { align: 'center' });
    doc.text('Via', 127, metaY, { align: 'center' });
    doc.text('Vendedor', 162, metaY, { align: 'center' });

    const metaBoxY = metaY + 2;
    doc.rect(14, metaBoxY, 182, 6);
    doc.line(40, metaBoxY, 40, metaBoxY + 6);
    doc.line(80, metaBoxY, 80, metaBoxY + 6);
    doc.line(110, metaBoxY, 110, metaBoxY + 6);
    doc.line(145, metaBoxY, 145, metaBoxY + 6);

    doc.setFont('helvetica', 'normal');
    doc.text('', 27, metaBoxY + 4.5, { align: 'center' });
    doc.text('CONTADO', 60, metaBoxY + 4.5, { align: 'center' });
    doc.text('', 95, metaBoxY + 4.5, { align: 'center' });
    doc.text('', 127, metaBoxY + 4.5, { align: 'center' });
    doc.text(venta.vendedor.substring(0, 20), 162, metaBoxY + 4.5, { align: 'center' });

    // Table
    const tableStartY = 92;
    const tableEndY = 250;
    
    const drawTableGrid = () => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(14, tableStartY, 182, tableEndY - tableStartY);
      doc.line(14, tableStartY + 8, 196, tableStartY + 8);
      
      const col1 = 34; // Quantity
      const col2 = 64; // P.Unit
      const col3 = 160; // Description
      doc.line(col1, tableStartY, col1, tableEndY);
      doc.line(col2, tableStartY, col2, tableEndY);
      doc.line(col3, tableStartY, col3, tableEndY);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Quantity', 24, tableStartY + 5, { align: 'center' });
      doc.text('P.Unit', 49, tableStartY + 5, { align: 'center' });
      doc.text('Description', 112, tableStartY + 5, { align: 'center' });
      doc.text('Amount', 178, tableStartY + 5, { align: 'center' });
    };

    drawTableGrid();

    doc.setFont('helvetica', 'normal');
    let currentY = tableStartY + 14;
    
    venta.detalles.forEach(d => {
      if (currentY > tableEndY - 5) {
        doc.addPage();
        drawTableGrid();
        currentY = tableStartY + 14;
      }
      doc.text(d.cantidad.toString(), 24, currentY, { align: 'center' });
      doc.text(`$${d.precioUnitario.toFixed(2)}`, 49, currentY, { align: 'center' });
      doc.text(d.productoNombre.substring(0, 55), 66, currentY); 
      doc.text(`$${d.subtotal.toFixed(2)}`, 178, currentY, { align: 'center' });
      currentY += 6;
    });

    // Totals Box
    doc.rect(14, tableEndY, 182, 25);
    doc.line(140, tableEndY, 140, tableEndY + 25); 
    
    doc.setFont('helvetica', 'bold');
    doc.text('Note:', 16, tableEndY + 5);
    
    doc.text('Subtotal:', 145, tableEndY + 6);
    doc.text(`$${(venta.subtotal || 0).toFixed(2)}`, 192, tableEndY + 6, { align: 'right' });
    
    if (venta.iva && venta.iva > 0) {
      doc.text('IVA:', 145, tableEndY + 12);
      doc.text(`$${venta.iva.toFixed(2)}`, 192, tableEndY + 12, { align: 'right' });
      
      doc.text('Total:', 145, tableEndY + 20);
      doc.text(`$${venta.total.toFixed(2)}`, 192, tableEndY + 20, { align: 'right' });
    } else {
      doc.text('Total:', 145, tableEndY + 14);
      doc.text(`$${venta.total.toFixed(2)}`, 192, tableEndY + 14, { align: 'right' });
    }

    doc.save(`factura_${venta.id}.pdf`);
  };

  const ingresos = ventas.reduce((s, v) => s + v.total, 0);
  const totalVentas = ventas.length;

  const totalesActuales = calcularTotales();

  return (
    <main className="main-content">
      <Topbar title="Gestión de Ventas" subtitle="Controla todas las ventas y facturación del negocio" searchPlaceholder="Buscar venta..." />

      <section className="cards">
        <div className="card">
          <div className="card-icon blue"><i className="fa-solid fa-dollar-sign"></i></div>
          <div className="card-info"><h2>${ingresos.toFixed(2)}</h2><p>Ingresos Totales</p></div>
        </div>
        <div className="card">
          <div className="card-icon green"><i className="fa-solid fa-receipt"></i></div>
          <div className="card-info"><h2>{totalVentas}</h2><p>Ventas Realizadas</p></div>
        </div>
        <div className="card">
          <div className="card-icon orange"><i className="fa-solid fa-users"></i></div>
          <div className="card-info"><h2>{new Set(ventas.map(v => v.vendedor)).size}</h2><p>Vendedores</p></div>
        </div>
        <div className="card">
          <div className="card-icon red"><i className="fa-solid fa-chart-line"></i></div>
          <div className="card-info"><h2>{ventas.filter(v => v.total > 100).length}</h2><p>Ventas &gt; $100</p></div>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h2>Registro de Ventas</h2>
          <button onClick={openNuevo}><i className="fa-solid fa-plus"></i> Nueva Venta</button>
        </div>
        <div className="table-responsive">
          <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Vendedor</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="loading-cell">Cargando...</td></tr>
            ) : ventas.length === 0 ? (
              <tr><td colSpan={9} className="loading-cell">No hay ventas registradas</td></tr>
            ) : ventas.map(v => (
              <tr key={v.id}>
                <td>#{v.id}</td>
                <td>{v.vendedor}</td>
                <td>{v.clienteNombre || 'N/A'}</td>
                <td>{v.detalles?.map(d => `${d.productoNombre} x${d.cantidad}`).join(', ')}</td>
                <td>${(v.subtotal || v.total).toFixed(2)}</td>
                <td>${(v.iva || 0).toFixed(2)}</td>
                <td><strong>${v.total.toFixed(2)}</strong></td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-icon blue" onClick={() => generarFactura(v)} title="Descargar PDF">
                      <i className="fa-solid fa-file-pdf"></i>
                    </button>
                    <button className="btn-icon orange" onClick={() => openEdit(v)} title="Editar Venta">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editandoId ? "Editar Venta" : "Nueva Venta"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Cliente
              <button type="button" onClick={() => setNuevoClienteModal(true)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                + Nuevo Cliente
              </button>
            </label>
            <select required value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)}>
              <option value="">Seleccione un cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.identificacion})</option>
              ))}
            </select>
          </div>
          {detalles.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 12 }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Producto</label>
                <select required value={d.productoId} onChange={e => cambiarDetalle(i, 'productoId', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (${p.precio.toFixed(2)} · stock: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ width: 100, marginBottom: 0 }}>
                <label>Cant.</label>
                <input type="number" min="1" required value={d.cantidad} onChange={e => cambiarDetalle(i, 'cantidad', e.target.value)} />
              </div>
              <button type="button" className="btn-icon delete" onClick={() => quitarDetalle(i)} style={{ marginBottom: 0 }}>
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
              {submitting ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Registrar Venta')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={nuevoClienteModal} title="Nuevo Cliente" onClose={() => setNuevoClienteModal(false)}>
        <form onSubmit={crearCliente}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input required value={formCliente.nombre} onChange={e => setFormCliente({ ...formCliente, nombre: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label>Identificación (Cédula/RUC)</label>
            <input required value={formCliente.identificacion} onChange={e => setFormCliente({ ...formCliente, identificacion: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formCliente.email} onChange={e => setFormCliente({ ...formCliente, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={formCliente.telefono} onChange={e => setFormCliente({ ...formCliente, telefono: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setNuevoClienteModal(false)}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={submittingCliente}>
              {submittingCliente ? 'Guardando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};
