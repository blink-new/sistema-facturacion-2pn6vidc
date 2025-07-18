import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // Mock data - will be replaced with real data from database
  const stats = {
    totalInvoices: 156,
    totalRevenue: 45280.50,
    pendingAmount: 12450.00,
    overdueAmount: 3200.00,
    paidInvoices: 142,
    draftInvoices: 8
  }

  const recentInvoices = [
    {
      id: 'INV-001',
      client: 'Empresa ABC S.A.',
      amount: 2500.00,
      status: 'paid' as const,
      dueDate: '2024-01-15'
    },
    {
      id: 'INV-002',
      client: 'Comercial XYZ Ltda.',
      amount: 1800.00,
      status: 'sent' as const,
      dueDate: '2024-01-20'
    },
    {
      id: 'INV-003',
      client: 'Servicios DEF',
      amount: 950.00,
      status: 'overdue' as const,
      dueDate: '2024-01-10'
    },
    {
      id: 'INV-004',
      client: 'Industrias GHI',
      amount: 3200.00,
      status: 'draft' as const,
      dueDate: '2024-01-25'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagada</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Enviada</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencida</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Borrador</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu actividad de facturación
          </p>
        </div>
        <Button onClick={() => onNavigate('invoices')} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Facturas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInvoices - stats.paidInvoices} facturas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencidas
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiere atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Facturas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-foreground">{invoice.id}</div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {invoice.client}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate('invoices')}
            >
              Ver Todas las Facturas
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-primary hover:bg-primary/90" 
                onClick={() => onNavigate('invoices')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Crear Nueva Factura
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('clients')}
              >
                <Users className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('products')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('reports')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Ver Reportes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}