import express from 'express';
import drugDatabaseService from '../services/DrugDatabaseService.js';

const router = express.Router();

/**
 * GET /api/drugs/search
 * Search drugs by name
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    // @ts-ignore
    const result = await drugDatabaseService.searchDrugs(q, page, limit);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Drug search error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/drugs
 * Get all drugs with pagination
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // @ts-ignore
    const result = await drugDatabaseService.getAllDrugs(page, limit);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Get drugs error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

export default router;