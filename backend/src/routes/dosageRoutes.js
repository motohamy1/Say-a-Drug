import express from 'express';
import aiService from '../services/AIService.js';

const router = express.Router();

/**
 * POST /api/dosage/calculate
 * Calculate medication dosage
 */
router.post('/calculate', async (req, res) => {
  try {
    const { drugName, age, weight, category } = req.body;
    
    // Validate required fields
    if (!drugName) {
      return res.status(400).json({
        status: 'error',
        message: 'Drug name is required'
      });
    }
    
    // Process dosage calculation with AI
    const result = await aiService.getInstance().processDosageCalculation({
      drugName,
      age,
      weight,
      category
    });
    
    res.json({
      status: 'success',
      data: {
        calculatedDose: result,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * POST /api/dosage/voice-process
 * Process voice commands for dosage calculation
 */
router.post('/voice-process', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        status: 'error',
        message: 'Voice command is required'
      });
    }
    
    console.log('Processing voice command:', command);
    
    // Process voice command with AI
    const result = await aiService.getInstance().processVoiceDosageCommand(command);
    
    res.json({
      status: 'success',
      data: {
        processedCommand: result,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * POST /api/dosage/voice-calculate
 * Extract parameters from voice and calculate dosage
 */
router.post('/voice-calculate', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Voice message is required'
      });
    }
    
    console.log('Processing voice dosage request:', message);
    
    // Extract parameters from voice input
    const extractedParams = await aiService.getInstance().processVoiceDosageCommand(message);
    console.log('Raw AI response:', extractedParams);
    
    // Parse the extracted parameters
    let parsedParams;
    try {
      // Clean the response - remove markdown formatting if present
      let cleanResponse = extractedParams.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('Cleaned response:', cleanResponse);
      
      parsedParams = JSON.parse(cleanResponse);
      console.log('Parsed params:', parsedParams);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Attempted to parse:', extractedParams);
      
      // If parsing fails, create a basic structure
      parsedParams = {
        drugName: 'not specified',
        age: 'not specified',
        weight: 'not specified',
        category: 'not specified'
      };
    }
    
    // Calculate dosage if we have enough information
    let calculation = null;
    if (parsedParams.drugName !== 'not specified') {
      calculation = await aiService.getInstance().processDosageCalculation(parsedParams);
    }
    
    res.json({
      status: 'success',
      data: {
        extractedParams: parsedParams,
        calculation: calculation,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Voice dosage calculation error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

export default router;