const snippetRepository = require('../repositories/snippetRepository');

class SnippetService {
  async getAllSnippets(userId) {
    try {
      console.log('Service: Getting all snippets for user:', userId);
      const result = await snippetRepository.findAll(userId);
      console.log(`Service: Retrieved ${result.length} snippets`);
      return result;
    } catch (error) {
      console.error('Service Error - getAllSnippets:', error);
      throw error;
    }
  }

  async createSnippet(snippetData, userId) {
    try {
      console.log('Service: Creating new snippet for user:', userId);
      const result = await snippetRepository.create({ ...snippetData, userId });
      console.log('Service: Created snippet with ID:', result.id);
      return result;
    } catch (error) {
      console.error('Service Error - createSnippet:', error);
      throw error;
    }
  }

  async deleteSnippet(id, userId) {
    try {
      console.log('Service: Deleting snippet:', id, 'for user:', userId);
      const result = await snippetRepository.delete(id, userId);
      console.log('Service: Delete operation result:', result ? 'Success' : 'Not Found');
      return result;
    } catch (error) {
      console.error('Service Error - deleteSnippet:', error);
      throw error;
    }
  }

  async updateSnippet(id, snippetData, userId) {
    try {
      console.log('Service: Updating snippet:', id, 'for user:', userId);
      const result = await snippetRepository.update(id, snippetData, userId);
      console.log('Service: Update operation result:', result ? 'Success' : 'Not Found');
      return result;
    } catch (error) {
      console.error('Service Error - updateSnippet:', error);
      throw error;
    }
  }

  async findById(id, userId) {
    try {
      console.log('Service: Getting snippet:', id, 'for user:', userId);
      const result = await snippetRepository.findById(id, userId);
      console.log('Service: Find by ID result:', result ? 'Found' : 'Not Found');
      return result;
    } catch (error) {
      console.error('Service Error - findById:', error);
      throw error;
    }
  }
}

module.exports = new SnippetService();