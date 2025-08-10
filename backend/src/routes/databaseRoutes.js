import express from 'express';
import drugDatabaseService from '../services/DrugDatabaseService.js';

const router = express.Router();

/**
 * GET /api/database/status
 * Get database status
 */
// @ts-ignore
router.get('/status', async (req, res) => {
  try {
    const stats = await drugDatabaseService.getStatistics();
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/database/statistics
 * Get database statistics
 */
// @ts-ignore
router.get('/statistics', async (req, res) => {
  try {
    const stats = await drugDatabaseService.getStatistics();
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/database/companies
 * Get all companies
 */
// @ts-ignore
router.get('/companies', async (req, res) => {
  try {
    const companies = await drugDatabaseService.getCompanies();
    res.json({
      status: 'success',
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/database/ingredients
 * Get all active ingredients
 */
// @ts-ignore
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await drugDatabaseService.getActiveIngredients();
    res.json({
      status: 'success',
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/database/company/:companyName
 * Get drugs by company
 */
router.get('/company/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const drugs = await drugDatabaseService.getDrugsByCompany(companyName);
    res.json({
      status: 'success',
      data: drugs
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/database/drug/:regNumber
 * Get drug by registration number
 */
router.get('/drug/:regNumber', async (req, res) => {
  try {
    const { regNumber } = req.params;
    const drug = await drugDatabaseService.getDrugByRegNumber(regNumber);
    
    if (!drug) {
      return res.status(404).json({
        status: 'error',
        message: 'Drug not found'
      });
    }
    
    res.json({
      status: 'success',
      data: drug
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/medicines
 * Get all drugs with pagination
 */
router.get('/medicines', async (req, res) => {
  try {
    const page = parseInt(req.query.page?.toString() || '1') || 1;
    const limit = parseInt(req.query.limit?.toString() || '20') || 20;
    
    if (page < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Page must be a positive integer'
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be between 1 and 100'
      });
    }
    
    const result = await drugDatabaseService.getAllDrugs(page, limit);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/medicines/search
 * Search drugs by query
 */
router.get('/medicines/search', async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page?.toString() || '1') || 1;
    const limit = parseInt(req.query.limit?.toString() || '20') || 20;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query parameter "q" is required'
      });
    }
    
    if (page < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Page must be a positive integer'
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be between 1 and 100'
      });
    }
    
    const result = await drugDatabaseService.searchDrugs(q.toString(), page, limit);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * POST /api/database/refresh
 * Force refresh database cache
 */
// @ts-ignore
router.post('/refresh', async (req, res) => {
  try {
    const result = await drugDatabaseService.refreshCache();
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

export default router;