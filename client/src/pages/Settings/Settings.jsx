import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { FiUser, FiLock, FiSun, FiMoon, FiAlertTriangle, FiSmartphone, FiDownload, FiMonitor, FiLogOut, FiMessageSquare, FiEdit, FiShield } from 'react-icons/fi';
import packageJson from '../../../package.json';
import { useSettingsLogic, formatDate } from './Settings.logic';
import './Settings.css';

const Settings = () => {
  const {
    // Theme
    theme,
    toggleTheme,
    
    // Profile
    name,
    setName,
    email,
    setEmail,
    profileLoading,
    profileMessage,
    handleUpdateProfile,
    
    // Password
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    passwordMessage,
    handleChangePassword,
    
    // Delete Account
    deletePassword,
    setDeletePassword,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteLoading,
    handleDeleteAccount,
    handleCancelDelete,
    
    // Sessions
    sessions,
    sessionsLoading,
    revokeLoading,
    handleRevokeSession,
    handleRevokeOtherSessions
  } = useSettingsLogic();

  return (
    <Layout showMobileLogout={true}>
      <div className="settings-page fade-in">
        <div className="page-header">
          <div>
            <h1>Configurações</h1>
            <p>Gerencie sua conta e preferências</p>
          </div>
        </div>

        <div className="settings-grid">
          {/* Dados do Perfil */}
          <div className="card settings-card">
            <h3><FiUser /> Dados do Perfil</h3>
            {profileMessage.text && (
              <div className={`message ${profileMessage.type}`}>
                {profileMessage.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>

          {/* Alterar Senha */}
          <div className="card settings-card">
            <h3><FiLock /> Alterar Senha</h3>
            {passwordMessage.text && (
              <div className={`message ${passwordMessage.type}`}>
                {passwordMessage.text}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Senha Atual</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          </div>

          {/* Sessões Ativas */}
          <div className="card settings-card sessions-card">
            <h3><FiMonitor /> Sessões Ativas</h3>
            {sessionsLoading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <p className="sessions-info">
                  Você está logado em <strong>{sessions.length} dispositivo(s)</strong>
                </p>
                
                <div className="sessions-list">
                  {sessions.map((session) => (
                    <div key={session.id} className={`session-item ${session.is_current ? 'current' : ''}`}>
                      <div className="session-icon">
                        <FiMonitor />
                      </div>
                      <div className="session-info">
                        <div className="session-device">
                          {session.device_info}
                          {session.is_current && <span className="badge-current">Atual</span>}
                        </div>
                        <div className="session-details">
                          <span>IP: {session.ip_address}</span>
                          <span>Última atividade: {formatDate(session.last_activity)}</span>
                        </div>
                      </div>
                      {!session.is_current && (
                        <button
                          className="btn-revoke"
                          onClick={() => handleRevokeSession(session.id)}
                          title="Encerrar sessão"
                        >
                          <FiLogOut />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {sessions.length > 1 && (
                  <button
                    className="btn btn-danger btn-revoke-all"
                    onClick={handleRevokeOtherSessions}
                    disabled={revokeLoading}
                  >
                    <FiLogOut /> {revokeLoading ? 'Encerrando...' : 'Encerrar Outras Sessões'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Aparência */}
          <div className="card settings-card">
            <h3>{theme === 'dark' ? <FiMoon /> : <FiSun />} Aparência</h3>
            <div className="theme-toggle">
              <div className="theme-info">
                <span className="theme-label">Modo Escuro</span>
                <span className="theme-description">
                  {theme === 'dark' 
                    ? 'O modo escuro está ativado' 
                    : 'Ative para reduzir o cansaço visual'}
                </span>
              </div>
              <button 
                className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>

          {/* Sugestões e reporte de bugs */}
          <div className="card settings-card">
            <h3><FiMessageSquare /> Sugestões e Reporte de Bugs</h3>
            <p className="suggestions-text">
              Tem alguma sugestão ou encontrou um bug? Nos informe para que possamos melhorar!
            </p>
            <a 
              href="https://forms.gle/ThHr1HcfRW1tBF7s7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <FiEdit /> Enviar Sugestão / Reportar Bug
            </a>
          </div>

          {/* Informações do dispositivo */}
          <div className="card settings-card">
            <h3><FiMonitor /> Informações do Dispositivo</h3>
            <p className="system-info">
              <strong>Versão do App:</strong> {packageJson.version}<br />
              <strong>Status:</strong> <span style={{ color: 'green' }}>Online</span><br />
              <strong>Dispositivo:</strong> {navigator.userAgent || 'Desconhecido'}
            </p>
          </div>
        

          {/* Zona de Perigo */}
          <div className="card settings-card danger-zone">
            <h3><FiAlertTriangle /> Zona de Perigo</h3>
            <p className="danger-text">
              Atenção: Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
            </p>
            
            {!showDeleteConfirm ? (
              <button 
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Excluir Minha Conta
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Para confirmar, digite sua senha:</p>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Sua senha"
                  />
                </div>
                <div className="delete-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancelDelete}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <Link to="/privacy-policy" className="privacy-link">
            <FiShield /> Política de Privacidade
          </Link>
          <span className="version-info">Versão {packageJson.version}</span>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
