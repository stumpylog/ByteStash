const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const shareRepository = require('../repositories/shareRepository');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { snippetId, requiresAuth, expiresIn } = req.body;
    const share = await shareRepository.createShare({
      snippetId,
      requiresAuth: !!requiresAuth,
      expiresIn: expiresIn ? parseInt(expiresIn) : null
    }, req.user.id);
    res.status(201).json(share);
  } catch (error) {
    console.error('Error creating share:', error);
    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: 'You do not have permission to share this snippet' });
    } else if (error.message === 'Invalid snippet ID') {
      res.status(400).json({ error: 'Invalid snippet ID provided' });
    } else {
      res.status(500).json({ error: 'Failed to create share' });
    }
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const share = await shareRepository.getShare(id);
    
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    if (share.share?.requiresAuth) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    if (share.share?.expired) {
      return res.status(410).json({ error: 'Share has expired' });
    }

    res.json(share);
  } catch (error) {
    console.error('Error getting share:', error);
    res.status(500).json({ error: 'Failed to get share' });
  }
});

router.get('/snippet/:snippetId', authenticateToken, async (req, res) => {
  try {
    const { snippetId } = req.params;
    const shares = await shareRepository.getSharesBySnippetId(snippetId, req.user.id);
    res.json(shares);
  } catch (error) {
    console.error('Error listing shares:', error);
    res.status(500).json({ error: 'Failed to list shares' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await shareRepository.deleteShare(id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting share:', error);
    res.status(500).json({ error: 'Failed to delete share' });
  }
});

module.exports = router;