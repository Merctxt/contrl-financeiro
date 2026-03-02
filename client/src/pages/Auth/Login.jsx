import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiX, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { useLoginLogic } from './Login.logic';
import './Auth.css';

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    showForgotModal,
    forgotEmail,
    setForgotEmail,
    forgotLoading,
    forgotMessage,
    handleForgotPassword,
    closeForgotModal,
    openForgotModal,
  } = useLoginLogic();

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon"><FiCheckCircle /></span>
            <span className="logo-text">Organiza Aí</span>
          </div>
          <h2>Bem-vindo de volta!</h2>
          <p>Entre na sua conta para continuar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
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
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="forgot-password-link">
            <button 
              type="button" 
              className="link-btn"
              onClick={openForgotModal}
            >
              Esqueceu sua senha?
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem uma conta?{' '}
            <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal-content forgot-modal fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Recuperar Senha</h2>
              <button className="close-btn" onClick={closeForgotModal}><FiX /></button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Digite seu email cadastrado e enviaremos um link para você redefinir sua senha.
              </p>

              {forgotMessage.text && (
                <div className={`message ${forgotMessage.type}`}>
                  {forgotMessage.type === 'success' && <FiCheck />}
                  {forgotMessage.text}
                </div>
              )}

              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label htmlFor="forgotEmail">Email</label>
                  <div className="input-with-icon">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      id="forgotEmail"
                      className="form-control"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeForgotModal}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Enviando...' : 'Enviar Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
