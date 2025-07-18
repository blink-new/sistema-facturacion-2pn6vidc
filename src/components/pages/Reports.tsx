import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react'
import type { Invoice, Client } from '@/types'

interface ReportData {
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  averageInvoiceValue: number
  monthlyRevenue: { month: string; revenue: number }[]
  topClients: { client: string; revenue: number; invoiceCount: number }[]
  statusBreakdown: { status: string; count: number; amount: number }[]
}

export function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('last-12-months')
  const { toast } = useToast()

  const calculateReportData = useCallback((invoicesData: Invoice[], clientsData: Client[]) => {
    // Filter invoices by date range
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'last-30-days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'last-3-months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'last-6-months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'last-12-months':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate.setFullYear(now.getFullYear() - 1)
    }

    const filteredInvoices = invoicesData.filter(invoice => 
      new Date(invoice.createdAt) >= startDate
    )

    // Basic metrics
    const totalRevenue = filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
    
    const totalInvoices = filteredInvoices.length
    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid').length
    const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'sent').length
    const overdueInvoices = filteredInvoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      return inv.status === 'sent' && dueDate < now
    }).length

    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / paidInvoices : 0

    // Monthly revenue
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthRevenue = filteredInvoices
        .filter(inv => {
          const invDate = new Date(inv.createdAt)
          return inv.status === 'paid' && invDate >= monthStart && invDate <= monthEnd
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      })
    }

    // Top clients
    const clientRevenue = new Map<string, { revenue: number; invoiceCount: number }>()
    
    filteredInvoices
      .filter(inv => inv.status === 'paid')
      .forEach(invoice => {
        const current = clientRevenue.get(invoice.clientId) || { revenue: 0, invoiceCount: 0 }
        clientRevenue.set(invoice.clientId, {
          revenue: current.revenue + invoice.totalAmount,
          invoiceCount: current.invoiceCount + 1
        })
      })

    const topClients = Array.from(clientRevenue.entries())
      .map(([clientId, data]) => {
        const client = clientsData.find(c => c.id === clientId)
        return {
          client: client?.name || 'Cliente desconocido',
          revenue: data.revenue,
          invoiceCount: data.invoiceCount
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Status breakdown
    const statusBreakdown = [
      {
        status: 'paid',
        count: paidInvoices,
        amount: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
      },
      {
        status: 'sent',
        count: pendingInvoices,
        amount: filteredInvoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.totalAmount, 0)
      },
      {
        status: 'draft',
        count: filteredInvoices.filter(inv => inv.status === 'draft').length,
        amount: filteredInvoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.totalAmount, 0)
      },
      {
        status: 'overdue',
        count: overdueInvoices,
        amount: filteredInvoices.filter(inv => {
          const dueDate = new Date(inv.dueDate)
          return inv.status === 'sent' && dueDate < now
        }).reduce((sum, inv) => sum + inv.totalAmount, 0)
      }
    ]

    setReportData({
      totalRevenue,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      averageInvoiceValue,
      monthlyRevenue,
      topClients,
      statusBreakdown
    })
  }, [dateRange])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      // Load invoices and clients
      const [invoicesData, clientsData] = await Promise.all([
        blink.db.invoices.list({ 
          where: { userId: user.id }, 
          orderBy: { createdAt: 'desc' } 
        }),
        blink.db.clients.list({ 
          where: { userId: user.id }, 
          orderBy: { name: 'asc' } 
        })
      ])
      
      setInvoices(invoicesData)
      setClients(clientsData)
      
      // Calculate report data
      calculateReportData(invoicesData, clientsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del reporte',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [calculateReportData, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (invoices.length > 0 && clients.length > 0) {
      calculateReportData(invoices, clients)
    }
  }, [dateRange, invoices, clients, calculateReportData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagadas</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Enviadas</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencidas</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Borradores</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const exportReport = () => {
    if (!reportData) return

    const csvContent = [
      ['Métrica', 'Valor'],
      ['Ingresos Totales', formatCurrency(reportData.totalRevenue)],
      ['Total Facturas', reportData.totalInvoices.toString()],
      ['Facturas Pagadas', reportData.paidInvoices.toString()],
      ['Facturas Pendientes', reportData.pendingInvoices.toString()],
      ['Facturas Vencidas', reportData.overdueInvoices.toString()],
      ['Valor Promedio Factura', formatCurrency(reportData.averageInvoiceValue)],
      [''],
      ['Top Clientes', ''],
      ...reportData.topClients.map(client => [client.client, formatCurrency(client.revenue)]),
      [''],
      ['Ingresos Mensuales', ''],
      ...reportData.monthlyRevenue.map(month => [month.month, formatCurrency(month.revenue)])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte-facturas-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Éxito',
      description: 'Reporte exportado correctamente'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay datos suficientes para generar el reporte</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis financiero y estadísticas de facturación
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Últimos 30 días</SelectItem>
              <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
              <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
              <SelectItem value="last-12-months">Últimos 12 meses</SelectItem>
              <SelectItem value="this-year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(reportData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              De {reportData.paidInvoices} facturas pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Facturas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {reportData.totalInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.paidInvoices} pagadas, {reportData.pendingInvoices} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(reportData.averageInvoiceValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por factura pagada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas Vencidas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reportData.overdueInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyRevenue.map((month, index) => {
                const maxRevenue = Math.max(...reportData.monthlyRevenue.map(m => m.revenue))
                const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Top Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{client.client}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.invoiceCount} facturas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(client.revenue)}
                    </div>
                  </div>
                </div>
              ))}
              
              {reportData.topClients.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No hay datos de clientes disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5" />
            Desglose por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportData.statusBreakdown.map((status, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  {getStatusBadge(status.status)}
                  <span className="text-sm font-medium">{status.count}</span>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(status.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {status.count > 0 
                    ? `Promedio: ${formatCurrency(status.amount / status.count)}`
                    : 'Sin facturas'
                  }
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}