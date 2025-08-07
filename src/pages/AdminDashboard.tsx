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
  MoreVertical,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const { metrics, contentMetrics, topMovies, recentActivities, loading, error } = useAdminMetrics();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión.",
        variant: "destructive",
      });
      // Navegamos de todas formas en caso de error
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const stats = [
    {
      title: "Usuarios Totales",
      value: metrics.totalUsers.toLocaleString(),
      change: `+${metrics.newUsers}`,
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Usuarios Activos",
      value: metrics.activeUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Total Contenido",
      value: metrics.totalContent.toLocaleString(),
      change: `${metrics.publishedContent} publicado`,
      trend: "up",
      icon: Film,
      color: "text-purple-500"
    },
    {
      title: "Contenido Publicado",
      value: metrics.publishedContent.toLocaleString(),
      change: `${metrics.draftContent} borradores`,
      trend: "up",
      icon: Eye,
      color: "text-orange-500"
    }
  ];

  // These variables are already loaded from the hook
  // const recentActivities and const topMovies are removed

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
              {/* Dropdown Menu for Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-red-500 text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'AD'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="absolute -bottom-1 -right-1 w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Administrador</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'admin@watchhub.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                        src={movie.poster_url || "/placeholder.svg"} 
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{movie.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {(movie.views || 0).toLocaleString()} vistas
                          </span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {movie.rating || 0}
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