import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Download,
  BarChart3
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function Reports() {
  // Mock data - will be replaced with real data from database
  const monthlyData = [
    { month: 'Enero', invoices: 12, revenue: 8450.00, paid: 10, pending: 2 },
    { month: 'Febrero', invoices: 15, revenue: 12300.00, paid: 13, pending: 2 },
    { month: 'Marzo', invoices: 18, revenue: 15600.00, paid: 16, pending: 2 },
    { month: 'Abril', invoices: 22, revenue: 18900.00, paid: 20, pending: 2 },
    { month: 'Mayo', invoices: 25, revenue: 21750.00, paid: 23, pending: 2 },
    { month: 'Junio', invoices: 28, revenue: 24200.00, paid: 25, pending: 3 }
  ]

  const topClients = [
    { name: 'Empresa ABC S.A.', revenue: 25600.00, invoices: 15, growth: 12 },
    { name: 'Tecnología JKL', revenue: 31200.00, invoices: 12, growth: 8 },
    { name: 'Servicios DEF', revenue: 18900.00, invoices: 22, growth: -3 },
    { name: 'Comercial XYZ Ltda.', revenue: 12400.00, invoices: 8, growth: 15 },
    { name: 'Industrias GHI', revenue: 8750.00, invoices: 5, growth: 5 }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
  const invoiceGrowth = ((currentMonth.invoices - previousMonth.invoices) / previousMonth.invoices) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas de tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentMonth.revenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={revenueGrowth > 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas del Mes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {currentMonth.invoices}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {invoiceGrowth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={invoiceGrowth > 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(invoiceGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Promedio
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentMonth.revenue / currentMonth.invoices)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por factura
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Cobro
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {((currentMonth.paid / currentMonth.invoices) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Facturas cobradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Evolución de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm text-muted-foreground">
                      {month.month.slice(0, 3)}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground min-w-[80px] text-right">
                    {formatCurrency(month.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Mejores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.invoices} facturas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(client.revenue)}
                    </div>
                    <div className="flex items-center justify-end">
                      {client.growth > 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          +{client.growth}%
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          {client.growth}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Resumen del Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {monthlyData.reduce((sum, month) => sum + month.revenue, 0).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </div>
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {monthlyData.reduce((sum, month) => sum + month.invoices, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Facturas Emitidas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {(
                  (monthlyData.reduce((sum, month) => sum + month.paid, 0) / 
                   monthlyData.reduce((sum, month) => sum + month.invoices, 0)) * 100
                ).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Tasa de Cobro Promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}