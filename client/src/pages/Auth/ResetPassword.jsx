import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiDollarSign, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useResetPasswordLogic } from './ResetPassword.logic';
import './Auth.css';

const ResetPassword = () => {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    validating,
    tokenValid,
    message,
    success,
    handleSubmit,
  } = useResetPasswordLogic();

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
