import React, { useEffect, useState, useMemo } from 'react';

import { api } from '../../../core/api/api';
import type { VentaDTO, CompraDTO } from '../../../core/api/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { format, getWeek, getYear, getMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../core/context/AuthContext';
import './Reportes.css';

export const Reportes: React.FC = () => {
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

  const [ventas, setVentas] = useState<VentaDTO[]>([]);
  const [compras, setCompras] = useState<CompraDTO[]>([]);
  const [filtro, setFiltro] = useState<'SEMANAL' | 'MENSUAL' | 'ANUAL'>('MENSUAL');

  const load = async () => {
    try {
      const [v, c] = await Promise.all([
        api.get<VentaDTO[]>('/ventas'),
        api.get<CompraDTO[]>('/compras'),
      ]);
      setVentas(v);
      setCompras(c);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      console.error('Error cargando reportes:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const { dataGrafica, topProductos, transaccionesRecientes, totales } = useMemo(() => {
    // 1. Datos para las gráficas principales
    const grouped = new Map<string, { label: string, Ingresos: number, Gastos: number, orden: number, VentasCount: number }>();

    const agregarDato = (fechaStr: string, monto: number, tipo: 'ingreso' | 'gasto', esVenta = false) => {
      if (!fechaStr) return;
      const d = new Date(fechaStr);
      let key = '';
      let label = '';
      let orden = 0;

      if (filtro === 'SEMANAL') {
        const year = getYear(d);
        const week = getWeek(d);
        key = `${year}-W${week}`;
        const inicio = startOfWeek(d, { weekStartsOn: 1 });
        label = `${format(inicio, 'dd MMM', { locale: es })}`;
        orden = d.getTime(); 
      } else if (filtro === 'MENSUAL') {
        const year = getYear(d);
        const month = getMonth(d);
        key = `${year}-${month}`;
        label = format(d, 'MMM yyyy', { locale: es });
        label = label.charAt(0).toUpperCase() + label.slice(1);
        orden = year * 100 + month;
      } else {
        const year = getYear(d);
        key = `${year}`;
        label = `${year}`;
        orden = year;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { label, Ingresos: 0, Gastos: 0, orden, VentasCount: 0 });
      }
      const item = grouped.get(key)!;
      if (tipo === 'ingreso') {
        item.Ingresos += monto;
        if (esVenta) item.VentasCount += 1;
      } else {
        item.Gastos += monto;
      }
    };

    ventas.forEach(v => agregarDato(v.fecha, v.total, 'ingreso', true));
    compras.forEach(c => agregarDato(c.fecha, c.total, 'gasto'));

    const arrGrafica = Array.from(grouped.values()).sort((a, b) => a.orden - b.orden);

    // 2. Top Productos (sacados de ventas)
    const productCount: Record<string, number> = {};
    ventas.forEach(v => {
      v.detalles?.forEach(d => {
        productCount[d.productoNombre] = (productCount[d.productoNombre] || 0) + d.cantidad;
      });
    });
    
    const topProdList = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, qty]) => ({ name, qty }));
      
    const maxQty = topProdList.length > 0 ? topProdList[0].qty : 1;
    const topProductos = topProdList.map(p => ({
      ...p,
      percent: Math.min(100, Math.round((p.qty / maxQty) * 100))
    }));

    // 3. Transacciones Recientes (combinar ventas y compras)
    const transVentas = ventas.map(v => ({ id: v.id, tipo: 'Venta', fecha: new Date(v.fecha), monto: v.total, ref: v.clienteNombre || 'Cliente' }));
    const transCompras = compras.map(c => ({ id: c.id, tipo: 'Compra', fecha: new Date(c.fecha), monto: c.total, ref: c.proveedorNombre || 'Proveedor' }));
    
    const transaccionesRecientes = [...transVentas, ...transCompras]
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 6);

    // Totales Globales
    const totalIng = arrGrafica.reduce((sum, item) => sum + item.Ingresos, 0);
    const totalGas = arrGrafica.reduce((sum, item) => sum + item.Gastos, 0);
    const beneficio = totalIng - totalGas;
    
    return { dataGrafica: arrGrafica, topProductos, transaccionesRecientes, totales: { ingresos: totalIng, gastos: totalGas, beneficio } };
  }, [ventas, compras, filtro]);

  const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981']; 
  const pieData = [
    { name: 'Gastos', value: totales.gastos },
    { name: 'Beneficio', value: totales.beneficio > 0 ? totales.beneficio : 0 }
  ];
  const pieColors = ['#f87171', '#34d399'];
  const profitPercentage = totales.ingresos > 0 ? Math.round(((totales.ingresos - totales.gastos) / totales.ingresos) * 100) : 0;

  return (
    <main className="main-content" style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: '#1f2937', margin: 0 }}>Dashboard Analytics</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>Visión general del rendimiento del negocio</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#e5e7eb', padding: '4px', borderRadius: '24px' }}>
            <button onClick={() => setFiltro('SEMANAL')} className={`btn-filter ${filtro === 'SEMANAL' ? 'active' : ''}`}>Semanal</button>
            <button onClick={() => setFiltro('MENSUAL')} className={`btn-filter ${filtro === 'MENSUAL' ? 'active' : ''}`}>Mensual</button>
            <button onClick={() => setFiltro('ANUAL')} className={`btn-filter ${filtro === 'ANUAL' ? 'active' : ''}`}>Anual</button>
        </div>
      </div>

      <div className="report-dashboard-grid">
        
        {/* ROW 1: Detailed Chart 01 & Average Charts */}
        <div className="report-card col-span-2 row-span-1">
          <h3 className="card-title">Detailed Chart 01</h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <LineChart data={dataGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="Ingresos" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Gastos" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-card col-span-1 row-span-1">
          <h3 className="card-title">Average Charts (Top Productos)</h3>
          <div className="progress-bars-container">
            {topProductos.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px', fontSize: '13px' }}>No hay ventas aún.</p>
            ) : (
              topProductos.map((p, idx) => (
                <div key={idx} className="progress-bar-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: '#4b5563' }}>
                    <span>{p.name.substring(0,25)}</span>
                    <span style={{ fontWeight: '600' }}>{p.qty} unds</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${p.percent}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ROW 2: KPI Cards */}
        <div className="report-card kpi-card blue-kpi">
          <div className="kpi-info">
            <h4>Earnings</h4>
            <h2>${totales.ingresos.toFixed(0)}</h2>
            <p>Ingresos Totales</p>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafica}>
                <Area type="monotone" dataKey="Ingresos" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-card kpi-card orange-kpi">
          <div className="kpi-info">
            <h4>Downloads</h4>
            <h2>{ventas.length}</h2>
            <p>Ventas Realizadas</p>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafica}>
                <Area type="monotone" dataKey="VentasCount" stroke="#d97706" fill="#f59e0b" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-card kpi-card green-kpi">
          <div className="kpi-info">
            <h4>Favorites</h4>
            <h2>${totales.beneficio.toFixed(0)}</h2>
            <p>Beneficio Neto</p>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafica.map(d => ({ ...d, Beneficio: d.Ingresos - d.Gastos }))}>
                <Area type="monotone" dataKey="Beneficio" stroke="#059669" fill="#10b981" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 3: Donut, Bar Chart, Recent News */}
        <div className="report-card col-span-1 row-span-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="card-title" style={{ width: '100%', textAlign: 'left' }}>Profile Strength</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px', marginTop: '10px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-text">
              <span className="donut-value">{profitPercentage}%</span>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px' }}>Margen de ganancia estimado</p>
        </div>

        <div className="report-card col-span-1 row-span-1">
          <h3 className="card-title">Detailed Chart 02</h3>
          <div style={{ width: '100%', height: '220px', marginTop: '10px' }}>
            <ResponsiveContainer>
              <BarChart data={dataGrafica} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* This takes 1 column width, but spans 3 rows starting from top right */}
        <div className="report-card recent-news-card row-span-3">
          <h3 className="card-title" style={{ marginBottom: '15px' }}>Recently News</h3>
          <div className="news-list">
            {transaccionesRecientes.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>No hay actividad reciente.</p>
            ) : (
              transaccionesRecientes.map((t, i) => (
                <div key={i} className="news-item">
                  <div className="news-item-header">
                    <span className="news-title">{t.tipo} - {t.ref.substring(0,12)}</span>
                    <span className="news-time">{format(t.fecha, 'dd MMM, HH:mm', { locale: es })}</span>
                  </div>
                  <p className="news-desc">
                    Se registró {t.tipo === 'Venta' ? 'un ingreso' : 'un gasto'} por <strong>${t.monto.toFixed(2)}</strong>.
                  </p>
                </div>
              ))
            )}
          </div>
          <button 
            className="export-btn" 
            onClick={() => {
              const csv = 'Periodo,Ingresos,Gastos,Beneficio\n' + 
                dataGrafica.map(r => `${r.label},${r.Ingresos.toFixed(2)},${r.Gastos.toFixed(2)},${(r.Ingresos - r.Gastos).toFixed(2)}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `reporte_financiero_${filtro.toLowerCase()}.csv`; a.click(); URL.revokeObjectURL(url);
            }}
          >
            Exportar CSV
          </button>
        </div>

      </div>
    </main>
  );
};
