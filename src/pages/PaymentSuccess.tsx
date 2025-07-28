import { Button } from "@/components/ui/button";
import { CheckCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Tu suscripción a WatchHub Premium ha sido activada correctamente.
        </p>

        {/* Subscription Details */}
        <div className="bg-card border border-border rounded-lg p-6 text-left mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Detalles de tu suscripción:
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">Premium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio:</span>
              <span className="font-medium">$9.99/mes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo pago:</span>
              <span className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-medium text-green-600">Activo</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-left mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Heart className="w-5 h-5 text-primary mr-2" />
            Ahora puedes disfrutar de:
          </h3>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Calidad 4K + HDR
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              4 dispositivos simultáneos
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Contenido exclusivo
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Audio espacial
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Sin anuncios
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/home" className="block">
            <Button size="lg" className="w-full">
              Comenzar a ver contenido
            </Button>
          </Link>
          
          <Link to="/settings" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Gestionar suscripción
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}