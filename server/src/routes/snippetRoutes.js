const express = require('express');
const snippetService = require('../services/snippetService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const snippets = await snippetService.getAllSnippets(req.user.id);
    res.json(snippets);
  } catch (error) {
    console.error('Error in GET /snippets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newSnippet = await snippetService.createSnippet(req.body, req.user.id);
    res.status(201).json(newSnippet);
  } catch (error) {
    console.error('Error in POST /snippets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await snippetService.deleteSnippet(req.params.id, req.user.id);
    if (!result) {
      res.status(404).json({ error: 'Snippet not found' });
    } else {
      res.json({ id: result.id });
    }
  } catch (error) {
    console.error('Error in DELETE /snippets/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedSnippet = await snippetService.updateSnippet(
      req.params.id, 
      req.body, 
      req.user.id
    );
    
    if (!updatedSnippet) {
      res.status(404).json({ error: 'Snippet not found' });
    } else {
      res.json(updatedSnippet);
    }
  } catch (error) {
    console.error('Error in PUT /snippets/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snippet = await snippetService.findById(req.params.id, req.user.id);
    if (!snippet) {
      res.status(404).json({ error: 'Snippet not found' });
    } else {
      res.json(snippet);
    }
  } catch (error) {
    console.error('Error in GET /snippets/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;