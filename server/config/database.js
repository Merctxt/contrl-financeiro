const { Pool } = require('pg');

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL:', err);
  process.exit(-1);
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Tabela de Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        reset_token TEXT,
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Categorias
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('receita', 'despesa')),
        color TEXT DEFAULT '#6366f1',
        icon TEXT DEFAULT 'category',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Transações
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('receita', 'despesa')),
        date DATE NOT NULL,
        payment_method TEXT,
        notes TEXT,
        recurring INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Metas Financeiras
    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        target_amount DECIMAL(10, 2) NOT NULL,
        current_amount DECIMAL(10, 2) DEFAULT 0,
        deadline DATE,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Orçamentos Mensais
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        limit_amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE (user_id, category_id, month, year)
      )
    `);

    // Tabela de Sessões
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        device_info TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Criar índice para melhorar performance nas consultas de sessões
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_active 
      ON sessions(user_id, is_active)
    `);

    
    // Índice para transactions - usado em praticamente todas as queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
      ON transactions(user_id, date DESC)
    `);
    
    // Índice para filtros por categoria em transações
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_category 
      ON transactions(category_id)
    `);
    
    // Índice composto para queries de período (muito comum em relatórios)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
      ON transactions(user_id, type, date)
    `);
    
    // Índice para categories por usuário
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_categories_user_type 
      ON categories(user_id, type)
    `);
    
    // Índice para budgets por usuário e período
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_budgets_user_period 
      ON budgets(user_id, month, year)
    `);
    
    // Índice para financial_goals por usuário e status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_goals_user_status 
      ON financial_goals(user_id, status)
    `);
    
    // Índice para sessions por token_hash (lookup rápido)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash 
      ON sessions(token_hash)
    `);

    // Adicionar constraint UNIQUE na tabela budgets se não existir
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'budgets_user_category_month_year_unique'
        ) THEN
          ALTER TABLE budgets 
          ADD CONSTRAINT budgets_user_category_month_year_unique 
          UNIQUE (user_id, category_id, month, year);
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('Tabelas do banco de dados criadas/verificadas com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Inicializar o banco de dados
initializeDatabase().catch(err => {
  console.error('Erro fatal ao inicializar banco:', err);
  process.exit(1);
});

module.exports = pool;
