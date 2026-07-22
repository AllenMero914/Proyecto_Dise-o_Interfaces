import React from 'react';

import { useAuth } from '../../../core/context/AuthContext';
import adminAvatar from '../../../assets/dashboard-images/global-admin-icon-color-outline-vector.jpg';

interface TopbarProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  searchPlaceholder = 'Buscar...',
  onSearch,
}) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-text">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder={searchPlaceholder} onChange={e => onSearch?.(e.target.value)} />
        </div>
        <div className="admin-box" style={{ cursor: 'default' }}>
          <img src={adminAvatar} alt="Usuario" />
          <div>
            <h4>{user?.nombre || 'Usuario'}</h4>
            <span>{user?.rol || 'Rol'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
