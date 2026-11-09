import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <APIContext.Provider value={{ apiUrl: 'https://case-study-assessment-production.up.railway.app' }}>
     <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
     </AuthProvider>
    </APIContext.Provider>
  </StrictMode>,
)
