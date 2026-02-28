const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

/**
 * @param {string} a - Primeira string
 * @param {string} b - Segunda string
 * @returns {boolean} - true se forem iguais
 */
const timingSafeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  // Garantir mesmo tamanho para evitar vazamento de informação
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  
  if (bufA.length !== bufB.length) {
    // Ainda assim fazer a comparação para manter tempo constante
    const dummy = Buffer.alloc(bufA.length);
    crypto.timingSafeEqual(bufA, dummy);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    // Verificar JWT
    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se a sessão está ativa no banco
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await pool.query(
      'SELECT * FROM sessions WHERE token_hash = $1 AND is_active = TRUE',
      [tokenHash]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Sessão inválida ou expirada' });
    }
    
    // Verificação adicional timing-safe do hash
    const storedHash = result.rows[0].token_hash;
    if (!timingSafeCompare(tokenHash, storedHash)) {
      return res.status(403).json({ error: 'Sessão inválida' });
    }
    
    // Atualizar última atividade
    await pool.query(
      'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE token_hash = $1',
      [tokenHash]
    );
    
    req.user = user;
    req.sessionId = result.rows[0].id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = authenticateToken;
