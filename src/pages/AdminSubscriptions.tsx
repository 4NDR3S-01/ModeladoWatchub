import { useState } from "react";
import { 
  CreditCard, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar,
  MoreVertical,
  Settings,
  Eye,
  Crown,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useToast } from "@/hooks/use-toast";

export default function AdminSubscriptions() {
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const { stats, plans, recentSubscriptions, loading, error, refetch } = useAdminSubscriptions();
  const { toast } = useToast();

  const subscriptionStats = [
    {
      title: "Ingresos Mensuales",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Suscriptores Activos",
      value: stats.activeSubscribers.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Tasa de Conversión",
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: "+3.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      title: "Retención Mensual",
      value: `${stats.monthlyRetention}%`,
      change: "+1.2%",
      trend: "up",
      icon: Calendar,
      color: "text-orange-500"
    }
  ];

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Datos actualizados",
        description: "Los datos de suscripciones se han actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activa": return "bg-green-100 text-green-800";
      case "Cancelada": return "bg-red-100 text-red-800";
      case "Pausada": return "bg-yellow-100 text-yellow-800";
      case "Vencida": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes("premium")) return Crown;
    if (planName.toLowerCase().includes("estándar") || planName.toLowerCase().includes("standard")) return CreditCard;
    return Users;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos de suscripciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">Error al cargar los datos: {error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-2xl font-bold text-foreground">
                Watch<span className="text-red-500">Hub</span>
                <span className="text-sm text-red-500 ml-2">Admin</span>
              </Link>
              <Badge variant="outline" className="text-xs">
                Gestión de Suscripciones
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-red-500 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Title and Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Suscripciones</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Datos en tiempo real
              </Badge>
              <span>•</span>
              <span>Solo usuarios de bienvenida</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-green-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change} desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">Planes</TabsTrigger>
            <TabsTrigger value="subscribers">Suscriptores</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Subscription Plans */}
          <TabsContent value="plans">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planes de Suscripción</CardTitle>
                  <CardDescription>Gestiona los planes disponibles y sus características</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                      const PlanIcon = getPlanIcon(plan.name);
                      return (
                        <Card key={plan.id} className="relative">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <PlanIcon className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <div className="text-2xl font-bold text-foreground">
                              ${plan.price}
                              <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Suscriptores:</span>
                                <span className="font-medium">{plan.subscribers.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ingresos:</span>
                                <span className="font-medium text-green-600">${plan.revenue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Conversión:</span>
                                <span className="font-medium">{plan.conversion}%</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Características:</h4>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {plans.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Cargando planes de suscripción...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers */}
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Suscriptores Recientes</CardTitle>
                <CardDescription>Lista de las últimas suscripciones y cambios</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSubscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay suscripciones recientes</p>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={subscription.avatar || ''} />
                              <AvatarFallback>
                                {subscription.user.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{subscription.user}</p>
                              <p className="text-sm text-muted-foreground">{subscription.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscription.plan}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${subscription.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Gráfico de ingresos por plan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retención de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Análisis de retención</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Métricas de Conversión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{stats.conversionRate.toFixed(1)}%</div>
                      <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">${(stats.monthlyRevenue / Math.max(stats.activeSubscribers, 1)).toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Valor Promedio por Usuario</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{stats.monthlyRetention.toFixed(1)}</div>
                      <p className="text-sm text-muted-foreground">Retención Mensual (%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Pagos</CardTitle>
                  <CardDescription>Configura los métodos de pago y políticas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Stripe Payments</h4>
                      <p className="text-sm text-muted-foreground">Procesar pagos con tarjeta de crédito</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">PayPal</h4>
                      <p className="text-sm text-muted-foreground">Permitir pagos con PayPal</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Período de Gracia</h4>
                      <p className="text-sm text-muted-foreground">Días de gracia para pagos fallidos</p>
                    </div>
                    <Input className="w-20" defaultValue="3" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Reembolsos Automáticos</h4>
                      <p className="text-sm text-muted-foreground">Procesar reembolsos automáticamente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones de Suscripción</CardTitle>
                  <CardDescription>Configura cuándo enviar notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recordatorio de vencimiento (días antes)</span>
                    <Input className="w-20" defaultValue="7" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificar cancelaciones</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alertas de pagos fallidos</span>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}