import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, User, Baby, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profiles = [
  {
    id: "1",
    name: "Ana García",
    avatar: "",
    type: "adult",
    isMain: true,
    recentActivity: "Viendo: Breaking Bad",
    favorites: 12,
    watchTime: "45h este mes"
  },
  {
    id: "2",
    name: "Carlos",
    avatar: "",
    type: "adult",
    isMain: false,
    recentActivity: "Terminó: Stranger Things",
    favorites: 8,
    watchTime: "32h este mes"
  },
  {
    id: "3",
    name: "Sofía",
    avatar: "",
    type: "kids",
    isMain: false,
    recentActivity: "Viendo: Coco",
    favorites: 15,
    watchTime: "18h este mes"
  }
];

const avatarOptions = [
  { id: "1", name: "Avatar 1", icon: "👤" },
  { id: "2", name: "Avatar 2", icon: "🎭" },
  { id: "3", name: "Avatar 3", icon: "🎨" },
  { id: "4", name: "Avatar 4", icon: "🎬" },
  { id: "5", name: "Avatar 5", icon: "🌟" },
  { id: "6", name: "Avatar 6", icon: "🎵" }
];

export default function Profiles() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState("adult");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const handleCreateProfile = () => {
    // Here you would typically save to a database
    console.log("Creating profile:", { 
      name: newProfileName, 
      type: newProfileType, 
      avatar: selectedAvatar 
    });
    setIsCreateDialogOpen(false);
    setNewProfileName("");
    setNewProfileType("adult");
    setSelectedAvatar("");
  };

  const getProfileIcon = (type: string) => {
    switch (type) {
      case "kids":
        return <Baby className="w-5 h-5" />;
      case "teen":
        return <Users className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case "kids":
        return "Infantil";
      case "teen":
        return "Adolescente";
      default:
        return "Adulto";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Perfiles Familiares
          </h1>
          <p className="text-xl text-muted-foreground">
            Cada miembro de la familia tiene su propio espacio personalizado
          </p>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Existing Profiles */}
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-20 h-20 mx-auto border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {getProfileIcon(profile.type)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.isMain && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                      Principal
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl text-foreground">{profile.name}</CardTitle>
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {getProfileTypeLabel(profile.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-primary font-medium">{profile.recentActivity}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{profile.favorites}</div>
                    <div>Favoritos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{profile.watchTime.split(' ')[0]}</div>
                    <div>Horas vistas</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Usar perfil
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Profile Card */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-dashed border-2 border-muted-foreground/50 hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/50 group-hover:border-primary/50 flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Añadir Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Crea un nuevo perfil familiar
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Perfil</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del perfil</Label>
                  <Input
                    id="name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Ingresa el nombre"
                  />
                </div>

                {/* Profile Type */}
                <div className="space-y-2">
                  <Label>Tipo de perfil</Label>
                  <Select value={newProfileType} onValueChange={setNewProfileType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">Adulto (Sin restricciones)</SelectItem>
                      <SelectItem value="teen">Adolescente (13+ años)</SelectItem>
                      <SelectItem value="kids">Infantil (Contenido familiar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-2">
                  <Label>Selecciona un avatar</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl transition-colors ${
                          selectedAvatar === avatar.id
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/30 hover:border-primary/50"
                        }`}
                      >
                        {avatar.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateProfile}
                    disabled={!newProfileName.trim()}
                    className="flex-1"
                  >
                    Crear Perfil
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Management Tips */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Gestión de Perfiles Familiares
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Perfiles Personalizados</h4>
              <p className="text-sm text-muted-foreground">
                Cada perfil mantiene su historial de visualización, favoritos y recomendaciones únicos.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Control Parental</h4>
              <p className="text-sm text-muted-foreground">
                Los perfiles infantiles solo muestran contenido apropiado para la edad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
