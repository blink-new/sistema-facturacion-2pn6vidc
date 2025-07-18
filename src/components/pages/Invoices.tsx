import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { InvoiceForm } from './InvoiceForm'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Invoice } from '@/types'

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      const invoicesData = await blink.db.invoices.list({ 
        where: { userId: user.id }, 
        orderBy: { createdAt: 'desc' } 
      })
      setInvoices(invoicesData)
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const handleCreateInvoice = () => {
    setEditingInvoice(null)
    setShowCreateForm(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setShowCreateForm(true)
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta factura?')) return

    try {
      // Delete invoice items first
      const items = await blink.db.invoiceItems.list({
        where: { invoiceId }
      })
      for (const item of items) {
        await blink.db.invoiceItems.delete(item.id)
      }
      
      // Then delete the invoice
      await blink.db.invoices.delete(invoiceId)
      
      toast({
        title: 'Éxito',
        description: 'Factura eliminada correctamente'
      })
      loadInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la factura',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      await blink.db.invoices.update(invoiceId, {
        status,
        updatedAt: new Date().toISOString()
      })
      
      toast({
        title: 'Éxito',
        description: `Estado de factura actualizado a ${status}`
      })
      loadInvoices()
    } catch (error) {
      console.error('Error updating invoice status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la factura',
        variant: 'destructive'
      })
    }
  }

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

  const isOverdue = (invoice: Invoice) => {
    const dueDate = new Date(invoice.dueDate)
    const now = new Date()
    return invoice.status === 'sent' && dueDate < now
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showCreateForm) {
    return (
      <InvoiceForm 
        onBack={() => {
          setShowCreateForm(false)
          setEditingInvoice(null)
          loadInvoices()
        }}
        editingInvoice={editingInvoice}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus facturas
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por número de factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Lista de Facturas ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron facturas' : 'No hay facturas registradas'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={handleCreateInvoice}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Factura
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {invoice.client?.name || 'Cliente no encontrado'}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className={isOverdue(invoice) ? 'text-red-600 font-medium' : ''}>
                        {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                        {isOverdue(invoice) && <span className="ml-1">(Vencida)</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {isOverdue(invoice) ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencida</Badge>
                      ) : (
                        getStatusBadge(invoice.status)
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleUpdateInvoiceStatus(invoice.id, 'sent')}>
                              <Send className="mr-2 h-4 w-4" />
                              Enviar
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}>
                              <Eye className="mr-2 h-4 w-4" />
                              Marcar como Pagada
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}