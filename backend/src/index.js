<<<<<<< HEAD
// index.js (Updated)
require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const Drug = require('./models/Drugs'); // <-- This model is now used in the chat route
const cors =require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
const port = 3001;

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
  })
  .catch((err) => {
    console.error('Connection error', err);
  });

app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

// --- ⬇️ REPLACEMENT START: Replace your old /api/chat route with this one ⬇️ ---
app.post('/api/chat', async (req, res) => {
  // The 'message' from your frontend is now named 'question' for clarity
  const { message: question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Search for drugs mentioned in the question
    const words = question.replace(/[?,.!]/g, '').split(' ');
    let drugFromDB = null;
    
    console.log('Question:', question);
    console.log('Words to search:', words);
    
    // Try to find a drug by checking if any word in the question matches part of a drug name
    for (const word of words) {
      if (word.length > 2) { // Only search for words longer than 2 characters
        console.log(`Searching for word: "${word}"`);
        
        // Try exact word match first, then partial match
        drugFromDB = await Drug.findOne({ 
          Drugname: { $regex: `\\b${word}\\b`, $options: 'i' } 
        });
        
        // If no exact word match, try partial match
        if (!drugFromDB) {
          drugFromDB = await Drug.findOne({ 
            Drugname: { $regex: word, $options: 'i' } 
          });
        }
        
        console.log(`Search result for "${word}":`, drugFromDB ? drugFromDB.Drugname : 'Not found');
        if (drugFromDB) break; // Found a match, stop searching
      }
    }
    
    console.log('Final drug found:', drugFromDB ? drugFromDB.Drugname : 'None');
    
    // If no drug found with individual words, try searching the entire question
    if (!drugFromDB && question.length > 3) {
      console.log(`Trying full question search: "${question}"`);
      drugFromDB = await Drug.findOne({ 
        Drugname: { $regex: question, $options: 'i' } 
      });
      console.log(`Full question search result:`, drugFromDB ? drugFromDB.Drugname : 'Not found');
    }
    
    // Debug: Check total drug count
    const totalDrugs = await Drug.countDocuments();
    console.log(`Total drugs in database: ${totalDrugs}`);

    let finalPrompt;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    if (drugFromDB) {
      // ✅ If we found a drug, create a specific prompt for Gemini
      console.log(`✅ Using database info for: "${drugFromDB.Drugname}"`);
      
      // We feed the database info to the AI and ask it to answer the user's question.
      finalPrompt = `Based on the drug information provided below, answer the user's question in a helpful, conversational tone. You are Amira, an AI pharmacy assistant specialized in Egyptian medications.

      --- Drug Information ---
      Name: ${drugFromDB.Drugname}
      Price: ${drugFromDB.Price} EGP
      Form: ${drugFromDB.Form}
      Category: ${drugFromDB.Category}
      Manufacturer: ${drugFromDB.Company}
      ------------------------

      User's Question: "${question}"`;

    } else {
      // ❌ If no drug was found, let Gemini answer from its general knowledge.
      console.log(`❌ No specific drug found in DB (${totalDrugs} total drugs). Using general AI knowledge.`);
      finalPrompt = question; // The prompt is just the original question
    }
    
    // Send the final prompt (either the detailed one or the original one) to Gemini
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // In your frontend, you are expecting a 'reply' object key
    res.json({ reply: text });

  } catch (error) {
    console.error('Error in /api/chat route:', error.message); // Log the error message
    console.error('Full error object:', error); // Log the full error object for more details
    res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
  }
});
// --- ⬆️ REPLACEMENT END ⬆️ ---


// --- GET /api/drugs: Paginated, searchable drug list ---
app.get('/api/drugs', async (req, res) => {
  console.log('GET /api/drugs route hit');
  console.log('Query parameters:', req.query);
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    // Build search query (search Drugname, Company, Category)
    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { Drugname: regex },
          { Company: regex },
          { Category: regex }
        ]
      };
    }

    const total = await Drug.countDocuments(query);
    const drugs = await Drug.find(query).skip(skip).limit(limit);
    const totalPages = Math.ceil(total / limit);

    res.json({
      drugs,
      total,
      page,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drugs', details: error.message });
  }
});

// --- Drugs API endpoint for the frontend ---

// --- Test route to check database connection ---
app.get('/api/test-db', async (req, res) => {
  try {
    const drugCount = await Drug.countDocuments();
    const sampleDrugs = await Drug.find().limit(5); // Get first 5 drugs
    const aspirinDrug = await Drug.findOne({ Drugname: { $regex: 'aspirin', $options: 'i' } });
    const abimolDrug = await Drug.findOne({ Drugname: { $regex: 'abimol', $options: 'i' } });
    
    res.json({
      message: 'Database connection successful',
      totalDrugs: drugCount,
      sampleDrugs: sampleDrugs.map(d => ({ name: d.Drugname, price: d.Price })),
      aspirinFound: aspirinDrug ? aspirinDrug.Drugname : 'No aspirin found',
      abimolFound: abimolDrug ? abimolDrug.Drugname : 'No abimol found'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// --- Audio Transcription Route (No changes needed here) ---
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  //... your existing transcription code ...
});


=======
// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const port = 3001; // Explicitly set the port to 3001

// --- Multer setup for file uploads ---
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// --- Middleware ---
// Consider if you need credentials: true and the specific origin.
// For initial testing, allowing all origins might simplify things:
// app.use(cors());
// Or keep yours if it's correct for your frontend setup:
app.use(cors({ origin: 'http://localhost:8080', credentials: true })); // Ensure http://localhost:8080 matches your React dev server URL
app.use(express.json());

// --- Gemini AI Setup ---
// IMPORTANT: Make sure process.env.GEMINI_API_KEY is set correctly in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Routes ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // --- FIX: Use a valid model name ---
    // Options include: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // <-- CORRECTED MODEL NAME

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Error with Gemini API:', error); // This log is crucial for debugging
    // Optional: Send more details back during development (remove in production)
    // res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// --- Audio Transcription Route ---
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Check if OpenAI API key is available
    // Use Gemini for transcription
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const audioBuffer = req.file.buffer;
    const audioMimeType = req.file.mimetype;

    const audioPart = {
      inlineData: {
        data: audioBuffer.toString('base64'),
        mimeType: audioMimeType,
      },
    };

    const prompt = "Transcribe the following audio:";

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const transcribedText = response.text();

    if (!transcribedText.trim()) {
      console.warn('Gemini returned empty transcription.');
      return res.json({
        text: "No speech detected by Gemini. Please try again.",
        success: false
      });
    }

    res.json({
      text: transcribedText,
      success: true
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

>>>>>>> 564621e5aa9ae889e7edd4ba9dbb0b0723380926
// --- Server Start ---
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});