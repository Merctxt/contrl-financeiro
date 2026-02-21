import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../Sidebar/Sidebar';
import { FiLogOut } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children, showMobileLogout = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
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
