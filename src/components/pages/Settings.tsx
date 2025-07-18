import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Building, 
  User, 
  Bell, 
  Palette,
  FileText,
  Save
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu sistema de facturación
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input 
                id="company-name" 
                placeholder="Mi Empresa S.L."
                defaultValue="FacturaPro Consulting"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tax-id">NIF/CIF</Label>
              <Input 
                id="tax-id" 
                placeholder="B12345678"
                defaultValue="B87654321"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea 
                id="address" 
                placeholder="Calle Principal 123, 28001 Madrid"
                defaultValue="Calle Innovación 456&#10;28001 Madrid, España"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  placeholder="+34 912 345 678"
                  defaultValue="+34 912 345 678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="contacto@miempresa.com"
                  defaultValue="contacto@facturapro.com"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input 
                id="website" 
                placeholder="https://www.miempresa.com"
                defaultValue="https://www.facturapro.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Nombre Completo</Label>
              <Input 
                id="user-name" 
                placeholder="Juan Pérez"
                defaultValue="María García"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input 
                id="user-email" 
                type="email"
                placeholder="juan@miempresa.com"
                defaultValue="maria@facturapro.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="user-role">Cargo</Label>
              <Input 
                id="user-role" 
                placeholder="Director Financiero"
                defaultValue="Gerente General"
              />
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input 
                id="current-password" 
                type="password"
                placeholder="••••••••"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input 
                id="new-password" 
                type="password"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5" />
              Configuración de Facturas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="invoice-prefix">Prefijo de Facturas</Label>
              <Input 
                id="invoice-prefix" 
                placeholder="FAC"
                defaultValue="FAC"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="next-number">Próximo Número</Label>
              <Input 
                id="next-number" 
                type="number"
                placeholder="1"
                defaultValue="2024-006"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="default-currency">Moneda por Defecto</Label>
              <Select defaultValue="EUR">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="GBP">Libra (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="default-tax">IVA por Defecto (%)</Label>
              <Select defaultValue="21">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar IVA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Exento)</SelectItem>
                  <SelectItem value="4">4% (Súper reducido)</SelectItem>
                  <SelectItem value="10">10% (Reducido)</SelectItem>
                  <SelectItem value="21">21% (General)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="payment-terms">Términos de Pago (días)</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue placeholder="Días de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="45">45 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recordatorios de Vencimiento</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones cuando las facturas estén por vencer
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Facturas Pagadas</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar cuando se marquen facturas como pagadas
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuevos Clientes</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones de nuevos clientes registrados
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reportes Semanales</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir resumen semanal por email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <Label htmlFor="notification-email">Email para Notificaciones</Label>
              <Input 
                id="notification-email" 
                type="email"
                placeholder="notificaciones@miempresa.com"
                defaultValue="maria@facturapro.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  )
}