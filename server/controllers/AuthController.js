const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validar dados
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = await User.create(name, email, hashedPassword);

      // Gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar dados
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      // Buscar usuário
      const user = await User.findByEmail(email);
      
      // Sempre retorna sucesso para não revelar se email existe
      if (!user) {
        return res.json({ 
          message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' 
        });
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Token expira em 1 hora
      const expires = new Date(Date.now() + 3600000).toISOString();

      // Salvar token no banco
      await User.setResetToken(user.id, hashedToken, expires);

      // Gerar URL de reset
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `${req.protocol}://${req.get('host')}`
        : 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

      // Enviar email
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken, resetUrl);

      res.json({ 
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' 
      });
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      // Hash do token recebido para comparar com o salvo no banco
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar usuário pelo token
      const user = await User.findByResetToken(hashedToken);
      
      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Atualizar senha e limpar token
      await User.updatePassword(user.id, hashedPassword);

      res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }

  static async validateResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ valid: false, error: 'Token é obrigatório' });
      }

      // Hash do token recebido
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar usuário pelo token
      const user = await User.findByResetToken(hashedToken);
      
      if (!user) {
        return res.status(400).json({ valid: false, error: 'Token inválido ou expirado' });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error('Erro ao validar token:', error);
      res.status(500).json({ valid: false, error: 'Erro ao validar token' });
    }
  }
}

module.exports = AuthController;
