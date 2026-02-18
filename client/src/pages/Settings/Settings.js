import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { FiUser, FiLock, FiSun, FiMoon, FiAlertTriangle } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Estado para edição de perfil
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Estado para alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Estado para exclusão de conta
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const result = await api.updateProfile(token, name, email);
      if (result.error) {
        setProfileMessage({ type: 'error', text: result.error });
      } else {
        setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await api.changePassword(token, currentPassword, newPassword);
      if (result.error) {
        setPasswordMessage({ type: 'error', text: result.error });
      } else {
        setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Erro ao alterar senha' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Digite sua senha para confirmar a exclusão');
      return;
    }

    setDeleteLoading(true);

    try {
      const result = await api.deleteAccount(token, deletePassword);
      if (result.error) {
        alert(result.error);
        setDeleteLoading(false);
      } else {
        alert('Conta excluída com sucesso. Você será redirecionado.');
        logout();
      }
    } catch (error) {
      alert('Erro ao excluir conta');
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
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
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
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
      </div>
    </Layout>
  );
};

export default Settings;
