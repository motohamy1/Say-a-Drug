import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { DarkModeProvider } from './hooks/use-dark-mode.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
