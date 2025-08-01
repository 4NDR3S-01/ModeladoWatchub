import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Baby, Users, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfiles } from "@/hooks/useProfiles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const avatarOptions = [
  { id: "1", name: "Avatar 1", icon: "👤" },
  { id: "2", name: "Avatar 2", icon: "🎭" },
  { id: "3", name: "Avatar 3", icon: "🎨" },
  { id: "4", name: "Avatar 4", icon: "🎬" },
  { id: "5", name: "Avatar 5", icon: "🌟" },
  { id: "6", name: "Avatar 6", icon: "🎵" }
];

export default function Profiles() {
  const {
    profiles,
    loading,
    MAX_PROFILES,
    createProfile,
    updateProfile,
    deleteProfile
  } = useProfiles();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState<"adult" | "teen" | "kids">("adult");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const handleCreateProfile = async () => {
    if (profiles.length >= MAX_PROFILES) {
      toast({
        title: "Límite alcanzado",
        description: `Solo puedes tener un máximo de ${MAX_PROFILES} perfiles.`,
        variant: "destructive",
      });
      return;
    }

    if (!newProfileName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para el perfil.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAvatar) {
      toast({
        title: "Avatar requerido",
        description: "Por favor selecciona un avatar para el perfil.",
        variant: "destructive",
      });
      return;
    }

    const success = await createProfile({
      name: newProfileName.trim(),
      avatar_id: selectedAvatar,
      type: newProfileType,
    });

    if (success) {
      setIsCreateDialogOpen(false);
      setNewProfileName("");
      setNewProfileType("adult");
      setSelectedAvatar("");
    }
  };

  const handleEditProfile = async () => {
    const profileToEdit = profiles.find(p => p.id === selectedProfileId);
    if (!profileToEdit) return;

    if (!newProfileName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para el perfil.",
        variant: "destructive",
      });
      return;
    }

    const success = await updateProfile(selectedProfileId, {
      name: newProfileName.trim(),
      type: newProfileType,
      avatar_id: selectedAvatar,
    });

    if (success) {
      setIsEditDialogOpen(false);
      resetEditForm();
    }
  };

  const handleDeleteProfile = async () => {
    const success = await deleteProfile(selectedProfileId);
    
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedProfileId("");
    }
  };

  const openEditDialog = (profile: typeof profiles[0]) => {
    setSelectedProfileId(profile.id);
    setNewProfileName(profile.name);
    setNewProfileType(profile.type);
    setSelectedAvatar(profile.avatar_id || "");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (profileId: string) => {
    setSelectedProfileId(profileId);
    setDeleteDialogOpen(true);
  };

  const resetEditForm = () => {
    setSelectedProfileId("");
    setNewProfileName("");
    setNewProfileType("adult");
    setSelectedAvatar("");
  };

  const getAvatarIcon = (avatarId: string) => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.icon : "👤";
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

      {/* Loading state */}
      {loading && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando perfiles...</p>
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      {!loading && (
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Existing Profiles */}
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="w-20 h-20 mx-auto border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                      <AvatarImage src={profile.avatar_id} />
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {profile.avatar_id ? getAvatarIcon(profile.avatar_id) : getProfileIcon(profile.type)}
                      </AvatarFallback>
                    </Avatar>
                    {profile.is_main && (
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
                    <p className="text-sm text-primary font-medium">Perfil activo</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Usar perfil
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(profile)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {!profile.is_main && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDeleteDialog(profile.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

          {/* Add Profile Card */}
          {profiles.length < MAX_PROFILES && (
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
                    <p className="text-xs text-muted-foreground mt-2">
                      ({profiles.length}/{MAX_PROFILES} perfiles)
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
                    <Select 
                      value={newProfileType} 
                      onValueChange={(value) => setNewProfileType(value as 'adult' | 'teen' | 'kids')}
                    >
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
                      disabled={!newProfileName.trim() || !selectedAvatar}
                      className="flex-1"
                    >
                      Crear Perfil
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Max Profiles Reached Message */}
          {profiles.length >= MAX_PROFILES && (
            <Card className="border-dashed border-2 border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-yellow-500/50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Límite Alcanzado</h3>
                <p className="text-sm text-muted-foreground">
                  Has alcanzado el máximo de {MAX_PROFILES} perfiles
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Elimina un perfil para crear uno nuevo
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      )}

      {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="editName">Nombre del perfil</Label>
                <Input
                  id="editName"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Ingresa el nombre"
                />
              </div>

              {/* Profile Type */}
              <div className="space-y-2">
                <Label>Tipo de perfil</Label>
                <Select 
                  value={newProfileType} 
                  onValueChange={(value) => setNewProfileType(value as 'adult' | 'teen' | 'kids')}
                >
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
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetEditForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditProfile}
                  disabled={!newProfileName.trim()}
                  className="flex-1"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Profile Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el perfil
                "{profiles.find(p => p.id === selectedProfileId)?.name}" y todos sus datos asociados
                incluyendo historial de visualización, favoritos y configuraciones.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProfile}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar Perfil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Profile Management Tips */}
        <div className="mt-16 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Gestión de Perfiles Familiares
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
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
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Límite de Perfiles</h4>
              <p className="text-sm text-muted-foreground">
                Puedes crear hasta {MAX_PROFILES} perfiles por cuenta familiar. El perfil principal no se puede eliminar.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Edición Flexible</h4>
              <p className="text-sm text-muted-foreground">
                Cambia nombres, avatares y tipos de perfil en cualquier momento usando el botón de edición.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Gestión Segura</h4>
              <p className="text-sm text-muted-foreground">
                Solo los usuarios autorizados pueden crear, editar o eliminar perfiles familiares.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Avatares Únicos</h4>
              <p className="text-sm text-muted-foreground">
                Personaliza cada perfil con avatares distintivos para facilitar la identificación.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
