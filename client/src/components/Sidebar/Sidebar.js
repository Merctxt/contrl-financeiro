import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

import { 
  FiHome, 
  FiDollarSign, 
  FiCalendar,
  FiBarChart2, 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiLogOut, 
  FiTarget,
  FiCheckCircle,
  FiX,
  FiSmartphone,
  FiDownload,
  FiMenu
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FiCheckCircle className="logo-icon" />
          <span className="logo-text">Organiza Aí</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? "Expandir" : "Recolher"}>
          <FiMenu />
        </button>
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

        <NavLink to="/budget" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiCalendar className="nav-icon" />
          <span>Planejamento</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiBarChart2 className="nav-icon" />
          <span>Relatórios</span>
        </NavLink>

        <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiTarget className="nav-icon" />
          <span>Metas</span>
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
