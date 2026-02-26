// Sistema de cache usando localStorage com TTL

const CACHE_PREFIX = 'ctrl_financeiro_';

/**
 * Define um item no cache com TTL
 * @param {string} key - Chave do cache
 * @param {any} data - Dados a serem armazenados
 * @param {number} ttl - Time to live em milissegundos
 */
export const setCache = (key, data, ttl = 300000) => {
  try {
    const item = {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
};

/**
 * Recupera um item do cache
 * @param {string} key - Chave do cache
 * @returns {any|null} - Dados armazenados ou null se expirado/não encontrado
 */
export const getCache = (key) => {
  try {
    const itemStr = localStorage.getItem(CACHE_PREFIX + key);
    
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    
    // Verificar se expirou
    if (Date.now() > item.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error('Erro ao recuperar cache:', error);
    return null;
  }
};

/**
 * Remove um item específico do cache
 * @param {string} key - Chave do cache
 */
export const clearCache = (key) => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
};

/**
 * Remove todos os itens do cache que correspondem a um padrão
 * @param {string} pattern - Padrão a ser buscado (ex: 'summary_')
 */
export const clearCachePattern = (pattern) => {
  try {
    const keys = Object.keys(localStorage);
    const prefix = CACHE_PREFIX + pattern;
    
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Erro ao limpar cache por padrão:', error);
  }
};

/**
 * Remove todo o cache da aplicação
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Erro ao limpar todo o cache:', error);
  }
};

/**
 * Retorna estatísticas do cache
 */
export const getCacheStats = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    let validItems = 0;
    let expiredItems = 0;

    cacheKeys.forEach(key => {
      const itemStr = localStorage.getItem(key);
      totalSize += itemStr.length;
      
      try {
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
          expiredItems++;
        } else {
          validItems++;
        }
      } catch (e) {
        expiredItems++;
      }
    });

    return {
      totalItems: cacheKeys.length,
      validItems,
      expiredItems,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB'
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do cache:', error);
    return null;
  }
};

// TTL padrões (em milissegundos)
export const TTL = {
  SHORT: 60000,        // 1 minuto
  MEDIUM: 300000,      // 5 minutos
  LONG: 3600000,       // 1 hora
  VERY_LONG: 86400000  // 24 horas
};
