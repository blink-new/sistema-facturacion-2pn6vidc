import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Building, 
  Bell, 
  Palette, 
  Globe,
  Save,
  Download,
  Upload,
  Trash2
} from 'lucide-react'

interface CompanySettings {
  name: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  taxId: string
  logo?: string
}

interface UserPreferences {
  language: string
  currency: string
  dateFormat: string
  timezone: string
  emailNotifications: boolean
  invoiceReminders: boolean
  paymentNotifications: boolean
  theme: string
}

export function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Company settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxId: ''
  })

  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'es',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Europe/Madrid',
    emailNotifications: true,
    invoiceReminders: true,
    paymentNotifications: true,
    theme: 'light'
  })

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const userData = await blink.auth.me()
      setUser(userData)

      // Load company settings from database
      const settings = await blink.db.companySettings.list({
        where: { userId: userData.id },
        limit: 1
      })

      if (settings.length > 0) {
        setCompanySettings(settings[0])
      }

      // Load user preferences from database
      const userPrefs = await blink.db.userPreferences.list({
        where: { userId: userData.id },
        limit: 1
      })

      if (userPrefs.length > 0) {
        setPreferences(userPrefs[0])
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    try {
      setSaving(true)

      // Save company settings
      const existingCompany = await blink.db.companySettings.list({
        where: { userId: user.id },
        limit: 1
      })

      if (existingCompany.length > 0) {
        await blink.db.companySettings.update(existingCompany[0].id, {
          ...companySettings,
          updatedAt: new Date().toISOString()
        })
      } else {
        await blink.db.companySettings.create({
          userId: user.id,
          ...companySettings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      // Save user preferences
      const existingPrefs = await blink.db.userPreferences.list({
        where: { userId: user.id },
        limit: 1
      })

      if (existingPrefs.length > 0) {
        await blink.db.userPreferences.update(existingPrefs[0].id, {
          ...preferences,
          updatedAt: new Date().toISOString()
        })
      } else {
        await blink.db.userPreferences.create({
          userId: user.id,
          ...preferences,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      toast({
        title: 'Éxito',
        description: 'Configuraciones guardadas correctamente'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las configuraciones',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      // Export all user data
      const [invoices, clients, products] = await Promise.all([
        blink.db.invoices.list({ where: { userId: user.id } }),
        blink.db.clients.list({ where: { userId: user.id } }),
        blink.db.products.list({ where: { userId: user.id } })
      ])

      const exportData = {
        companySettings,
        preferences,
        invoices,
        clients,
        products,
        exportDate: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `facturapro-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Éxito',
        description: 'Datos exportados correctamente'
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron exportar los datos',
        variant: 'destructive'
      })
    }
  }

  const deleteAllData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      return
    }

    if (!confirm('Esta acción eliminará permanentemente todas tus facturas, clientes y productos. ¿Continuar?')) {
      return
    }

    try {
      // Delete all user data
      const [invoices, clients, products] = await Promise.all([
        blink.db.invoices.list({ where: { userId: user.id } }),
        blink.db.clients.list({ where: { userId: user.id } }),
        blink.db.products.list({ where: { userId: user.id } })
      ])

      // Delete invoice items first
      for (const invoice of invoices) {
        const items = await blink.db.invoiceItems.list({ where: { invoiceId: invoice.id } })
        for (const item of items) {
          await blink.db.invoiceItems.delete(item.id)
        }
      }

      // Delete invoices
      for (const invoice of invoices) {
        await blink.db.invoices.delete(invoice.id)
      }

      // Delete clients
      for (const client of clients) {
        await blink.db.clients.delete(client.id)
      }

      // Delete products
      for (const product of products) {
        await blink.db.products.delete(product.id)
      }

      // Delete settings
      const [companySettings, userPrefs] = await Promise.all([
        blink.db.companySettings.list({ where: { userId: user.id } }),
        blink.db.userPreferences.list({ where: { userId: user.id } })
      ])

      for (const setting of companySettings) {
        await blink.db.companySettings.delete(setting.id)
      }

      for (const pref of userPrefs) {
        await blink.db.userPreferences.delete(pref.id)
      }

      toast({
        title: 'Éxito',
        description: 'Todos los datos han sido eliminados'
      })

      // Reset local state
      setCompanySettings({
        name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        taxId: ''
      })

      setPreferences({
        language: 'es',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Europe/Madrid',
        emailNotifications: true,
        invoiceReminders: true,
        paymentNotifications: true,
        theme: 'light'
      })
    } catch (error) {
      console.error('Error deleting data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron eliminar todos los datos',
        variant: 'destructive'
      })
    }
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
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil, empresa y preferencias
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                El email no se puede cambiar
              </p>
            </div>

            <div>
              <Label htmlFor="displayName">Nombre para mostrar</Label>
              <Input
                id="displayName"
                value={user?.displayName || ''}
                onChange={(e) => setUser(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Tu nombre completo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nombre de la empresa</Label>
              <Input
                id="companyName"
                value={companySettings.name}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mi Empresa S.L."
              />
            </div>

            <div>
              <Label htmlFor="companyEmail">Email de la empresa</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contacto@miempresa.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Teléfono</Label>
                <Input
                  id="companyPhone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+34 123 456 789"
                />
              </div>
              <div>
                <Label htmlFor="taxId">NIF/CIF</Label>
                <Input
                  id="taxId"
                  value={companySettings.taxId}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, taxId: e.target.value }))}
                  placeholder="B12345678"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={companySettings.address}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Calle Principal 123, 1º A"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={companySettings.city}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Madrid"
                />
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={companySettings.country}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="España"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                value={companySettings.website}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.miempresa.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Preferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select value={preferences.language} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select value={preferences.currency} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, currency: value }))
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFormat">Formato de fecha</Label>
                <Select value={preferences.dateFormat} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, dateFormat: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Zona horaria</Label>
                <Select value={preferences.timezone} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, timezone: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                    <SelectItem value="America/New_York">Nueva York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select value={preferences.theme} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, theme: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Notificaciones por email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones generales por email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="invoiceReminders">Recordatorios de facturas</Label>
                <p className="text-sm text-muted-foreground">
                  Recordatorios de facturas vencidas
                </p>
              </div>
              <Switch
                id="invoiceReminders"
                checked={preferences.invoiceReminders}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, invoiceReminders: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="paymentNotifications">Notificaciones de pagos</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones cuando se reciban pagos
                </p>
              </div>
              <Switch
                id="paymentNotifications"
                checked={preferences.paymentNotifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, paymentNotifications: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Gestión de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>

            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Importar Datos
            </Button>

            <Button variant="destructive" onClick={deleteAllData}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Todo
            </Button>
          </div>

          <div className="mt-4 text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Exportar Datos:</strong> Descarga una copia de seguridad de todos tus datos en formato JSON.
            </p>
            <p>
              <strong>Importar Datos:</strong> Restaura datos desde una copia de seguridad (próximamente).
            </p>
            <p>
              <strong>Eliminar Todo:</strong> Elimina permanentemente todos tus datos. Esta acción no se puede deshacer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}