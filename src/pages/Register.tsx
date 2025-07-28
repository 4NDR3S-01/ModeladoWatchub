import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!acceptTerms) {
      toast({
        title: "Términos requeridos",
        description: "Debes aceptar los términos y condiciones.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Contraseñas no coinciden",
        description: "Las contraseñas deben ser idénticas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const displayName = `${formData.firstName} ${formData.lastName}`.trim();
    const { error } = await signUp(formData.email, formData.password, displayName);

    if (error) {
      toast({
        title: "Error en el registro",
        description: error.message || "Hubo un problema al crear tu cuenta.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente. Puedes iniciar sesión.",
      });
      navigate("/login");
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordRequirements = [
    { text: "Al menos 8 caracteres", met: formData.password.length >= 8 },
    { text: "Una mayúscula", met: /[A-Z]/.test(formData.password) },
    { text: "Una minúscula", met: /[a-z]/.test(formData.password) },
    { text: "Un número", met: /\d/.test(formData.password) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

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

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-lg mx-auto p-8">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Crear cuenta
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Únete a millones de usuarios que disfrutan WatchHub
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">
                  Nombre
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Tu nombre"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Tu apellido"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="tu@email.com"
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
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
              {formData.password && (
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
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirma tu contraseña"
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
              
              {formData.confirmPassword && (
                <div className="flex items-center text-sm mt-2">
                  <Check className={`w-4 h-4 mr-2 ${doPasswordsMatch ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={doPasswordsMatch ? 'text-green-300' : 'text-red-300'}>
                    {doPasswordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-primary mt-0.5"
                />
                <label htmlFor="terms" className="text-gray-300 text-sm leading-relaxed">
                  Acepto los{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Términos de Servicio
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={acceptMarketing}
                  onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-primary mt-0.5"
                />
                <label htmlFor="marketing" className="text-gray-300 text-sm leading-relaxed">
                  Quiero recibir ofertas especiales, recomendaciones personalizadas y actualizaciones por email
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!acceptTerms || !isPasswordValid || !doPasswordsMatch || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              ¿Ya tienes una cuenta?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-semibold"
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Al registrarte, aceptas que podemos procesar tu información de acuerdo con nuestra{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}