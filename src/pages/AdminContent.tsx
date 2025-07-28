import { useState } from "react";
import { 
  Film, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Calendar,
  Upload,
  Download,
  MoreVertical,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function AdminContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const movies = [
    {
      id: 1,
      title: "El Último Guardián",
      category: "Acción",
      status: "Publicado",
      views: 45280,
      rating: 4.8,
      duration: "2h 15m",
      uploadDate: "2024-01-15",
      image: "/src/assets/movie-1.jpg",
      size: "2.1 GB"
    },
    {
      id: 2,
      title: "Neo Tokyo 2099",
      category: "Sci-Fi",
      status: "Publicado",
      views: 38950,
      rating: 4.7,
      duration: "2h 32m",
      uploadDate: "2024-01-12",
      image: "/src/assets/movie-3.jpg",
      size: "2.8 GB"
    },
    {
      id: 3,
      title: "Corazones en París",
      category: "Romance",
      status: "Borrador",
      views: 0,
      rating: 0,
      duration: "1h 58m",
      uploadDate: "2024-01-20",
      image: "/src/assets/movie-2.jpg",
      size: "1.9 GB"
    },
    {
      id: 4,
      title: "La Conspiración",
      category: "Thriller",
      status: "Publicado",
      views: 28750,
      rating: 4.5,
      duration: "2h 08m",
      uploadDate: "2024-01-10",
      image: "/src/assets/movie-1.jpg",
      size: "2.3 GB"
    },
    {
      id: 5,
      title: "Memorias Perdidas",
      category: "Drama",
      status: "En Revisión",
      views: 0,
      rating: 0,
      duration: "1h 45m",
      uploadDate: "2024-01-18",
      image: "/src/assets/movie-2.jpg",
      size: "1.7 GB"
    }
  ];

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "accion", label: "Acción" },
    { value: "drama", label: "Drama" },
    { value: "comedia", label: "Comedia" },
    { value: "thriller", label: "Thriller" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "romance", label: "Romance" }
  ];

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "published", label: "Publicado" },
    { value: "draft", label: "Borrador" },
    { value: "review", label: "En Revisión" },
    { value: "archived", label: "Archivado" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publicado": return "bg-green-100 text-green-800";
      case "Borrador": return "bg-gray-100 text-gray-800";
      case "En Revisión": return "bg-yellow-100 text-yellow-800";
      case "Archivado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
                Gestión de Contenido
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Película
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
          <h1 className="text-3xl font-bold text-foreground mb-4">Gestión de Contenido</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Películas</p>
                    <p className="text-2xl font-bold text-foreground">245</p>
                  </div>
                  <Film className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Publicadas</p>
                    <p className="text-2xl font-bold text-foreground">198</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En Revisión</p>
                    <p className="text-2xl font-bold text-foreground">32</p>
                  </div>
                  <Settings className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Almacenamiento</p>
                    <p className="text-2xl font-bold text-foreground">1.2TB</p>
                  </div>
                  <Download className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="grid">Cuadrícula</TabsTrigger>
              <TabsTrigger value="upload">Subir Contenido</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar películas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filters */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List View */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Catálogo de Películas</CardTitle>
                <CardDescription>Gestiona todo el contenido de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Película</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vistas</TableHead>
                      <TableHead>Calificación</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movies.map((movie) => (
                      <TableRow key={movie.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={movie.image} 
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium text-foreground">{movie.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {movie.duration} • {movie.size}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{movie.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(movie.status)}>
                            {movie.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1 text-muted-foreground" />
                            {movie.views.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {movie.rating || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                            {new Date(movie.uploadDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
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

          {/* Grid View */}
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <Card key={movie.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={movie.image} 
                      alt={movie.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${getStatusColor(movie.status)}`}
                    >
                      {movie.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{movie.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Categoría:</span>
                        <Badge variant="outline" className="text-xs">{movie.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Vistas:</span>
                        <span>{movie.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {movie.rating || "N/A"}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Upload Content */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Subir Nueva Película</CardTitle>
                <CardDescription>Agrega nuevo contenido al catálogo de WatchHub</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Arrastra y suelta el archivo de video
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Formatos soportados: MP4, AVI, MOV, MKV (Máximo 10GB)
                  </p>
                  <Button>
                    Seleccionar Archivo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Título</label>
                      <Input placeholder="Nombre de la película" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Categoría</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accion">Acción</SelectItem>
                          <SelectItem value="drama">Drama</SelectItem>
                          <SelectItem value="comedia">Comedia</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="sci-fi">Ciencia Ficción</SelectItem>
                          <SelectItem value="romance">Romance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Año</label>
                      <Input placeholder="2024" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Duración</label>
                      <Input placeholder="2h 15m" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Director</label>
                      <Input placeholder="Nombre del director" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Actores</label>
                      <Input placeholder="Actor 1, Actor 2, Actor 3" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Descripción</label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Descripción de la película..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Imagen de portada</h4>
                  <p className="text-sm text-muted-foreground mb-4">JPG, PNG o WEBP (Recomendado: 1920x1080)</p>
                  <Button variant="outline" size="sm">
                    Subir Imagen
                  </Button>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Guardar como Borrador</Button>
                  <Button>Publicar Película</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}