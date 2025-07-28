import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación de admin
    console.log("Admin login attempt:", { email, password, rememberMe });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-black/80" />
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
        <div className="bg-black/90 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-300">
              Acceso restringido solo para administradores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email de Administrador
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@watchhub.com"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
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
                  placeholder="Contraseña de administrador"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 pr-10"
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
                  className="border-gray-600 data-[state=checked]:bg-red-600"
                />
                <label htmlFor="remember" className="text-gray-300 text-sm">
                  Mantener sesión
                </label>
              </div>
              
              <Link 
                to="/admin/forgot-password" 
                className="text-sm text-gray-300 hover:text-red-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Link to="/admin/dashboard">
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
              >
                Acceder al Panel
              </Button>
            </Link>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300 text-sm">
              ¿Necesitas acceso de administrador?{" "}
              <Link 
                to="/admin/register" 
                className="text-red-400 hover:underline font-semibold"
              >
                Solicitar registro
              </Link>
            </p>
          </div>

          <div className="mt-6 bg-red-900/20 backdrop-blur-sm rounded-lg p-4 border border-red-700">
            <h3 className="text-red-300 font-semibold mb-2">Cuenta de demostración:</h3>
            <p className="text-red-200 text-sm">
              Email: admin@watchhub.com<br />
              Contraseña: admin123
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Este panel está protegido con autenticación de alto nivel.{" "}
              <a href="#" className="text-red-400 hover:underline">
                Más información sobre seguridad
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}