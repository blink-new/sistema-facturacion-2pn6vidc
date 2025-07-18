import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './components/pages/Dashboard'
import { Invoices } from './components/pages/Invoices'
import { Clients } from './components/pages/Clients'
import { Products } from './components/pages/Products'
import { Reports } from './components/pages/Reports'
import { Settings } from './components/pages/Settings'
import { Toaster } from './components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handlePageChange} />
      case 'invoices':
        return <Invoices />
      case 'clients':
        return <Clients />
      case 'products':
        return <Products />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={handlePageChange} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">FacturaPro</h1>
            <p className="text-xl text-muted-foreground">Sistema de Facturación</p>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Gestiona tus facturas, clientes y productos de manera profesional
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <div className="font-medium">✓ Facturas profesionales</div>
              <div className="font-medium">✓ Gestión de clientes</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">✓ Reportes detallados</div>
              <div className="font-medium">✓ Seguimiento de pagos</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      >
        {renderCurrentPage()}
      </AppLayout>
      <Toaster />
    </>
  )
}

export default App