import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Trash2, 
  Save,
  Send,
  ArrowLeft,
  Calculator
} from 'lucide-react'
import type { Client, Product, Invoice, InvoiceItem } from '@/types'

interface InvoiceFormProps {
  onBack: () => void
  editingInvoice?: Invoice | null
}

interface InvoiceItemForm {
  id: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export function InvoiceForm({ onBack, editingInvoice }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'EUR',
    notes: ''
  })

  const [items, setItems] = useState<InvoiceItemForm[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 21,
      lineTotal: 0
    }
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        clientId: editingInvoice.clientId,
        invoiceNumber: editingInvoice.invoiceNumber,
        issueDate: editingInvoice.issueDate,
        dueDate: editingInvoice.dueDate,
        currency: editingInvoice.currency,
        notes: editingInvoice.notes || ''
      })
      
      if (editingInvoice.items) {
        setItems(editingInvoice.items.map(item => ({
          id: item.id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          lineTotal: item.lineTotal
        })))
      }
    }
  }, [editingInvoice])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const [clientsData, productsData] = await Promise.all([
        blink.db.clients.list({ 
          where: { userId: user.id }, 
          orderBy: { name: 'asc' } 
        }),
        blink.db.products.list({ 
          where: { userId: user.id }, 
          orderBy: { name: 'asc' } 
        })
      ])
      
      setClients(clientsData)
      setProducts(productsData)
      
      // Generate invoice number if creating new
      if (!editingInvoice) {
        const invoicesData = await blink.db.invoices.list({ 
          where: { userId: user.id }, 
          orderBy: { createdAt: 'desc' },
          limit: 1
        })
        
        const nextNumber = invoicesData.length > 0 
          ? parseInt(invoicesData[0].invoiceNumber.split('-').pop() || '0') + 1
          : 1
        
        setFormData(prev => ({
          ...prev,
          invoiceNumber: `FAC-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, '0')}`
        }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [editingInvoice, toast])

  const addItem = () => {
    const newItem: InvoiceItemForm = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 21,
      lineTotal: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== itemId))
    }
  }

  const updateItem = (itemId: string, field: keyof InvoiceItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate line total when quantity, unit price, or tax rate changes
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          const subtotal = updatedItem.quantity * updatedItem.unitPrice
          const taxAmount = subtotal * (updatedItem.taxRate / 100)
          updatedItem.lineTotal = subtotal + taxAmount
        }
        
        return updatedItem
      }
      return item
    }))
  }

  const selectProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      updateItem(itemId, 'productId', productId)
      updateItem(itemId, 'description', product.name)
      updateItem(itemId, 'unitPrice', product.price)
      updateItem(itemId, 'taxRate', product.taxRate)
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)
    
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      return sum + (itemSubtotal * (item.taxRate / 100))
    }, 0)
    
    const total = subtotal + taxAmount
    
    return { subtotal, taxAmount, total }
  }

  const handleSave = async (status: 'draft' | 'sent') => {
    try {
      if (!formData.clientId || !formData.invoiceNumber || items.length === 0) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los campos obligatorios',
          variant: 'destructive'
        })
        return
      }

      // Validate items
      const invalidItems = items.filter(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)
      if (invalidItems.length > 0) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los elementos de la factura',
          variant: 'destructive'
        })
        return
      }

      const user = await blink.auth.me()
      const { subtotal, taxAmount, total } = calculateTotals()
      
      const invoiceData = {
        userId: user.id,
        clientId: formData.clientId,
        invoiceNumber: formData.invoiceNumber,
        status,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        subtotal,
        taxAmount,
        totalAmount: total,
        currency: formData.currency,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      }

      let invoiceId: string

      if (editingInvoice) {
        await blink.db.invoices.update(editingInvoice.id, invoiceData)
        invoiceId = editingInvoice.id
        
        // Delete existing items
        const existingItems = await blink.db.invoiceItems.list({
          where: { invoiceId: editingInvoice.id }
        })
        for (const item of existingItems) {
          await blink.db.invoiceItems.delete(item.id)
        }
      } else {
        const invoice = await blink.db.invoices.create({
          ...invoiceData,
          createdAt: new Date().toISOString()
        })
        invoiceId = invoice.id
      }

      // Create invoice items
      for (const item of items) {
        await blink.db.invoiceItems.create({
          invoiceId,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          lineTotal: item.lineTotal,
          createdAt: new Date().toISOString()
        })
      }

      toast({
        title: 'Éxito',
        description: `Factura ${status === 'draft' ? 'guardada' : 'enviada'} correctamente`
      })

      onBack()
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar la factura',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: formData.currency
    }).format(amount)
  }

  const { subtotal, taxAmount, total } = calculateTotals()

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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
            </h1>
            <p className="text-muted-foreground">
              {editingInvoice ? 'Modifica los datos de la factura' : 'Crea una nueva factura para tu cliente'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSave('sent')}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Factura
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, clientId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="invoiceNumber">Número de Factura *</Label>
                  <Input
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="FAC-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="issueDate">Fecha de Emisión *</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="GBP">Libra (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales para la factura..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Elementos de la Factura</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Elemento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px]">Cantidad</TableHead>
                    <TableHead className="w-[120px]">Precio Unit.</TableHead>
                    <TableHead className="w-[80px]">IVA %</TableHead>
                    <TableHead className="w-[120px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-2">
                          <Select 
                            value={item.productId || ''} 
                            onValueChange={(value) => selectProduct(item.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {formatCurrency(product.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Descripción del elemento"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(item.lineTotal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA:</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Elementos: {items.length}</div>
                <div>Moneda: {formData.currency}</div>
                {formData.dueDate && (
                  <div>
                    Vence: {new Date(formData.dueDate).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          {formData.clientId && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const client = clients.find(c => c.id === formData.clientId)
                  if (!client) return null
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-muted-foreground">{client.email}</div>
                      {client.phone && (
                        <div className="text-muted-foreground">{client.phone}</div>
                      )}
                      {client.address && (
                        <div className="text-muted-foreground">{client.address}</div>
                      )}
                      {client.city && (
                        <div className="text-muted-foreground">{client.city}</div>
                      )}
                      {client.taxId && (
                        <div className="text-muted-foreground">NIF/CIF: {client.taxId}</div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}