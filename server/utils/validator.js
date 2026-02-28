/**
 * Utilitários de validação e sanitização de inputs
 * Previne DoS, XSS e outras vulnerabilidades de input
 */

const validator = {
  /**
   * Sanitiza strings removendo caracteres perigosos
   * @param {string} str - String a ser sanitizada
   * @param {number} maxLength - Tamanho máximo permitido
   * @returns {string|null} - String sanitizada ou null se inválida
   */
  sanitizeString: (str, maxLength = 255) => {
    if (typeof str !== 'string') return null;
    
    // Trim e limitar tamanho
    let sanitized = str.trim().slice(0, maxLength);
    
    // Remover caracteres de controle (exceto espaços)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    return sanitized;
  },

  /**
   * Valida e sanitiza descrição
   * @param {string} description - Descrição a validar
   * @returns {{ valid: boolean, value: string, error?: string }}
   */
  validateDescription: (description) => {
    const sanitized = validator.sanitizeString(description, 500);
    
    if (!sanitized || sanitized.length === 0) {
      return { valid: false, value: '', error: 'Descrição é obrigatória' };
    }
    
    if (sanitized.length < 2) {
      return { valid: false, value: sanitized, error: 'Descrição deve ter pelo menos 2 caracteres' };
    }
    
    return { valid: true, value: sanitized };
  },

  /**
   * Valida e sanitiza valor monetário
   * @param {any} amount - Valor a validar
   * @returns {{ valid: boolean, value: number, error?: string }}
   */
  validateAmount: (amount) => {
    // Converter para número
    const num = parseFloat(amount);
    
    if (isNaN(num)) {
      return { valid: false, value: 0, error: 'Valor deve ser um número válido' };
    }
    
    if (num <= 0) {
      return { valid: false, value: num, error: 'Valor deve ser maior que zero' };
    }
    
    if (num > 999999999.99) {
      return { valid: false, value: num, error: 'Valor excede o limite máximo permitido' };
    }
    
    // Arredondar para 2 casas decimais
    const rounded = Math.round(num * 100) / 100;
    
    return { valid: true, value: rounded };
  },

  /**
   * Valida tipo de transação
   * @param {string} type - Tipo a validar
   * @returns {{ valid: boolean, value: string, error?: string }}
   */
  validateTransactionType: (type) => {
    const validTypes = ['receita', 'despesa'];
    const sanitized = validator.sanitizeString(type, 10)?.toLowerCase();
    
    if (!sanitized || !validTypes.includes(sanitized)) {
      return { valid: false, value: '', error: 'Tipo deve ser "receita" ou "despesa"' };
    }
    
    return { valid: true, value: sanitized };
  },

  /**
   * Valida data
   * @param {string} date - Data a validar (formato YYYY-MM-DD)
   * @returns {{ valid: boolean, value: string, error?: string }}
   */
  validateDate: (date) => {
    if (!date || typeof date !== 'string') {
      return { valid: false, value: '', error: 'Data é obrigatória' };
    }
    
    // Validar formato ISO (YYYY-MM-DD)
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateStr = date.split('T')[0]; // Extrair apenas a data se vier com hora
    
    if (!isoRegex.test(dateStr)) {
      return { valid: false, value: '', error: 'Formato de data inválido (use YYYY-MM-DD)' };
    }
    
    // Verificar se é uma data válida
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return { valid: false, value: '', error: 'Data inválida' };
    }
    
    // Verificar limites razoáveis (não mais de 10 anos no futuro ou passado)
    const now = new Date();
    const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000;
    
    if (parsed > new Date(now.getTime() + tenYearsMs)) {
      return { valid: false, value: '', error: 'Data muito distante no futuro' };
    }
    
    if (parsed < new Date(now.getTime() - tenYearsMs)) {
      return { valid: false, value: '', error: 'Data muito distante no passado' };
    }
    
    return { valid: true, value: dateStr };
  },

  /**
   * Valida método de pagamento
   * @param {string} method - Método a validar
   * @returns {{ valid: boolean, value: string|null, error?: string }}
   */
  validatePaymentMethod: (method) => {
    if (!method) {
      return { valid: true, value: null }; // Opcional
    }
    
    const validMethods = ['credit_card', 'debit_card', 'cash', 'pix', 'bank_transfer', 'bank_slip', 'other'];
    
    // Mapeamento de valores antigos (português) para novos (inglês)
    const methodMapping = {
      'dinheiro': 'cash',
      'cartao_credito': 'credit_card',
      'cartao_debito': 'debit_card',
      'transferencia': 'bank_transfer',
      'boleto': 'bank_slip'
    };
    
    const sanitized = validator.sanitizeString(method, 50)?.toLowerCase();
    
    // Se for um valor antigo, mapear para o novo
    const normalized = methodMapping[sanitized] || sanitized;
    
    if (!validMethods.includes(normalized)) {
      return { valid: false, value: '', error: 'Método de pagamento inválido' };
    }
    
    return { valid: true, value: normalized };
  },

  /**
   * Valida notas/observações
   * @param {string} notes - Notas a validar
   * @returns {{ valid: boolean, value: string|null }}
   */
  validateNotes: (notes) => {
    if (!notes) {
      return { valid: true, value: null };
    }
    
    const sanitized = validator.sanitizeString(notes, 1000);
    return { valid: true, value: sanitized };
  },

  /**
   * Valida ID numérico
   * @param {any} id - ID a validar
   * @returns {{ valid: boolean, value: number, error?: string }}
   */
  validateId: (id) => {
    const num = parseInt(id, 10);
    
    if (isNaN(num) || num <= 0) {
      return { valid: false, value: 0, error: 'ID inválido' };
    }
    
    if (num > 2147483647) { // Max int PostgreSQL
      return { valid: false, value: 0, error: 'ID fora do limite permitido' };
    }
    
    return { valid: true, value: num };
  },

  /**
   * Valida email
   * @param {string} email - Email a validar
   * @returns {{ valid: boolean, value: string, error?: string }}
   */
  validateEmail: (email) => {
    const sanitized = validator.sanitizeString(email, 255)?.toLowerCase();
    
    if (!sanitized) {
      return { valid: false, value: '', error: 'Email é obrigatório' };
    }
    
    // Regex básico para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      return { valid: false, value: '', error: 'Formato de email inválido' };
    }
    
    return { valid: true, value: sanitized };
  },

  /**
   * Valida nome de categoria
   * @param {string} name - Nome a validar
   * @returns {{ valid: boolean, value: string, error?: string }}
   */
  validateCategoryName: (name) => {
    const sanitized = validator.sanitizeString(name, 100);
    
    if (!sanitized || sanitized.length === 0) {
      return { valid: false, value: '', error: 'Nome da categoria é obrigatório' };
    }
    
    if (sanitized.length < 2) {
      return { valid: false, value: sanitized, error: 'Nome deve ter pelo menos 2 caracteres' };
    }
    
    return { valid: true, value: sanitized };
  },

  /**
   * Valida cor hexadecimal
   * @param {string} color - Cor a validar
   * @returns {{ valid: boolean, value: string }}
   */
  validateColor: (color) => {
    if (!color) {
      return { valid: true, value: '#6366f1' }; // Cor padrão
    }
    
    const sanitized = validator.sanitizeString(color, 7);
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    
    if (!hexRegex.test(sanitized)) {
      return { valid: true, value: '#6366f1' }; // Retorna padrão se inválido
    }
    
    return { valid: true, value: sanitized };
  },

  /**
   * Valida ícone (emoji ou nome)
   * @param {string} icon - Ícone a validar
   * @returns {{ valid: boolean, value: string }}
   */
  validateIcon: (icon) => {
    if (!icon) {
      return { valid: true, value: 'category' };
    }
    
    const sanitized = validator.sanitizeString(icon, 50);
    return { valid: true, value: sanitized || 'category' };
  },

  /**
   * Valida limit para queries
   * @param {any} limit - Limit a validar
   * @returns {{ valid: boolean, value: number|null }}
   */
  validateLimit: (limit) => {
    if (!limit) {
      return { valid: true, value: null };
    }
    
    const num = parseInt(limit, 10);
    
    if (isNaN(num) || num <= 0) {
      return { valid: true, value: null };
    }
    
    // Limitar máximo para evitar sobrecarga
    return { valid: true, value: Math.min(num, 1000) };
  },

  /**
   * Valida dados completos de transação
   * @param {object} data - Dados da transação
   * @param {boolean} isUpdate - Se é uma atualização (campos opcionais)
   * @returns {{ valid: boolean, data: object, errors: string[] }}
   */
  validateTransaction: (data, isUpdate = false) => {
    const errors = [];
    const validated = {};

    // Descrição
    if (data.description !== undefined || !isUpdate) {
      const desc = validator.validateDescription(data.description);
      if (!desc.valid) errors.push(desc.error);
      validated.description = desc.value;
    }

    // Valor
    if (data.amount !== undefined || !isUpdate) {
      const amount = validator.validateAmount(data.amount);
      if (!amount.valid) errors.push(amount.error);
      validated.amount = amount.value;
    }

    // Tipo
    if (data.type !== undefined || !isUpdate) {
      const type = validator.validateTransactionType(data.type);
      if (!type.valid) errors.push(type.error);
      validated.type = type.value;
    }

    // Data
    if (data.date !== undefined || !isUpdate) {
      const date = validator.validateDate(data.date);
      if (!date.valid) errors.push(date.error);
      validated.date = date.value;
    }

    // Categoria (opcional)
    if (data.category_id !== undefined) {
      if (data.category_id !== null && data.category_id !== '') {
        const catId = validator.validateId(data.category_id);
        if (!catId.valid) errors.push('ID de categoria inválido');
        validated.category_id = catId.value;
      } else {
        validated.category_id = null;
      }
    }

    // Método de pagamento (opcional)
    if (data.payment_method !== undefined) {
      const pm = validator.validatePaymentMethod(data.payment_method);
      if (!pm.valid) errors.push(pm.error);
      validated.payment_method = pm.value;
    }

    // Notas (opcional)
    if (data.notes !== undefined) {
      const notes = validator.validateNotes(data.notes);
      validated.notes = notes.value;
    }

    // Recorrente (opcional)
    if (data.recurring !== undefined) {
      validated.recurring = data.recurring ? 1 : 0;
    }

    return {
      valid: errors.length === 0,
      data: validated,
      errors
    };
  },

  /**
   * Valida dados completos de categoria
   * @param {object} data - Dados da categoria
   * @param {boolean} isUpdate - Se é uma atualização
   * @returns {{ valid: boolean, data: object, errors: string[] }}
   */
  validateCategory: (data, isUpdate = false) => {
    const errors = [];
    const validated = {};

    // Nome
    if (data.name !== undefined || !isUpdate) {
      const name = validator.validateCategoryName(data.name);
      if (!name.valid) errors.push(name.error);
      validated.name = name.value;
    }

    // Tipo
    if (data.type !== undefined || !isUpdate) {
      const type = validator.validateTransactionType(data.type);
      if (!type.valid) errors.push(type.error);
      validated.type = type.value;
    }

    // Cor (opcional)
    if (data.color !== undefined) {
      const color = validator.validateColor(data.color);
      validated.color = color.value;
    }

    // Ícone (opcional)
    if (data.icon !== undefined) {
      const icon = validator.validateIcon(data.icon);
      validated.icon = icon.value;
    }

    return {
      valid: errors.length === 0,
      data: validated,
      errors
    };
  }
};

module.exports = validator;
