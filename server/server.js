require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    console.log(`Acesse: http://localhost:${PORT}`);
  }
});
