import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { api } from '../../../core/api/api';
import { useAuth } from '../../../core/context/AuthContext';

interface ParametroDTO {
  id?: number;
  clave: string;
  valor: string;
  descripcion: string;
}

export const Configuracion: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for IVA
  const [ivaValue, setIvaValue] = useState<string>('');

  const loadData = async () => {
    try {
      const data = await api.get<ParametroDTO[]>('/parametros');
      
      const ivaParam = data.find(p => p.clave === 'IVA');
      if (ivaParam) {
        setIvaValue(ivaParam.valor);
      }
    } catch (error) {
      console.error('Error loading parameters', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveIva = async () => {
    const numValue = parseFloat(ivaValue);
    if (isNaN(numValue) || numValue < 0 || numValue > 20) {
      alert('El valor del IVA debe estar entre 0 y 20');
      return;
    }

    setSaving(true);
    try {
      await api.put('/parametros/IVA', {
        clave: 'IVA',
        valor: numValue.toString(),
        descripcion: 'Porcentaje de Impuesto al Valor Agregado'
      });
      alert('IVA actualizado correctamente');
      loadData();
    } catch (error: any) {
      alert(error.message || 'Error al actualizar el IVA');
    } finally {
      setSaving(false);
    }
  };

  if (user?.rol === 'VENDEDOR') {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '2rem', color: '#374151', marginBottom: '10px' }}>Acceso Restringido</h2>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Tu rol de Vendedor no tiene permisos para acceder a este módulo.</p>
      </main>
    );
  }

  return (
    <main className="main-content">
      <Topbar
        title="Configuración del Sistema"
        subtitle="Parametriza los valores globales de ProFact"
        searchPlaceholder="Buscar configuración..."
      />

      <section className="table-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="table-header">
          <h2>Parámetros Globales</h2>
        </div>
        
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Cargando...</p>
        ) : (
          <div style={{ padding: '20px' }}>
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Impuesto al Valor Agregado (IVA %)
              </label>
              <p style={{ color: '#6b7280', fontSize: '0.9em', marginBottom: '15px' }}>
                Define el porcentaje de IVA por defecto a aplicar en las ventas y compras (entre 0 y 20).
              </p>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  min="0" 
                  max="20" 
                  value={ivaValue} 
                  onChange={(e) => setIvaValue(e.target.value)} 
                  style={{ width: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <button 
                  onClick={handleSaveIva} 
                  disabled={saving}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: saving ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar IVA'}
                </button>
              </div>
            </div>

            <hr style={{ borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#9ca3af' }}>
                Próximamente
              </label>
              <p style={{ color: '#6b7280', fontSize: '0.9em' }}>
                Aquí se podrán configurar otros parámetros como la moneda y el nombre de la empresa.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
