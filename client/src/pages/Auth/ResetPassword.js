import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiDollarSign, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import api from '../../services/api';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const result = await api.validateResetToken(token);
      setTokenValid(result.valid);
    } catch (error) {
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      const result = await api.resetPassword(token, password);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setSuccess(true);
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon"><FiDollarSign /></span>
              <span className="logo-text">Organiza Aí</span>
            </div>
            <h2>Verificando...</h2>
            <p>Aguarde enquanto validamos seu link</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon"><FiDollarSign /></span>
              <span className="logo-text">Organiza Aí</span>
            </div>
          </div>

          <div className="token-invalid">
            <div className="invalid-icon">
              <FiAlertTriangle size={48} />
            </div>
            <h2>Link Inválido ou Expirado</h2>
            <p>
              O link de recuperação de senha não é válido ou já expirou. 
              Os links são válidos por apenas 1 hora.
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon"><FiDollarSign /></span>
              <span className="logo-text">Organiza Aí</span>
            </div>
          </div>

          <div className="success-message-box">
            <div className="success-icon">
              <FiCheck size={48} />
            </div>
            <h2>Senha Alterada!</h2>
            <p>
              Sua senha foi alterada com sucesso. 
              Você será redirecionado para o login em instantes...
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Ir para o Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon"><FiDollarSign /></span>
            <span className="logo-text">Organiza Aí</span>
          </div>
          <h2>Redefinir Senha</h2>
          <p>Digite sua nova senha abaixo</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Nova Senha</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Lembrou a senha?{' '}
            <Link to="/login">Fazer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
