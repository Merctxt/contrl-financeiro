import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiHome, 
  FiDollarSign, 
  FiTag, 
  FiBarChart2, 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiLogOut, 
  FiTarget,
  FiCheckCircle,
  FiX,
  FiSmartphone,
  FiDownload
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já fechou o popup
    const popupClosed = localStorage.getItem('mobileAppPopupClosed');
    if (!popupClosed) {
      setShowPopup(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    localStorage.setItem('mobileAppPopupClosed', 'true');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FiCheckCircle className="logo-icon" />
          <span className="logo-text">Organiza Aí</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiHome className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiDollarSign className="nav-icon" />
          <span>Transações</span>
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiTag className="nav-icon" />
          <span>Categorias</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiBarChart2 className="nav-icon" />
          <span>Relatórios</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiSettings className="nav-icon" />
          <span>Configurações</span>
        </NavLink>

        <button onClick={handleLogout} className="nav-item nav-item-logout" title="Sair">
          <FiLogOut className="nav-icon" />
          <span>Sair</span>
        </button>
      </nav>

      {showPopup && (
        <div className='sidebar-popup'>
          <button className='popup-close' onClick={handleClosePopup} title="Fechar">
            <FiX />
          </button>
          <div className='popup-icon'>
            <FiSmartphone />
          </div>
          <h3>Novidades!</h3>
          <p>Agora temos um <strong>app Android</strong>!</p>
          <p className='popup-description'>
            Gerencie suas finanças direto do seu celular
          </p>
          <a 
            href="https://github.com/Merctxt/contrl-financeiro/releases" 
            target="_blank" 
            rel="noopener noreferrer"
            className='popup-button'
          >
            <FiDownload /> Baixar App
          </a>
        </div>
      )}

      <div className="sidebar-footer">
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Usuário'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <FiLogOut />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
