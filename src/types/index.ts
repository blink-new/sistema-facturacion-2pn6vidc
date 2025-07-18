export interface Client {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  taxId?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  userId: string
  name: string
  description?: string
  price: number
  taxRate: number
  unit: string
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  userId: string
  clientId: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  currency: string
  notes?: string
  createdAt: string
  updatedAt: string
  client?: Client
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
  createdAt: string
  product?: Product
}

export interface DashboardStats {
  totalInvoices: number
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
  paidInvoices: number
  draftInvoices: number
}