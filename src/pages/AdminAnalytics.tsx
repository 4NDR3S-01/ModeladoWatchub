import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  Clock,
  Target,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  const kpiMetrics = [
    {
      title: "Usuarios Activos Diarios",
      value: "18,492",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
      previous: "16,439"
    },
    {
      title: "Tiempo Promedio de Visualización",
      value: "47 min",
      change: "+8.2%",
      trend: "up",
      icon: Clock,
      color: "text-green-500",
      previous: "43 min"
    },
    {
      title: "Tasa de Retención",
      value: "89.3%",
      change: "+3.1%",
      trend: "up",
      icon: Target,
      color: "text-purple-500",
      previous: "86.6%"
    },
    {
      title: "Ingresos por Usuario",
      value: "$47.50",
      change: "-2.1%",
      trend: "down",
      icon: DollarSign,
      color: "text-orange-500",
      previous: "$48.53"
    }
  ];

  const contentMetrics = [
    { title: "El Último Guardián", views: 45280, engagement: 92, completion: 78, category: "Acción" },
    { title: "Neo Tokyo 2099", views: 38950, engagement: 89, completion: 85, category: "Sci-Fi" },
    { title: "Corazones en París", views: 32100, engagement: 94, completion: 91, category: "Romance" },
    { title: "La Conspiración", views: 28750, engagement: 87, completion: 73, category: "Thriller" },
    { title: "Memorias Perdidas", views: 25300, engagement: 91, completion: 88, category: "Drama" }
  ];

  const userBehavior = [
    { metric: "Promedio de sesión", value: "47 min", change: "+8.2%" },
    { metric: "Páginas por sesión", value: "3.2", change: "+12.1%" },
    { metric: "Tasa de rebote", value: "28.5%", change: "-5.3%" },
    { metric: "Nuevos usuarios", value: "892", change: "+15.7%" },
    { metric: "Usuarios recurrentes", value: "17,600", change: "+11.2%" }
  ];

  const geoData = [
    { country: "México", users: 8420, revenue: "$42,100", percentage: 45.6 },
    { country: "España", users: 3210, revenue: "$18,950", percentage: 17.4 },
    { country: "Argentina", users: 2840, revenue: "$15,200", percentage: 15.4 },
    { country: "Colombia", users: 2180, revenue: "$12,890", percentage: 11.8 },
    { country: "Chile", users: 1842, revenue: "$9,210", percentage: 9.8 }
  ];

  const deviceMetrics = [
    { device: "Mobile", users: 11280, percentage: 61.1, change: "+15.2%" },
    { device: "Desktop", users: 4920, percentage: 26.6, change: "-3.1%" },
    { device: "Tablet", users: 1680, percentage: 9.1, change: "+8.7%" },
    { device: "Smart TV", users: 612, percentage: 3.2, change: "+22.4%" }
  ];

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
                Análisis Avanzado
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-red-500 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Análisis y Métricas</h1>
          <p className="text-muted-foreground">
            Insights detallados sobre el rendimiento de la plataforma
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="flex items-center text-xs">
                  {metric.trend === "up" ? (
                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground ml-1">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">General</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="geographic">Geografía</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tráfico y Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Gráfico de tráfico y engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Gráfico de crecimiento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Comportamiento del Usuario</CardTitle>
                <CardDescription>Métricas clave de comportamiento en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {userBehavior.map((behavior, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-foreground">{behavior.value}</div>
                      <p className="text-sm text-muted-foreground mb-1">{behavior.metric}</p>
                      <Badge 
                        variant={behavior.change.startsWith('+') ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {behavior.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Contenido</CardTitle>
                <CardDescription>Análisis detallado de películas más populares</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentMetrics.map((content, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{content.title}</h4>
                          <Badge variant="outline">{content.category}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Visualizaciones: </span>
                            <span className="font-medium">{content.views.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Engagement: </span>
                            <span className="font-medium">{content.engagement}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Finalización: </span>
                            <span className="font-medium">{content.completion}%</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Progress value={content.views / 500} className="h-2" />
                          </div>
                          <div>
                            <Progress value={content.engagement} className="h-2" />
                          </div>
                          <div>
                            <Progress value={content.completion} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Dispositivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceMetrics.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{device.users.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {device.percentage}% 
                            <span className={device.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                              {device.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Cohortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Análisis de retención por cohortes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Ingresos por Tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Gráfico de ingresos temporales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Ingresos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$127,450</div>
                    <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">$47.50</div>
                    <p className="text-sm text-muted-foreground">ARPU (Average Revenue Per User)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">89.3%</div>
                    <p className="text-sm text-muted-foreground">Tasa de Retención</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8.2</div>
                    <p className="text-sm text-muted-foreground">Meses de Vida del Cliente</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geographic Tab */}
          <TabsContent value="geographic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios por País</CardTitle>
                  <CardDescription>Distribución geográfica de la audiencia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geoData.map((geo, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{geo.country}</span>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-medium">{geo.users.toLocaleString()} usuarios</div>
                          <div className="text-sm text-green-600">{geo.revenue}</div>
                          <Progress value={geo.percentage} className="h-2 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mapa de Calor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Mapa mundial de usuarios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Velocidad de Carga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">1.2s</div>
                    <p className="text-sm text-muted-foreground">Tiempo promedio de carga</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Excelente</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime del sistema</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Operativo</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ancho de Banda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">2.1TB</div>
                    <p className="text-sm text-muted-foreground">Transferencia diaria</p>
                    <Badge className="mt-2 bg-purple-100 text-purple-800">Normal</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Monitor de rendimiento en tiempo real</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}