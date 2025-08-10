# Backend Architecture for Say Pharmacy Application

## Overview
This document outlines the architecture and implementation plan for the backend of the Say Pharmacy application. The backend will serve as the data layer using a JSON file database and provide RESTful APIs for the frontend components.

## Project Structure
```
backend/
├── src/
│   ├── index.js                 # Main server entry point
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── services/
│   │   ├── DrugDatabaseService.js  # Drug data management
│   │   └── AIService.js         # AI processing service
│   ├── routes/
│   │   ├── databaseRoutes.js    # Database endpoints
│   │   ├── chatRoutes.js        # Chat assistant endpoints
│   │   └── dosageRoutes.js      # Dosage calculation endpoints
│   ├── middleware/
│   │   └── rateLimiter.js       # Request rate limiting
│   └── utils/
│       └── voiceProcessor.js    # Voice transcription utilities
├── package.json                 # Dependencies and scripts
└── .env                         # Environment variables
```

## Core Components

### 1. Drug Database Service
- Handles JSON file operations for drug data
- Implements caching mechanism for better performance
- Provides search and filtering capabilities
- Supports pagination for large datasets

### 2. AI Service
- Integrates with Gemini AI for chat responses
- Processes user queries using drug database as reference
- Provides contextual responses based on drug information
- Handles natural language processing for dosage calculation

### 3. API Routes
#### Database Routes
- `GET /api/medicines` - Get all drugs with pagination
- `GET /api/medicines/search` - Search drugs by name/company/category
- `GET /api/database/status` - Get database status
- `GET /api/database/statistics` - Get database statistics

#### Chat Routes
- `POST /api/transcribe` - Voice transcription endpoint
- `POST /api/chat` - Chat assistant endpoint

#### Dosage Routes
- `POST /api/dosage/calculate` - Calculate dosage based on patient info
- `POST /api/dosage/voice-process` - Process voice commands for dosage

### 4. Middleware
- CORS handling
- Rate limiting to prevent abuse
- Error handling
- Authentication (planned)

## Implementation Details

### Database Service
The database service will:
- Load drug data from a JSON file
- Implement in-memory caching with TTL (24 hours)
- Support searching, filtering, and pagination
- Handle concurrent requests gracefully

### API Endpoints
All endpoints will:
- Return JSON responses
- Implement proper HTTP status codes
- Include error handling
- Support CORS for frontend integration

### Voice Processing
- Support webm audio files for transcription
- Process voice commands for dosage calculations
- Integrate with Gemini AI for natural language understanding

## Technology Stack
- Node.js with Express.js
- Gemini AI API
- File system for JSON database
- MongoDB/Mongoose (already included in package.json)
- CORS middleware
- Rate limiting
- Environment variable management