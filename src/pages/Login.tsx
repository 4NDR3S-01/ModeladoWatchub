import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { role } = useUserRole();

  useEffect(() => {
    if (user && role) {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa tu email y contraseña.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }


    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Email o contraseña incorrectos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "¡Bienvenido!",
      description: "Has iniciado sesión correctamente.",
    });

    setIsLoading(false);
    
    // La redirección se manejará automáticamente en el useEffect 
    // cuando el contexto se actualice con el nuevo usuario
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
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

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-primary"
                />
                <label htmlFor="remember" className="text-gray-300 text-sm">
                  Recordarme
                </label>
              </div>
              
              <Link 
                to="/forgot-password" 
                className="text-sm text-gray-300 hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              ¿Nuevo en WatchHub?{" "}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-semibold"
              >
                Regístrate ahora
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Esta página está protegida por Google reCAPTCHA para asegurar que no eres un robot.{" "}
              <button
                type="button"
                className="text-primary hover:underline p-0 bg-transparent border-none cursor-pointer inline underline"
                aria-label="Más información sobre Google reCAPTCHA"
                onClick={() => {
                  // Aquí puedes abrir un modal o redirigir a una página de información real
                  window.open("https://www.google.com/recaptcha/about/", "_blank", "noopener,noreferrer");
                }}
              >
                Más información
              </button>
            </p>
          </div>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 bg-blue-900/20 backdrop-blur-sm rounded-lg p-4 border border-blue-700">
          <h3 className="text-blue-300 font-semibold mb-2">Cuenta de demostración:</h3>
          <p className="text-blue-200 text-sm">
            Email: demo@watchhub.com<br />
            Contraseña: demo123
          </p>
        </div>
      </div>
    </div>
  );
}