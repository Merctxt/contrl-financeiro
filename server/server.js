require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');

// Importar rotas
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');
const sessionRoutes = require('./routes/sessions');
const goalRoutes = require('./routes/goals');
const budgetRoutes = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');

// Inicializar banco de dados
require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Helmet - Headers de segurança HTTP
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false, // Desabilitar CSP em desenvolvimento para facilitar debugging
  crossOriginEmbedderPolicy: false, // Necessário para algumas funcionalidades
}));

// Rate Limiting - Geral (100 requisições por 15 minutos)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por janela
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Não aplicar rate limit em desenvolvimento
    return process.env.NODE_ENV !== 'production';
  }
});

// Rate Limiting - Autenticação (mais restritivo: 5 tentativas por 15 minutos)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
});

// Rate Limiting - Recuperação de senha (3 tentativas por hora)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 solicitações
  message: { error: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS - Configuração segura
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://financeiro.giovannidev.com', 'https://www.financeiro.giovannidev.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como apps mobile ou Postman em dev)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origin: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight por 24 horas
}));

// Aplicar rate limiting geral
app.use('/api/', generalLimiter);

// Rate limiting específico para rotas de autenticação
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);

// Body parsers com limite de tamanho para prevenir DoS
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/notifications', notificationRoutes);

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos da pasta build
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Para qualquer rota que não seja API, servir o index.html do React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // Rota de teste para desenvolvimento
  app.get('/', (req, res) => {
    res.json({ message: 'API de Controle Financeiro rodando!' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Acesse: https://financeiro.giovannidev.com`);
  } else {
    console.log(`Acesse: http://localhost:${PORT}`);
  }
});
