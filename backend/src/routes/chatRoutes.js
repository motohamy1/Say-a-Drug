import express from 'express';
import aiService from '../services/AIService.js';

const router = express.Router();

/**
 * POST /api/chat
 * Chat assistant endpoint
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }
    
    console.log('Processing message:', message);
    
    // Process chat message with AI
    let reply;
    try {
      console.log('Attempting to get AI service instance...');
      const aiInstance = aiService.getInstance();
      console.log('AI instance obtained, processing message...');
      reply = await aiInstance.processChatMessage(message);
      console.log('AI response received:', reply?.substring(0, 100) + '...');
    } catch (aiError) {
      console.error('AI Service error details:', aiError);
      // @ts-ignore
      console.error('Error stack:', aiError.stack);
      reply = `Hello! I received your message: "${message}". I'm currently having technical difficulties with the AI service. Error: ${aiError.message}. Please try again later.`;
    }
    
    res.json({
      status: 'success',
      data: {
        reply: reply,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    // @ts-ignore
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// @ts-ignore
// @ts-ignore
router.get('/test', async (req, res) => {
  try {
    // Test database loading
    const drugDatabaseService = (await import('../services/DrugDatabaseService.js')).default;
    const drugs = await drugDatabaseService.loadDrugs();
    
    // Test search functionality
    const panadolSearch = await drugDatabaseService.smartSearch('panadol');
    const abimolSearch = await drugDatabaseService.smartSearch('abimol');
    const regularSearch = await drugDatabaseService.searchDrugs('abimol', 1, 5);
    
    // Test AI service initialization
    let aiServiceReady = false;
    let aiError = null;
    try {
      const aiServiceInstance = aiService.getInstance();
      aiServiceReady = !!aiServiceInstance;
    } catch (error) {
      // @ts-ignore
      aiError = error.message;
    }
    
    res.json({ 
      status: 'success', 
      message: 'Chat route is working',
      drugsCount: drugs.length,
      sampleDrugs: drugs.slice(0, 3).map(d => d.Drugname),
      panadolSearchResults: panadolSearch?.length || 0,
      abimolSearchResults: abimolSearch?.length || 0,
      regularSearchResults: regularSearch?.drugs?.length || 0,
      aiServiceReady,
      aiError
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      status: 'error',
      // @ts-ignore
      message: error.message
    });
  }
});

// @ts-ignore
router.get('/test-models', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({ error: 'No API key found' });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test different models
    const modelsToTest = [
      'gemini-1.5-pro',
      'gemini-1.5-flash', 
      'gemini-pro',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    const results = {};
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // @ts-ignore
        const result = await model.generateContent('Hello');
        // @ts-ignore
        results[modelName] = 'Working';
      } catch (error) {
        // @ts-ignore
        results[modelName] = error.message;
      }
    }
    
    res.json({ models: results });
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/voice
 * Process voice input for chat
 */
router.post('/voice', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Voice message is required'
      });
    }
    
    console.log('Processing voice message:', message);
    
    // Process voice message with AI (same as text chat but with voice context)
    let reply;
    try {
      reply = await aiService.getInstance().processChatMessage(message);
    } catch (aiError) {
      console.error('AI Service error:', aiError);
      // @ts-ignore
      reply = `I'm sorry, I'm having trouble processing your voice request right now. Error: ${aiError.message}`;
    }
    
    res.json({
      status: 'success',
      data: {
        reply: reply,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Voice chat error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

/**
 * POST /api/chat/transcribe
 * Voice transcription endpoint
 */
router.post('/transcribe', async (req, res) => {
  try {
    // For now, return a placeholder that indicates voice input was received
    // In a real implementation, you would:
    // 1. Process the audio file from req.files or req.body
    // 2. Use Gemini AI or another service to transcribe
    // 3. Return the actual transcribed text
    
    res.json({
      status: 'success',
      data: {
        text: "Voice input received - please type your message instead",
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

export default router;