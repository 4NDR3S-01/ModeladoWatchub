import { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar,
  MoreVertical,
  Settings,
  Eye,
  Crown
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

export default function AdminSubscriptions() {
  const [editingPlan, setEditingPlan] = useState<number | null>(null);

  const subscriptionStats = [
    {
      title: "Ingresos Mensuales",
      value: "$127,450",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Suscriptores Activos",
      value: "18,492",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Tasa de Conversión",
      value: "24.8%",
      change: "+3.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      title: "Retención Mensual",
      value: "89.3%",
      change: "+1.2%",
      trend: "up",
      icon: Calendar,
      color: "text-orange-500"
    }
  ];

  const subscriptionPlans = [
    {
      id: 1,
      name: "Plan Básico",
      price: 2.99,
      currency: "USD",
      interval: "month",
      subscribers: 8240,
      revenue: "$24,595",
      features: ["720p HD", "1 dispositivo", "Catálogo básico"],
      active: true,
      conversion: "18.2%"
    },
    {
      id: 2,
      name: "Plan Estándar",
      price: 5.99,
      interval: "month",
      currency: "USD",
      subscribers: 7830,
      revenue: "$46,905",
      features: ["1080p Full HD", "2 dispositivos", "Catálogo completo"],
      active: true,
      conversion: "42.5%"
    },
    {
      id: 3,
      name: "Plan Premium",
      price: 9.99,
      interval: "month",
      currency: "USD",
      subscribers: 2422,
      revenue: "$24,196",
      features: ["4K + HDR", "4 dispositivos", "Contenido exclusivo", "Audio espacial"],
      active: true,
      conversion: "15.8%"
    },
    {
      id: 4,
      name: "Plan Anual Básico",
      price: 29.99,
      interval: "year",
      currency: "USD",
      subscribers: 1240,
      revenue: "$37,187",
      features: ["720p HD", "1 dispositivo", "2 meses gratis"],
      active: true,
      conversion: "8.3%"
    }
  ];

  const recentSubscriptions = [
    { 
      id: 1, 
      user: "María González", 
      email: "maria.g@email.com", 
      plan: "Premium", 
      amount: "$9.99", 
      status: "Activa", 
      date: "2024-01-20",
      avatar: ""
    },
    { 
      id: 2, 
      user: "Carlos Rodríguez", 
      email: "carlos.r@email.com", 
      plan: "Estándar", 
      amount: "$5.99", 
      status: "Activa", 
      date: "2024-01-20",
      avatar: ""
    },
    { 
      id: 3, 
      user: "Ana López", 
      email: "ana.l@email.com", 
      plan: "Básico", 
      amount: "$2.99", 
      status: "Cancelada", 
      date: "2024-01-19",
      avatar: ""
    },
    { 
      id: 4, 
      user: "Luis Martín", 
      email: "luis.m@email.com", 
      plan: "Premium", 
      amount: "$9.99", 
      status: "Pausada", 
      date: "2024-01-19",
      avatar: ""
    }
  ];

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
    if (planName.includes("Premium")) return Crown;
    if (planName.includes("Estándar")) return CreditCard;
    return Users;
  };

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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Plan
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
          <h1 className="text-3xl font-bold text-foreground mb-6">Gestión de Suscripciones</h1>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionPlans.map((plan) => {
                      const PlanIcon = getPlanIcon(plan.name);
                      return (
                        <Card key={plan.id} className="relative">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <PlanIcon className="w-6 h-6 text-primary" />
                              <Switch checked={plan.active} />
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
                                <span className="font-medium text-green-600">{plan.revenue}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Conversión:</span>
                                <span className="font-medium">{plan.conversion}</span>
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

                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Plan Creation Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Crear Nuevo Plan</CardTitle>
                  <CardDescription>Define un nuevo plan de suscripción</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Nombre del Plan</label>
                      <Input placeholder="Ej: Plan Premium Plus" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Precio</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-md">
                          $
                        </span>
                        <Input placeholder="9.99" className="rounded-l-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Intervalo</label>
                      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                        <option value="month">Mensual</option>
                        <option value="year">Anual</option>
                        <option value="week">Semanal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Características</label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Ej: 4K Ultra HD, 6 dispositivos simultáneos, contenido exclusivo..."
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Crear Plan</Button>
                  </div>
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
                              <AvatarImage src={subscription.avatar} />
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
                          {subscription.amount}
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
                      <div className="text-3xl font-bold text-blue-600">24.8%</div>
                      <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">$47.50</div>
                      <p className="text-sm text-muted-foreground">Valor Promedio por Usuario</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">8.2</div>
                      <p className="text-sm text-muted-foreground">Meses Promedio de Retención</p>
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