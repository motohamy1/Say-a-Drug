# Say-Pharmacy Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```powershell
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend; npm install; cd ..

# Or run them separately:
# cd backend
# npm install
# cd ..
```

### 2. Environment Setup

The environment files are already configured:
- Frontend: `.env.local` (API URL configuration)
- Backend: `backend/.env` (Gemini API key)

### 3. Start Development Servers

You have several options to start the application:

#### Option 1: Start Both Servers Together (Recommended)
```bash
npm run start:all
```

#### Option 2: Start Servers Separately
In separate terminals:

```powershell
# Terminal 1: Start backend server
npm run backend
# or
cd backend; npm start
```

```powershell
# Terminal 2: Start frontend server
npm run frontend
# or
npm run dev
```

## Server Details

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:5000 (Express API server)

## API Integration Updates

### What's Been Fixed:
1. **Centralized API Service** (`src/services/api.ts`)
   - All API calls now go through a single service
   - Better error handling
   - Consistent response handling

2. **Environment Configuration**
   - Frontend uses `VITE_API_BASE_URL` from `.env.local`
   - Backend uses `GEMINI_API_KEY` from `backend/.env`

3. **CORS Configuration**
   - Backend configured to accept requests from frontend URLs
   - Proper headers for cross-origin requests

### Available API Endpoints:
- `POST /api/chat` - AI chat with Mira
- `GET /api/drugs` - Fetch drugs with pagination
- `GET /api/drugs/search` - Search drugs
- `POST /api/drugs/reload` - Reload drug database
- `GET /api/health` - Health check

## Troubleshooting

### Backend Issues:
1. **GEMINI_API_KEY error**: Ensure the API key is set in `backend/.env`
2. **Port already in use**: Change PORT in `backend/.env` or kill the process using port 5000
3. **Drug data not loading**: Check if `egyptian_drugs.json` exists in the root directory

### Frontend Issues:
1. **API connection error**: Verify backend is running on port 5000
2. **CORS errors**: Check that the frontend URL is in the backend's allowed origins list

### Common Commands:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Test drug search
curl http://localhost:5000/api/drugs?search=paracetamol

# Test AI chat (requires backend running)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about paracetamol"}'
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading
2. **Logs**: Check terminal output for detailed error messages
3. **Database**: The drug database is loaded from `egyptian_drugs.json` on startup
4. **AI Integration**: The Gemini API is used for the chat assistant

## Next Steps

1. Test the voice assistant functionality
2. Implement actual voice recognition (currently just UI)
3. Add more drug information fields
4. Enhance the AI responses with more drug-specific knowledge
