import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2, Check, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si tenemos los parámetros de recuperación
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Establecer la sesión con los tokens de recuperación
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams]);

  const passwordRequirements = [
    { text: "Al menos 8 caracteres", met: password.length >= 8 },
    { text: "Una mayúscula", met: /[A-Z]/.test(password) },
    { text: "Una minúscula", met: /[a-z]/.test(password) },
    { text: "Un número", met: /\d/.test(password) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password || !confirmPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa ambos campos de contraseña.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Contraseña inválida",
        description: "La contraseña debe cumplir con todos los requisitos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Contraseñas no coinciden",
        description: "Las contraseñas deben ser idénticas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido restablecida exitosamente.",
      });

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: errorMessage || "No se pudo restablecer la contraseña.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 py-6">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center text-white hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-2xl font-bold">
              Watch<span className="text-primary">Hub</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Reset Password Form */}
      <div className="relative z-10 w-full max-w-lg mx-auto p-8">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Restablecer contraseña
            </h1>
            <p className="text-gray-300">
              Ingresa tu nueva contraseña segura
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className={`w-4 h-4 mr-2 ${req.met ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className={req.met ? 'text-green-300' : 'text-gray-400'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {confirmPassword && (
                <div className="flex items-center text-sm mt-2">
                  <Check className={`w-4 h-4 mr-2 ${doPasswordsMatch ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={doPasswordsMatch ? 'text-green-300' : 'text-red-300'}>
                    {doPasswordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Restablecer contraseña
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              ¿Ya tienes acceso?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-semibold"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Al restablecer tu contraseña, aceptas nuestros{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Términos de Servicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
