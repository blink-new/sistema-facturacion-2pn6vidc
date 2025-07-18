import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Package
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

export function Products() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - will be replaced with real data from database
  const products = [
    {
      id: 'PROD-001',
      name: 'Consultoría Estratégica',
      description: 'Servicios de consultoría empresarial y estrategia de negocio',
      price: 150.00,
      taxRate: 21,
      unit: 'hora',
      timesUsed: 45
    },
    {
      id: 'PROD-002',
      name: 'Desarrollo Web',
      description: 'Desarrollo de sitios web y aplicaciones web personalizadas',
      price: 85.00,
      taxRate: 21,
      unit: 'hora',
      timesUsed: 128
    },
    {
      id: 'PROD-003',
      name: 'Diseño Gráfico',
      description: 'Servicios de diseño gráfico, branding y material publicitario',
      price: 65.00,
      taxRate: 21,
      unit: 'hora',
      timesUsed: 67
    },
    {
      id: 'PROD-004',
      name: 'Mantenimiento Mensual',
      description: 'Servicio de mantenimiento y soporte técnico mensual',
      price: 250.00,
      taxRate: 21,
      unit: 'mes',
      timesUsed: 24
    },
    {
      id: 'PROD-005',
      name: 'Formación Empresarial',
      description: 'Cursos y talleres de formación para equipos empresariales',
      price: 120.00,
      taxRate: 21,
      unit: 'sesión',
      timesUsed: 18
    },
    {
      id: 'PROD-006',
      name: 'Auditoría de Sistemas',
      description: 'Revisión y auditoría de sistemas informáticos y seguridad',
      price: 200.00,
      taxRate: 21,
      unit: 'proyecto',
      timesUsed: 12
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.timesUsed), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos y Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona tu catálogo de productos y servicios
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos o servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{products.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precio Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(products.reduce((sum, product) => sum + product.price, 0) / products.length)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Más Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">
              {products.reduce((max, product) => product.timesUsed > max.timesUsed ? product : max).name}
            </div>
            <p className="text-xs text-muted-foreground">
              {products.reduce((max, product) => product.timesUsed > max.timesUsed ? product : max).timesUsed} veces
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Catálogo de Productos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto/Servicio</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Veces Usado</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.taxRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {product.unit}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.timesUsed}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(product.price * product.timesUsed)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>
    </div>
  )
}