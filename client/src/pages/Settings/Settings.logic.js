import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const useSettingsLogic = () => {
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

  // Estado para sessões
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Carregar sessões ao montar o componente
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions(token);
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Tem certeza que deseja encerrar esta sessão?')) {
      return;
    }

    try {
      await api.revokeSession(token, sessionId);
      loadSessions();
    } catch (error) {
      console.error('Erro ao revogar sessão:', error);
      alert('Erro ao encerrar sessão');
    }
  };

  const handleRevokeOtherSessions = async () => {
    if (!window.confirm('Tem certeza que deseja encerrar todas as outras sessões?')) {
      return;
    }

    setRevokeLoading(true);
    try {
      const result = await api.revokeOtherSessions(token);
      alert(result.message || 'Outras sessões encerradas com sucesso');
      loadSessions();
    } catch (error) {
      console.error('Erro ao revogar outras sessões:', error);
      alert('Erro ao encerrar sessões');
    } finally {
      setRevokeLoading(false);
    }
  };

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

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  return {
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
  };
};
