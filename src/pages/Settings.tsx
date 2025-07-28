import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Smartphone, 
  Globe, 
  CreditCard,
  HelpCircle,
  ChevronRight,
  Monitor,
  Volume2,
  Wifi,
  Eye,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [subtitles, setSubtitles] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [childrenMode, setChildrenMode] = useState(false);
  const [dataUsage, setDataUsage] = useState([2]);

  const settingsSections = [
    {
      id: "profile",
      title: "Perfil",
      icon: User,
      description: "Información personal y preferencias de cuenta"
    },
    {
      id: "notifications",
      title: "Notificaciones",
      icon: Bell,
      description: "Gestiona cómo y cuándo recibir notificaciones"
    },
    {
      id: "privacy",
      title: "Privacidad y Seguridad",
      icon: Shield,
      description: "Controla tu privacidad y configuración de seguridad"
    },
    {
      id: "playback",
      title: "Reproducción",
      icon: Monitor,
      description: "Configuración de video y audio"
    },
    {
      id: "devices",
      title: "Dispositivos",
      icon: Smartphone,
      description: "Gestiona dispositivos conectados"
    },
    {
      id: "language",
      title: "Idioma y Región",
      icon: Globe,
      description: "Configuración de idioma y ubicación"
    },
    {
      id: "billing",
      title: "Facturación",
      icon: CreditCard,
      description: "Suscripción y métodos de pago"
    }
  ];

  const connectedDevices = [
    { name: "iPhone 14 Pro", type: "Móvil", lastActive: "Activo ahora", location: "Ciudad de México" },
    { name: "Samsung Smart TV", type: "TV", lastActive: "Hace 2 horas", location: "Sala" },
    { name: "MacBook Pro", type: "Computadora", lastActive: "Hace 1 día", location: "Ciudad de México" },
    { name: "iPad Air", type: "Tablet", lastActive: "Hace 3 días", location: "Ciudad de México" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Personaliza tu experiencia en WatchHub
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          {/* Settings Navigation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-1">
              {settingsSections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center gap-2 h-auto p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-xs text-center">{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">María García</h3>
                    <p className="text-muted-foreground">maria.garcia@email.com</p>
                    <Badge variant="secondary" className="mt-1">Plan Premium</Badge>
                  </div>
                  <Button variant="outline" className="ml-auto">
                    Editar perfil
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Nombre completo</Label>
                    <p className="text-sm text-muted-foreground mt-1">María García López</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de nacimiento</Label>
                    <p className="text-sm text-muted-foreground mt-1">15 de marzo, 1992</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <p className="text-sm text-muted-foreground mt-1">+52 55 1234 5678</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">País</Label>
                    <p className="text-sm text-muted-foreground mt-1">México</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configuración de notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-general">Notificaciones generales</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones sobre nuevos contenidos</p>
                    </div>
                    <Switch
                      id="notifications-general"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-email">Notificaciones por email</Label>
                      <p className="text-sm text-muted-foreground">Recibir emails sobre recomendaciones</p>
                    </div>
                    <Switch id="notifications-email" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-push">Notificaciones push</Label>
                      <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
                    </div>
                    <Switch id="notifications-push" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-marketing">Marketing</Label>
                      <p className="text-sm text-muted-foreground">Ofertas especiales y promociones</p>
                    </div>
                    <Switch id="notifications-marketing" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacidad y Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="children-mode">Modo para niños</Label>
                      <p className="text-sm text-muted-foreground">Filtrar contenido no apropiado para menores</p>
                    </div>
                    <Switch
                      id="children-mode"
                      checked={childrenMode}
                      onCheckedChange={setChildrenMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing">Compartir datos de visualización</Label>
                      <p className="text-sm text-muted-foreground">Ayudar a mejorar recomendaciones</p>
                    </div>
                    <Switch id="data-sharing" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activity-history">Historial de actividad</Label>
                      <p className="text-sm text-muted-foreground">Guardar historial de reproducción</p>
                    </div>
                    <Switch id="activity-history" defaultChecked />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full justify-between">
                    Cambiar contraseña
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Autenticación de dos factores
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Exportar mis datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playback Settings */}
          <TabsContent value="playback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Configuración de reproducción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoplay">Reproducción automática</Label>
                      <p className="text-sm text-muted-foreground">Reproducir siguiente episodio automáticamente</p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={autoplay}
                      onCheckedChange={setAutoplay}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="subtitles">Subtítulos automáticos</Label>
                      <p className="text-sm text-muted-foreground">Mostrar subtítulos por defecto</p>
                    </div>
                    <Switch
                      id="subtitles"
                      checked={subtitles}
                      onCheckedChange={setSubtitles}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Calidad de video</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automática</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                        <SelectItem value="1080p">1080p HD</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="480p">480p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Idioma de audio preferido</Label>
                    <Select defaultValue="es">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="fr">Francés</SelectItem>
                        <SelectItem value="de">Alemán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Idioma de subtítulos</Label>
                    <Select defaultValue="es">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="fr">Francés</SelectItem>
                        <SelectItem value="none">Sin subtítulos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Settings */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Dispositivos conectados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {connectedDevices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {device.type === 'Móvil' && <Smartphone className="w-5 h-5 text-primary" />}
                          {device.type === 'TV' && <Monitor className="w-5 h-5 text-primary" />}
                          {device.type === 'Computadora' && <Monitor className="w-5 h-5 text-primary" />}
                          {device.type === 'Tablet' && <Smartphone className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">{device.type} • {device.location}</p>
                          <p className="text-xs text-muted-foreground">{device.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {device.lastActive === 'Activo ahora' && (
                          <Badge variant="secondary">Activo</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Límite de dispositivos</h4>
                      <p className="text-sm text-muted-foreground">
                        Tu plan Premium permite hasta 4 dispositivos simultáneos. Actualmente tienes 4 dispositivos conectados.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Idioma y región
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Idioma de la interfaz</Label>
                    <Select defaultValue="es">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Región</Label>
                    <Select defaultValue="mx">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mx">México</SelectItem>
                        <SelectItem value="us">Estados Unidos</SelectItem>
                        <SelectItem value="es">España</SelectItem>
                        <SelectItem value="ar">Argentina</SelectItem>
                        <SelectItem value="co">Colombia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Zona horaria</Label>
                    <Select defaultValue="america/mexico_city">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america/mexico_city">Ciudad de México (GMT-6)</SelectItem>
                        <SelectItem value="america/new_york">Nueva York (GMT-5)</SelectItem>
                        <SelectItem value="europe/madrid">Madrid (GMT+1)</SelectItem>
                        <SelectItem value="america/buenos_aires">Buenos Aires (GMT-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Formato de fecha</Label>
                    <Select defaultValue="dd/mm/yyyy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Facturación y suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Plan Premium</h3>
                      <p className="text-muted-foreground">$9 USD/mes</p>
                    </div>
                    <Badge variant="default">Activo</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Próximo pago</p>
                      <p className="font-medium">15 de febrero, 2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calidad</p>
                      <p className="font-medium">4K + HDR</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dispositivos</p>
                      <p className="font-medium">4 simultáneos</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Cambiar plan
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancelar suscripción
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Método de pago</h4>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">**** **** **** 4532</p>
                        <p className="text-sm text-muted-foreground">Visa • Expira 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Historial de pagos</h4>
                  <div className="space-y-2">
                    {[
                      { date: "15 Ene 2024", amount: "$199.00", status: "Pagado" },
                      { date: "15 Dic 2023", amount: "$199.00", status: "Pagado" },
                      { date: "15 Nov 2023", amount: "$199.00", status: "Pagado" }
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-foreground">{payment.date}</p>
                          <p className="text-sm text-muted-foreground">Plan Premium</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{payment.amount}</p>
                          <Badge variant="secondary" className="text-xs">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver historial completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}