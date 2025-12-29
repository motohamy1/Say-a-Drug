import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} Drug
 * @property {string} [Drugname]
 * @property {string} [Company]
 * @property {string} [Category]
 * @property {string} [GenericName]
 * @property {string} [RegNumber]
 * @property {string} [ActiveIngredient]
 * @property {string} [Form]
 * @property {number} [Price]
 */

class DrugDatabaseService {
  constructor() {
    this.dbPath = path.join(__dirname, '..', '..', 'egyptian_drugs.json');
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Load drugs from JSON file with caching
   * @returns {Promise<Drug[]>}
   */
  async loadDrugs() {
    const now = Date.now();
    
    // Check if cache is valid
    if (this.cache && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheDuration)) {
      return this.cache;
    }

    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const drugs = JSON.parse(data);
      
      // Update cache
      this.cache = drugs;
      this.cacheTimestamp = now;
      
      return drugs;
    } catch (error) {
      console.error('Error loading drugs from database:', error);
      throw new Error('Failed to load drug database');
    }
  }

  /**
   * Get all drugs with optional pagination
   */
  async getAllDrugs(page = 1, limit = 20) {
    try {
      const drugs = await this.loadDrugs();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        drugs: drugs.slice(startIndex, endIndex),
        total: drugs.length,
        // @ts-ignore
        page: parseInt(page),
        // @ts-ignore
        limit: parseInt(limit)
      };
    } catch (error) {
      throw new Error('Failed to fetch drugs');
    }
  }

  /**
   * Search drugs by various criteria with smart matching
   * @param {string} query
   * @param {number} [page=1]
   * @param {number} [limit=20]
   */
  // @ts-ignore
  async searchDrugs(query, page = 1, limit = 20) {
    try {
      const drugs = await this.loadDrugs();
      const searchTerm = query.toLowerCase().trim();
      
      // Smart search with multiple strategies
      const filteredDrugs = drugs.filter(drug => {
        const drugName = drug.Drugname?.toLowerCase() || '';
        const company = drug.Company?.toLowerCase() || '';
        const category = drug.Category?.toLowerCase() || '';
        const genericName = drug.GenericName?.toLowerCase() || '';
        
        // Strategy 1: Exact word match
        if (drugName.includes(searchTerm) || 
            company.includes(searchTerm) || 
            category.includes(searchTerm) || 
            genericName.includes(searchTerm)) {
          return true;
        }
        
        // Strategy 2: Handle common drug name variations
        const commonMappings = {
          'panadol': ['abimol', 'paracetamol', 'acetaminophen'],
          'aspirin': ['aspirin', 'acetylsalicylic'],
          'ibuprofen': ['ibuprofen', 'brufen'],
          'amoxicillin': ['amoxicillin', 'amoxil']
        };
        
        for (const [key, alternatives] of Object.entries(commonMappings)) {
          if (searchTerm.includes(key)) {
            return alternatives.some(alt => 
              drugName.includes(alt) || genericName.includes(alt)
            );
          }
        }
        
        // Strategy 3: Partial word matching for longer drug names
        const searchWords = searchTerm.split(' ');
        return searchWords.some(word => 
          word.length > 2 && (
            drugName.includes(word) || 
            genericName.includes(word)
          )
        );
      });
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        drugs: filteredDrugs.slice(startIndex, endIndex),
        total: filteredDrugs.length,
        // @ts-ignore
        page: parseInt(page),
        // @ts-ignore
        limit: parseInt(limit)
      };
    } catch (error) {
      throw new Error('Failed to search drugs');
    }
  }

  /**
   * Get drug by registration number
   */
  // @ts-ignore
  async getDrugByRegNumber(regNumber) {
    try {
      const drugs = await this.loadDrugs();
      // @ts-ignore
      return drugs.find(drug => drug.RegNumber === regNumber);
    } catch (error) {
      throw new Error('Failed to fetch drug by registration number');
    }
  }

  /**
   * Get unique companies from the database
   */
  async getCompanies() {
    try {
      const drugs = await this.loadDrugs();
      // @ts-ignore
      const companies = [...new Set(drugs.map(drug => drug.Company).filter(Boolean))];
      return companies.sort();
    } catch (error) {
      throw new Error('Failed to fetch companies');
    }
  }

  /**
   * Get unique active ingredients from the database
   */
  async getActiveIngredients() {
    try {
      const drugs = await this.loadDrugs();
      // @ts-ignore
      const ingredients = [...new Set(drugs.map(drug => drug.ActiveIngredient).filter(Boolean))];
      return ingredients.sort();
    } catch (error) {
      throw new Error('Failed to fetch active ingredients');
    }
  }

  /**
   * Get drugs by company
   */
  // @ts-ignore
  async getDrugsByCompany(companyName) {
    try {
      const drugs = await this.loadDrugs();
      // @ts-ignore
      return drugs.filter(drug => 
        drug.Company?.toLowerCase() === companyName.toLowerCase()
      );
    } catch (error) {
      throw new Error('Failed to fetch drugs by company');
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics() {
    try {
      const drugs = await this.loadDrugs();
      // @ts-ignore
      const companies = [...new Set(drugs.map(drug => drug.Company).filter(Boolean))];
      // @ts-ignore
      const categories = [...new Set(drugs.map(drug => drug.Category).filter(Boolean))];
      
      return {
        totalDrugs: drugs.length,
        totalCompanies: companies.length,
        totalCategories: categories.length,
        lastUpdated: this.cacheTimestamp ? new Date(this.cacheTimestamp) : new Date(),
        cacheValid: this.cache && this.cacheTimestamp && (Date.now() - this.cacheTimestamp < this.cacheDuration)
      };
    } catch (error) {
      throw new Error('Failed to fetch database statistics');
    }
  }

  /**
   * Smart search specifically for AI assistant
   * @param {string} query
   */
  async smartSearch(query) {
    try {
      const drugs = await this.loadDrugs();
      const searchTerm = query.toLowerCase().trim();
      
      // Find best matches with scoring
      const scoredDrugs = drugs.map(drug => {
        const drugName = drug.Drugname?.toLowerCase() || '';
        const category = drug.Category?.toLowerCase() || '';
        let score = 0;
        
        // Exact match gets highest score
        if (drugName === searchTerm) score += 100;
        else if (drugName.includes(searchTerm)) score += 50;
        
        // Category match
        if (category.includes(searchTerm)) score += 30;
        
        // Common drug mappings
        if (searchTerm.includes('panadol') && drugName.includes('abimol')) score += 80;
        if (searchTerm.includes('aspirin') && drugName.includes('aspirin')) score += 80;
        
        return { ...drug, score };
      }).filter(drug => drug.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      return scoredDrugs;
    } catch (error) {
      throw new Error('Failed to perform smart search');
    }
  }

  /**
   * Force refresh the database cache
   */
  async refreshCache() {
    this.cache = null;
    this.cacheTimestamp = null;
    return { message: 'Database cache refreshed' };
  }
}

// Create singleton instance
const drugDatabaseService = new DrugDatabaseService();

export default drugDatabaseService;