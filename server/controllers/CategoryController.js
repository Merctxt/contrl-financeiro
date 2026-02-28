const Category = require('../models/Category');
const validator = require('../utils/validator');

class CategoryController {
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Validar e sanitizar dados
      const validation = validator.validateCategory(data, false);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.errors 
        });
      }

      const category = await Category.create(userId, validation.data);
      res.status(201).json({ message: 'Categoria criada com sucesso', category });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      let type = null;
      
      // Validar tipo se fornecido
      if (req.query.type) {
        const typeValidation = validator.validateTransactionType(req.query.type);
        if (typeValidation.valid) {
          type = typeValidation.value;
        }
      }

      const categories = await Category.findByUserId(userId, type);
      res.json({ categories });
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // Validar ID
      const idValidation = validator.validateId(id);
      if (!idValidation.valid) {
        return res.status(400).json({ error: idValidation.error });
      }

      const category = await Category.findById(idValidation.value, userId);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ category });
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const data = req.body;
      
      // Validar ID
      const idValidation = validator.validateId(id);
      if (!idValidation.valid) {
        return res.status(400).json({ error: idValidation.error });
      }
      
      // Validar dados (modo update)
      const validation = validator.validateCategory(data, true);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.errors 
        });
      }

      const category = await Category.update(idValidation.value, userId, validation.data);
      
      if (category.updated === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ message: 'Categoria atualizada com sucesso', category });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // Validar ID
      const idValidation = validator.validateId(id);
      if (!idValidation.valid) {
        return res.status(400).json({ error: idValidation.error });
      }

      const result = await Category.delete(idValidation.value, userId);
      
      if (result.deleted === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ message: 'Categoria deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }

  static async createDefaults(req, res) {
    try {
      const userId = req.user.id;

      await Category.createDefaultCategories(userId);
      res.json({ message: 'Categorias padrão criadas com sucesso' });
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      res.status(500).json({ error: 'Erro ao criar categorias padrão' });
    }
  }
}

module.exports = CategoryController;
