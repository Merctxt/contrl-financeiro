import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const useLoginLogic = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados para modal de recuperação de senha
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage({ type: '', text: '' });

    try {
      const result = await api.forgotPassword(forgotEmail);
      if (result.error) {
        setForgotMessage({ type: 'error', text: result.error });
      } else {
        setForgotMessage({ 
          type: 'success', 
          text: 'Se o email estiver cadastrado, você receberá um link de recuperação em breve.' 
        });
        // Limpar campo após sucesso
        setTimeout(() => {
          setForgotEmail('');
        }, 3000);
      }
    } catch (err) {
      setForgotMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotMessage({ type: '', text: '' });
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
  };

  return {
    // Login state
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    // Forgot password state
    showForgotModal,
    forgotEmail,
    setForgotEmail,
    forgotLoading,
    forgotMessage,
    handleForgotPassword,
    closeForgotModal,
    openForgotModal,
  };
};
