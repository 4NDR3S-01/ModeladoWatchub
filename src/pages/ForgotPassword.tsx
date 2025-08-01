import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa tu correo electrónico.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Correo inválido",
        description: "Por favor ingresa un correo electrónico válido.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Correo enviado",
        description: "Te hemos enviado las instrucciones para restablecer tu contraseña.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: errorMessage || "No se pudo enviar el correo de recuperación.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-black/75" />
        </div>

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

        <div className="relative z-10 w-full max-w-lg mx-auto p-8">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              ¡Correo enviado!
            </h1>
            <p className="text-gray-300 mb-6">
              Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Revisa tu bandeja de entrada y la carpeta de spam. El enlace expirará en 1 hora.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-black/75" />
      </div>

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

      <div className="relative z-10 w-full max-w-lg mx-auto p-8">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-300">
              No te preocupes, te ayudamos a recuperar el acceso a tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Correo electrónico
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary pl-10"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400">
                Te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !email}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar instrucciones
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              ¿Recordaste tu contraseña?{" "}
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
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
