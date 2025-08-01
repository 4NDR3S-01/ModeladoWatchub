import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Search, Bell, User, Settings, LogOut, Menu, X, Crown, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force navigation to welcome page
      navigate("/welcome", { replace: true });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still navigate to welcome even if there's an error
      navigate("/welcome", { replace: true });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-sm border-b border-border' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-white">
                Watch<span className="text-primary">Hub</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link to="/categories" className="text-white/70 hover:text-primary transition-colors">
                Películas
              </Link>
              <Link to="/my-list" className="text-white/70 hover:text-primary transition-colors">
                Mi Lista
              </Link>
              <Link to="/subscriptions" className="text-white/70 hover:text-primary transition-colors">
                Planes
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Link to="/search" className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar contenido..."
                  className="pl-10 w-48 xl:w-64 bg-secondary/50 border-border text-white placeholder:text-muted-foreground"
                />
              </Link>

              {/* Mobile search */}
              <Link to="/search">
                <Button variant="ghost" size="sm" className="lg:hidden text-white">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-white relative hidden sm:flex">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt="Usuario" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-popover border-border shadow-lg" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Usuario</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center mt-2">
                          <Crown className="w-3 h-3 text-premium-gold mr-1" />
                          <span className="text-xs text-premium-gold font-medium">Plan Premium</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profiles" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Gestionar perfiles</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscriptions" className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Suscripción</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => navigate("/login")}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Iniciar sesión
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-14 sm:top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <nav className="space-y-4">
                <Link
                  to="/"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/categories"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Películas
                </Link>
                <Link
                  to="/my-list"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mi Lista
                </Link>
                <Link
                  to="/subscriptions"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Planes
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}