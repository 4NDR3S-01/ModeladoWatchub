import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  CreditCard,
  HelpCircle,
  ChevronRight,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { use2FA } from "@/hooks/use2FA";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useSubscribers } from "@/hooks/useSubscribers";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useToast } from "@/hooks/use-toast";
import { EditProfileDialog } from "@/components/ui/edit-profile-dialog";
import TwoFactorDialog from "@/components/TwoFactorDialog";
import PaymentMethodsDialog from "@/components/PaymentMethodsDialog";
import SubscriptionDialog from "@/components/SubscriptionDialog";

export default function Settings() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { currentDevice, connectedDevices, disconnectDevice } = useDeviceDetection();
  const { twoFactor } = use2FA();
  const { currentSubscription, subscriptionHistory } = useSubscriptions();
  const { subscriber, getSubscriptionStatus, getDaysRemaining, isActive } = useSubscribers();
  const { paymentMethods } = usePaymentMethods();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [isPaymentMethodsDialogOpen, setIsPaymentMethodsDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [subtitles, setSubtitles] = useState(true);
  const [childrenMode, setChildrenMode] = useState(false);

  const handleUpdateProfile = async (displayName: string) => {
    return await updateProfile({ display_name: displayName });
  };

  const handleDisconnectDevice = (sessionId: string, deviceName: string) => {
    const success = disconnectDevice(sessionId);
    if (!success) {
      toast({
        title: "No se puede desconectar",
        description: "No puedes desconectar el dispositivo que estás usando actualmente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Dispositivo desconectado",
      description: `Se ha desconectado "${deviceName}" exitosamente.`,
    });
  };

  const getSubscriptionPlanDisplay = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'Plan Premium';
      case 'standard':
        return 'Plan Estándar';
      case 'basic':
        return 'Plan Básico';
      default:
        return 'Plan Básico';
    }
  };

  const getSubscriptionPrice = (plan: string) => {
    switch (plan) {
      case 'premium':
        return '$19.99';
      case 'standard':
        return '$14.99';
      case 'basic':
        return '$9.99';
      default:
        return '$9.99';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
                {profileLoading ? (
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {profile?.display_name || user?.email?.split('@')[0] || 'Usuario'}
                      </h3>
                      <p className="text-muted-foreground">{user?.email || 'No disponible'}</p>
                      <Badge variant="secondary" className="mt-1">
                        {profile ? getSubscriptionPlanDisplay(profile.subscription_plan) : 'Plan Básico'}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-auto"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
                      Editar perfil
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Nombre para mostrar</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profileLoading ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        profile?.display_name || user?.email?.split('@')[0] || 'No disponible'
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Correo electrónico</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.email || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de registro</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profileLoading ? (
                        <Skeleton className="h-4 w-40" />
                      ) : (() => {
                        if (profile?.created_at) return formatDate(profile.created_at);
                        if (user?.created_at) return formatDate(user.created_at);
                        return 'No disponible';
                      })()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Última actualización</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profileLoading ? (
                        <Skeleton className="h-4 w-40" />
                      ) : (() => {
                        if (profile?.updated_at) return formatDate(profile.updated_at);
                        return 'No disponible';
                      })()}
                    </p>
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => setIs2FADialogOpen(true)}
                  >
                    <div className="flex items-center gap-2">
                      <span>Autenticación de dos factores</span>
                      <Badge variant={twoFactor.isEnabled ? "default" : "secondary"} className="text-xs">
                        {twoFactor.isEnabled ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
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
                {/* Current Device Info */}
                {currentDevice && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        {currentDevice.type === 'Móvil' && <Smartphone className="w-5 h-5 text-primary" />}
                        {currentDevice.type === 'TV' && <Monitor className="w-5 h-5 text-primary" />}
                        {currentDevice.type === 'Computadora' && <Monitor className="w-5 h-5 text-primary" />}
                        {currentDevice.type === 'Tablet' && <Smartphone className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          {currentDevice.name}
                          <Badge variant="default" className="text-xs">Este dispositivo</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {currentDevice.type} • {currentDevice.os} • {currentDevice.lastActive}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Todos los dispositivos</h4>
                    <p className="text-sm text-muted-foreground">
                      {connectedDevices.length} dispositivo{connectedDevices.length !== 1 ? 's' : ''} conectado{connectedDevices.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {connectedDevices.map((device, index) => (
                    <div key={device.sessionId || index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {device.type === 'Móvil' && <Smartphone className="w-5 h-5 text-primary" />}
                          {device.type === 'TV' && <Monitor className="w-5 h-5 text-primary" />}
                          {device.type === 'Computadora' && <Monitor className="w-5 h-5 text-primary" />}
                          {device.type === 'Tablet' && <Smartphone className="w-5 h-5 text-primary" />}
                          {device.type === 'Desconocido' && <HelpCircle className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            {device.name}
                            {device.isCurrent && (
                              <Badge variant="secondary" className="text-xs">Actual</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {device.type} • {device.browser} • {device.lastActive}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sistema: {device.os}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {device.lastActive === 'Activo ahora' && (
                          <Badge variant="secondary">Activo</Badge>
                        )}
                        {!device.isCurrent && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnectDevice(device.sessionId, device.name)}
                          >
                            Desconectar
                          </Button>
                        )}
                        {device.isCurrent && (
                          <Button variant="ghost" size="sm" disabled>
                            Dispositivo actual
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Dispositivo actual detectado</h4>
                      <p className="text-sm text-muted-foreground">
                        Estás usando {currentDevice?.name || 'un dispositivo desconocido'} con {currentDevice?.browser || 'navegador desconocido'} 
                        en {currentDevice?.os || 'sistema desconocido'}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Límite de dispositivos</h4>
                      <p className="text-sm text-muted-foreground">
                        Tu plan {profile ? getSubscriptionPlanDisplay(profile.subscription_plan) : 'Básico'} permite hasta 4 dispositivos simultáneos. 
                        Actualmente tienes {connectedDevices.length} dispositivo{connectedDevices.length !== 1 ? 's' : ''} conectado{connectedDevices.length !== 1 ? 's' : ''}.
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
                {/* Información de suscripción desde tabla subscribers */}
                {subscriber && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Estado de Suscripción
                        </h3>
                        <p className="text-muted-foreground">
                          Información oficial desde la tabla subscribers
                        </p>
                      </div>
                      <Badge variant={isActive() ? 'default' : 'secondary'}>
                        {getSubscriptionStatus()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-medium">
                          {subscriber.subscription_tier ? 
                            getSubscriptionPlanDisplay(subscriber.subscription_tier) : 
                            'Sin plan específico'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado de pago</p>
                        <p className="font-medium">
                          {subscriber.subscribed ? 'Suscripción activa' : 'No suscrito'}
                        </p>
                      </div>
                      {subscriber.subscription_end && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const days = getDaysRemaining();
                              return days && days > 0 ? 'Expira' : 'Expiró';
                            })()}
                          </p>
                          <p className="font-medium">
                            {formatDate(subscriber.subscription_end)}
                          </p>
                          {getDaysRemaining() !== null && (
                            <p className="text-xs text-muted-foreground">
                              {(() => {
                                const days = getDaysRemaining();
                                return days && days > 0 
                                  ? `${days} días restantes`
                                  : `Expirado hace ${Math.abs(days || 0)} días`;
                              })()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email registrado</p>
                        <p className="font-medium">{subscriber.email}</p>
                      </div>
                      {subscriber.stripe_customer_id && (
                        <div>
                          <p className="text-muted-foreground">ID Stripe</p>
                          <p className="font-mono text-xs">{subscriber.stripe_customer_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Métodos de pago */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Métodos de pago</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsPaymentMethodsDialogOpen(true)}
                    >
                      Gestionar tarjetas
                    </Button>
                  </div>
                  
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.slice(0, 2).map((card) => (
                        <div key={card.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                **** **** **** {card.card_last4}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {card.card_brand.charAt(0).toUpperCase() + card.card_brand.slice(1)} • Expira {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}
                              </p>
                            </div>
                          </div>
                          {card.is_default && (
                            <Badge variant="default" className="text-xs">
                              Predeterminada
                            </Badge>
                          )}
                        </div>
                      ))}
                      {paymentMethods.length > 2 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{paymentMethods.length - 2} tarjetas más
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tienes métodos de pago guardados</p>
                      <Button 
                        variant="outline"
                        onClick={() => setIsPaymentMethodsDialogOpen(true)}
                      >
                        Agregar tarjeta
                      </Button>
                    </div>
                  )}
                </div>

                {/* Historial de suscripciones */}
                {subscriptionHistory.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Historial de suscripciones</h4>
                    <div className="space-y-2">
                      {subscriptionHistory.slice(0, 3).map((subscription) => (
                        <div key={subscription.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                          <div>
                            <p className="font-medium text-foreground">
                              {getSubscriptionPlanDisplay(subscription.plan)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(subscription.date)} - {subscription.action}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">{getSubscriptionPrice(subscription.plan)}/mes</p>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {(() => {
                                if (subscription.action === 'subscribed') return 'Suscrito';
                                if (subscription.action === 'cancelled') return 'Cancelado';
                                if (subscription.action === 'renewed') return 'Renovado';
                                return 'Actualizado';
                              })()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    {subscriptionHistory.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsSubscriptionDialogOpen(true)}
                      >
                        Ver historial completo
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          currentDisplayName={profile?.display_name || user?.email?.split('@')[0] || ''}
          onSave={handleUpdateProfile}
        />

        {/* Two Factor Authentication Dialog */}
        <TwoFactorDialog
          open={is2FADialogOpen}
          onOpenChange={setIs2FADialogOpen}
        />

        {/* Payment Methods Dialog */}
        <PaymentMethodsDialog
          open={isPaymentMethodsDialogOpen}
          onOpenChange={setIsPaymentMethodsDialogOpen}
        />

        {/* Subscription Dialog */}
        <SubscriptionDialog
          open={isSubscriptionDialogOpen}
          onOpenChange={setIsSubscriptionDialogOpen}
        />
      </div>
    </div>
  );
}