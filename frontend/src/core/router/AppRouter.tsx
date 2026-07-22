import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingLayout } from '../layouts/LandingLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Landing Pages
import { InicioLanding } from '../../modules/landing/pages/InicioLanding';
import { Nosotros } from '../../modules/landing/pages/Nosotros';
import { Planes } from '../../modules/landing/pages/Planes';
import { Capacitacion } from '../../modules/landing/pages/Capacitacion';
import { Sesion } from '../../modules/landing/pages/Sesion';

// Dashboard Pages
import { InicioDashboard } from '../../modules/dashboard/pages/InicioDashboard';
import { Compras } from '../../modules/dashboard/pages/Compras';
import { Ventas } from '../../modules/dashboard/pages/Ventas';
import { Inventario } from '../../modules/dashboard/pages/Inventario';
import { Reportes } from '../../modules/dashboard/pages/Reportes';
import { Usuarios } from '../../modules/dashboard/pages/Usuarios';
import { Clientes } from '../../modules/dashboard/pages/Clientes';
import { Proveedores } from '../../modules/dashboard/pages/Proveedores';
import { Configuracion } from '../../modules/dashboard/pages/Configuracion';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Módulo Público (Landing Page) */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<InicioLanding />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/capacitacion" element={<Capacitacion />} />
      </Route>

      {/* Sesión - Standalone (Sin Layout de Landing) */}
      <Route path="/sesion" element={<Sesion />} />

      {/* Módulo Privado (Dashboard) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<InicioDashboard />} />
        <Route path="compras" element={<Compras />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
