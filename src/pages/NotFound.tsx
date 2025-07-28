import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Animation */}
        <div className="relative">
          <h1 className="text-8xl font-bold gradient-text animate-pulse">404</h1>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 animate-bounce"></div>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="glass hover-scale">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
