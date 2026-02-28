import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../Sidebar/Sidebar';
import { FiLogOut } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children, showMobileLogout = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    // Listener para mudanças no localStorage (quando a sidebar é colapsada/expandida)
    const handleStorageChange = () => {
      setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    };

    // Verificar a cada 1000ms (1 segundo)
    const interval = setInterval(handleStorageChange, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      {showMobileLogout && (
        <button className="mobile-logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Sair</span>
        </button>
      )}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
