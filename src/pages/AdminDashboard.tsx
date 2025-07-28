import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Film, 
  CreditCard, 
  TrendingUp, 
  Eye, 
  DollarSign,
  Calendar,
  Activity,
  Star,
  Download,
  Settings,
  Bell,
  Search,
  Plus,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    {
      title: "Usuarios Activos",
      value: "24,891",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Ingresos del Mes",
      value: "$127,450",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Películas Vistas",
      value: "156,203",
      change: "+15.1%",
      trend: "up",
      icon: Eye,
      color: "text-purple-500"
    },
    {
      title: "Nuevas Suscripciones",
      value: "892",
      change: "+6.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ];

  const recentActivities = [
    { type: "user", message: "Nuevo usuario registrado: María González", time: "Hace 2 min" },
    { type: "content", message: "Película 'El Último Guardián' agregada al catálogo", time: "Hace 15 min" },
    { type: "payment", message: "Pago recibido: Plan Premium ($9.99)", time: "Hace 23 min" },
    { type: "system", message: "Backup automático completado", time: "Hace 1 hora" },
    { type: "user", message: "Usuario premium canceló suscripción", time: "Hace 2 horas" }
  ];

  const topMovies = [
    { title: "El Último Guardián", views: 45280, rating: 4.8, image: "/src/assets/movie-1.jpg" },
    { title: "Neo Tokyo 2099", views: 38950, rating: 4.7, image: "/src/assets/movie-3.jpg" },
    { title: "Corazones en París", views: 32100, rating: 4.6, image: "/src/assets/movie-2.jpg" },
    { title: "La Conspiración", views: 28750, rating: 4.5, image: "/src/assets/movie-1.jpg" },
    { title: "Memorias Perdidas", views: 25300, rating: 4.4, image: "/src/assets/movie-2.jpg" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/welcome" className="text-2xl font-bold text-foreground">
                Watch<span className="text-red-500">Hub</span>
                <span className="text-sm text-red-500 ml-2">Admin</span>
              </Link>
              <Badge variant="destructive" className="text-xs">
                Panel de Administración
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-red-500 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Panel de Administración</h1>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/content">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Film className="w-4 h-4 mr-2" />
                Gestionar Contenido
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Button>
            </Link>
            <Link to="/admin/subscriptions">
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Suscripciones
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Análisis Avanzado
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ingresos y Usuarios
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-sm border border-border rounded px-2 py-1 bg-background"
                  >
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="90d">Últimos 90 días</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Gráfico de ingresos y usuarios activos</p>
                    <p className="text-sm text-muted-foreground">Integración de gráficos pendiente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Movies */}
            <Card>
              <CardHeader>
                <CardTitle>Películas Más Populares</CardTitle>
                <CardDescription>Contenido más visto en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMovies.map((movie, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <img 
                        src={movie.image} 
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{movie.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {movie.views.toLocaleString()} vistas
                          </span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {movie.rating}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                        activity.type === 'user' ? 'bg-blue-500' :
                        activity.type === 'content' ? 'bg-green-500' :
                        activity.type === 'payment' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}>
                        {activity.type === 'user' ? <Users className="w-3 h-3" /> :
                         activity.type === 'content' ? <Film className="w-3 h-3" /> :
                         activity.type === 'payment' ? <DollarSign className="w-3 h-3" /> :
                         <Activity className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uso del servidor</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Almacenamiento</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Ancho de banda</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado general</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Operativo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}