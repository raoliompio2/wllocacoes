import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { CompanyProvider } from './context/CompanyContext'
import { AuthProvider } from './context/AuthContext'

// Componente de carregamento para o Suspense
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    padding: '20px',
    textAlign: 'center',
    color: '#333'
  }}>
    <div>
      <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Carregando...</div>
      <div style={{ width: '50px', height: '50px', margin: '0 auto', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CompanyProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <App />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </CompanyProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
