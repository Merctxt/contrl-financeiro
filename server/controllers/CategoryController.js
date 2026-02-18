const Category = require('../models/Category');

class CategoryController {
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      if (!data.name || !data.type) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      if (!['receita', 'despesa'].includes(data.type)) {
        return res.status(400).json({ error: 'Tipo inválido' });
      }

      const category = await Category.create(userId, data);
      res.status(201).json({ message: 'Categoria criada com sucesso', category });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const type = req.query.type;

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

      const category = await Category.findById(id, userId);
      
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

      const category = await Category.update(id, userId, data);
      
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

      const result = await Category.delete(id, userId);
      
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
