import { Button } from "@/components/ui/button";
import { Play, Check, TrendingUp, Monitor, Smartphone, Tv } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

export default function Welcome() {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: Monitor,
      title: "Disfruta en tu TV",
      description: "Ve en smart TVs, PlayStation, Xbox, Chromecast, Apple TV, reproductores de Blu-ray y más."
    },
    {
      icon: Smartphone,
      title: "Ve en todos tus dispositivos",
      description: "Disfruta de tus películas favoritas en cualquier lugar y momento."
    },
    {
      icon: Tv,
      title: "Ve donde quieras",
      description: "Disfruta de películas ilimitadas en tu teléfono, tablet, laptop y TV."
    }
  ];

  const plans = [
    { name: "Básico", price: "$2", quality: "720p", devices: "1" },
    { name: "Estándar", price: "$5", quality: "1080p", devices: "2" },
    { name: "Premium", price: "$9", quality: "4K+HDR", devices: "4" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50 py-6">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Watch<span className="text-primary">Hub</span>
            </h1>
            <Link to="/login">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Películas
            <br />
            <span className="text-primary">ilimitadas</span> y mucho más
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Disfruta donde quieras. Cancela cuando quieras.
          </p>

          <p className="text-lg mb-6">
            ¿Quieres ver algo ya? Ingresa tu email para crear una cuenta o reiniciar tu membresía.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-md bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
            <Link to="/register">
              <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">
                <Play className="w-5 h-5 mr-2" />
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Cambia de plan o cancela cuando quieras
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-lg border-2 ${
                  index === 1 
                    ? 'border-primary bg-primary/5 transform scale-105' 
                    : 'border-border bg-background'
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-primary mb-6">{plan.price}</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Calidad {plan.quality}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">{plan.devices} dispositivos</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Cancela cuando quieras</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link to="/subscriptions">
            <Button size="lg" className="px-12">
              Ver todos los planes
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Películas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">190+</div>
              <div className="text-muted-foreground">Países</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100M+</div>
              <div className="text-muted-foreground">Usuarios</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Preguntas frecuentes
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "¿Qué es WatchHub?",
                answer: "WatchHub es un servicio de streaming que ofrece una amplia variedad de películas y documentales premiados en miles de dispositivos conectados a internet."
              },
              {
                question: "¿Cuánto cuesta WatchHub?",
                answer: "Disfruta WatchHub en tu smartphone, tablet, smart TV, laptop o dispositivo de streaming, todo por una tarifa plana mensual."
              },
              {
                question: "¿Dónde puedo ver?",
                answer: "Ve donde quieras, cuando quieras, en un número ilimitado de dispositivos. Inicia sesión en tu cuenta de WatchHub para ver contenido al instante."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Acerca de</a></li>
                <li><a href="#" className="hover:text-primary">Empleos</a></li>
                <li><a href="#" className="hover:text-primary">Prensa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-primary">Contacto</a></li>
                <li><a href="#" className="hover:text-primary">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary">Cookies</a></li>
                <li><a href="#" className="hover:text-primary">Avisos legales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Síguenos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Facebook</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">Instagram</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 WatchHub Streaming. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}