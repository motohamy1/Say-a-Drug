import { GoogleGenerativeAI } from '@google/generative-ai';
import drugDatabaseService from './DrugDatabaseService.js';

/**
 * @type {AIService|null} - Private variable to hold the singleton instance
 */
let _instance = null;

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Process chat messages with drug database context
   * @param {any} message
   */
  async processChatMessage(message, context = {}) {
    try {
      console.log('=== AI Processing Message:', message);
      
      // STEP 1: Classify the message type
      const messageType = this.classifyMessage(message);
      console.log('=== Message Type:', messageType);
      
      if (messageType === 'general') {
        // Handle general conversation
        const prompt = `
          You are Mira, a friendly pharmacy assistant. The user said: "${message}"
          
          Respond naturally and helpfully. If it's a greeting, greet them back warmly.
          If they ask general questions, answer them while mentioning you can help with:
          - Drug information from the Egyptian Drug Authority database
          - Dosage calculations
          - General pharmacy advice
          
          Always be friendly and professional.
        `;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
      
      // STEP 2: Handle drug-related queries
      let databaseResults = await this.searchEgyptianDatabase(message);
      console.log('=== Database Results:', databaseResults ? 'FOUND' : 'NOT FOUND');
      
      let prompt;
      
      if (databaseResults) {
        // Return structured data directly without AI formatting
        return databaseResults;
      } else {
        // STEP 3: Not found in database - use AI knowledge
        prompt = `
          You are Mira, a pharmacy assistant. The user asked about "${message}" but I couldn't find it in the Egyptian Drug Authority database.
          
          Please use your knowledge to provide information about this drug including:
          1. What the drug is used for
          2. Common brand names and generic names
          3. Typical dosage forms
          4. Important safety information
          5. Suggest that they check with local Egyptian pharmacies for availability
          
          Always recommend consulting a healthcare professional and mention that drug availability may vary by country.
        `;
      }
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error processing chat message:', error);
      throw new Error('Failed to process chat message with AI');
    }
  }

  /**
   * Classify message type to determine appropriate response
   */
  classifyMessage(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greetings and general conversation
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'thanks', 'thank you', 'bye', 'goodbye'];
    const generalQuestions = ['what can you do', 'help me', 'what is this', 'who are you', 'what are you'];
    
    // Check for greetings and general conversation
    if (greetings.some(greeting => lowerMessage.includes(greeting)) || 
        generalQuestions.some(question => lowerMessage.includes(question))) {
      return 'general';
    }
    
    // Medical/pharmaceutical questions (should use AI knowledge, not database search)
    const medicalQuestions = [
      'contraindications', 'side effects', 'adverse effects', 'interactions', 'warnings', 
      'precautions', 'overdose', 'allergic reaction', 'pregnancy', 'breastfeeding',
      'what is', 'how does', 'why', 'when to take', 'how to take', 'mechanism',
      'used for', 'treats', 'indication', 'therapeutic', 'pharmacology'
    ];
    
    // If it's a medical question, use AI knowledge regardless of drug names
    if (medicalQuestions.some(keyword => lowerMessage.includes(keyword))) {
      return 'general';
    }
    
    // Database search keywords (looking for specific drug info)
    const searchKeywords = ['search', 'find', 'show me', 'list', 'available', 'price', 'company', 'form'];
    
    // If it's a search request, use database
    if (searchKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'drug';
    }
    
    // If message is very short (1-2 words) and contains drug names, treat as database search
    if (lowerMessage.split(' ').length <= 2) {
      const drugNames = ['panadol', 'aspirin', 'ibuprofen', 'acetaminophen'];
      if (drugNames.some(drug => lowerMessage.includes(drug))) {
        return 'drug';
      }
      return 'general';
    }
    
    // Default to general (AI knowledge) for longer questions
    return 'general';
  }

  /**
   * Search Egyptian drugs database with smart fuzzy matching
   */
  async searchEgyptianDatabase(message) {
    try {
      const drugs = await drugDatabaseService.loadDrugs();
      console.log('=== Loaded drugs:', drugs.length);
      
      const searchTerm = message.toLowerCase().trim();
      console.log('=== Searching for term:', searchTerm);
      
      // Extract drug name from message
      let drugName = searchTerm
        .replace(/search\s+(about|for)\s+/g, '')
        .replace(/can\s+you\s+/g, '')
        .replace(/please\s+/g, '')
        .replace(/tell\s+me\s+about\s+/g, '')
        .replace(/what\s+is\s+/g, '')
        .trim();
      
      console.log('=== Extracted drug name:', drugName);
      
      // Skip search if drug name is too generic or empty
      if (!drugName || drugName.length < 2) {
        return null;
      }
      
      // Step 1: Try exact matches first
      const exactMatches = drugs.filter(drug => {
        const drugNameLower = drug.Drugname?.toLowerCase() || '';
        return drugNameLower.includes(drugName);
      });
      
      if (exactMatches.length > 0) {
        console.log('=== Found exact matches:', exactMatches.length);
        return exactMatches.slice(0, 5).map((drug, index) => 
          `**Drug ${index + 1}:**\n**Drug Name:** ${drug.Drugname}\n**Company:** ${drug.Company}\n**Form:** ${drug.Form}\n**Price:** ${drug.Price} EGP\n**Category:** ${drug.Category}`
        ).join('\n\n---\n\n');
      }
      
      // Step 2: Try fuzzy matching for suggestions
      const suggestions = this.findSimilarDrugs(drugs, drugName);
      
      if (suggestions.length > 0) {
        console.log('=== Found similar drugs:', suggestions.length);
        const suggestionText = suggestions.slice(0, 5).map(drug => 
          `**${drug.Drugname}** - ${drug.Company} - ${drug.Form} - ${drug.Price} EGP`
        ).join('\n');
        
        return `**Similar drugs found:**\n\n${suggestionText}\n\n*Please specify which one you're looking for.*`;
      }
      
      console.log('=== No drugs found, returning null');
      return null;
    } catch (error) {
      console.error('Database search error:', error);
      return null;
    }
  }

  /**
   * Find similar drug names using fuzzy matching
   */
  findSimilarDrugs(drugs, searchTerm) {
    const suggestions = [];
    
    drugs.forEach(drug => {
      const drugName = drug.Drugname?.toLowerCase() || '';
      const similarity = this.calculateSimilarity(drugName, searchTerm);
      
      // Include drugs with similarity > 0.3 or that start with search term
      if (similarity > 0.3 || drugName.startsWith(searchTerm)) {
        suggestions.push({ ...drug, similarity });
      }
    });
    
    // Sort by similarity (highest first)
    return suggestions.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity between two strings (simple algorithm)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Check if shorter string is contained in longer
    if (longer.includes(shorter)) return 0.8;
    
    // Check if they start with same letters
    if (longer.startsWith(shorter.substring(0, 3))) return 0.6;
    
    // Simple character overlap calculation
    let matches = 0;
    for (let char of shorter) {
      if (longer.includes(char)) matches++;
    }
    
    return matches / shorter.length;
  }

  /**
   * Extract relevant drug information from a message
   * @param {string} message
   */
  async getRelevantDrugInfo(message) {
    try {
      console.log('Searching for:', message);
      
      // Try both smart search and regular search
      let results = await drugDatabaseService.smartSearch(message);
      console.log('Smart search results:', results?.length || 0);
      
      if (!results || results.length === 0) {
        // Fallback to regular search
        const searchResult = await drugDatabaseService.searchDrugs(message, 1, 10);
        results = searchResult?.drugs || [];
        console.log('Regular search results:', results?.length || 0);
      }
      
      if (results && results.length > 0) {
        // @ts-ignore
        const drugInfo = results.map(drug => 
          `${drug.Drugname || 'Unknown'} - Company: ${drug.Company || 'Unknown'} - Form: ${drug.Form || 'Unknown'} - Price: ${drug.Price || 'N/A'} EGP - Category: ${drug.Category || 'Unknown'}`
        ).join('\n');
        console.log('Found drug info:', drugInfo);
        return drugInfo;
      }
      
      console.log('No drugs found for:', message);
      return null;
    } catch (error) {
      console.error('Error getting relevant drug info:', error);
      return null;
    }
  }

  /**
   * Process dosage calculation request
   * @param {{ drugName: any; age: any; weight: any; category: any; }} request
   */
  async processDosageCalculation(request) {
    try {
      // Parse the request to extract drug name, age, weight, and other parameters
      const { drugName, age, weight, category } = request;
      
      // Get drug information from database
      const drugs = await drugDatabaseService.loadDrugs();
      const drug = drugs.find((/** @type {{ Drugname: string; GenericName: string; }} */ d) => 
        d.Drugname?.toLowerCase().includes(drugName.toLowerCase()) ||
        d.GenericName?.toLowerCase().includes(drugName.toLowerCase())
      );
      
      // Create prompt for dosage calculation
      const prompt = `
        You are an expert pharmacist providing dosage calculations using the Egyptian Drug Authority database.
        
        Drug Information: ${drug ? 
          `${drug.Drugname || 'Unknown'} (${drug.GenericName || 'Unknown'}) - ${drug.Form || 'Unknown'} - ${drug.Company || 'Unknown'} - Price: ${drug.Price || 'N/A'} EGP` : 
          'Drug not found in Egyptian database - please verify drug name or suggest local alternatives'
        }
        
        Patient Information:
        - Age: ${age || 'Not specified'} years
        - Weight: ${weight || 'Not specified'} kg
        - Special Category: ${category || 'None specified'}
        
        Based on the drug information and patient details, provide:
        1. Appropriate dosage calculation
        2. Dosage frequency
        3. Important considerations for this patient
        4. Any contraindications or warnings
        
        Format your response clearly and professionally.
        
        Response:
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error processing dosage calculation:', error);
      throw new Error('Failed to process dosage calculation with AI');
    }
  }

  /**
   * Transcribe audio using Gemini (if needed)
   * @param {any} audioBuffer
   */
  async transcribeAudio(audioBuffer) {
    try {
      // This would typically use a more sophisticated approach
      // For now, we'll return a placeholder
      return "Transcription would be processed here using audio input";
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Process natural language voice commands for dosage
   * @param {any} command
   */
  async processVoiceDosageCommand(command, retryCount = 0) {
    try {
      console.log('Processing voice dosage command:', command);
      
      const prompt = `
        Extract medication dosage information from this text: "${command}"
        
        Return ONLY a valid JSON object with these exact fields:
        {
          "drugName": "drug name found or 'not specified'",
          "age": "age found or 'not specified'",
          "weight": "weight found or 'not specified'",
          "category": "special condition found or 'not specified'"
        }
        
        Examples:
        - "panadol for 8 year old" → {"drugName": "panadol", "age": "8", "weight": "not specified", "category": "not specified"}
        - "aspirin 25kg adult" → {"drugName": "aspirin", "age": "not specified", "weight": "25kg", "category": "adult"}
        - "drug name is panadol patient age is 20 weight is 70 kilogram" → {"drugName": "panadol", "age": "20", "weight": "70", "category": "not specified"}
        
        Return only the JSON, no other text.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Voice processing AI response:', responseText);
      
      return responseText;
    } catch (error) {
      console.error('Error processing voice dosage command:', error);
      
      // Retry for API overload (503 errors)
      if (error.status === 503 && retryCount < 2) {
        console.log(`API overloaded, retrying in ${(retryCount + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return this.processVoiceDosageCommand(command, retryCount + 1);
      }
      
      // Fallback for persistent API issues
      if (error.status === 503) {
        console.log('API still overloaded, using fallback parsing');
        return this.fallbackVoiceProcessing(command);
      }
      
      throw new Error('Failed to process voice dosage command with AI');
    }
  }

  fallbackVoiceProcessing(command) {
    const text = command.toLowerCase();
    const result = {
      drugName: 'not specified',
      age: 'not specified', 
      weight: 'not specified',
      category: 'not specified'
    };
    
    // Extract age
    const ageMatch = text.match(/(\d+)\s*(?:year|yr)/i);
    if (ageMatch) result.age = ageMatch[1];
    
    // Extract weight
    const weightMatch = text.match(/(\d+)\s*(?:kg|kilogram)/i);
    if (weightMatch) result.weight = weightMatch[1];
    
    // Extract common drug names
    const drugs = ['panadol', 'aspirin', 'ibuprofen', 'amoxicillin', 'acetaminophen'];
    for (const drug of drugs) {
      if (text.includes(drug)) {
        result.drugName = drug;
        break;
      }
    }
    
    console.log('Fallback processing result:', result);
    return JSON.stringify(result);
  }
}

// Create singleton instance with lazy initialization
const aiService = {
  getInstance() {
    if (!_instance) {
      _instance = new AIService();
    }
    return _instance;
  }
};

export default aiService;