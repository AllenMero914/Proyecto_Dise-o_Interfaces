import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../../modules/landing/components/Navbar';
import { Footer } from '../../modules/landing/components/Footer';

export const LandingLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer simple={!isHome} />
    </>
  );
};
