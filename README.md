# 🎬 WatchHub Streaming

Plataforma de streaming de video simulada, desarrollada como parte de un proyecto académico. Incluye funcionalidades esenciales como catálogo de películas/series, reproducción de video, perfiles de usuario y sistema de suscripciones.

## 🚀 Tecnologías Utilizadas

- **Frontend:** React.js + TypeScript
- **Estilos:** Tailwind CSS
- **Empaquetado:** Vite
- **Reproductor de video:** Video.js + HLS.js (pendiente de integración)
- **Backend sugerido (no incluido en este repo):** Node.js, Django o .NET Core
- **Base de datos sugerida:** PostgreSQL + Redis (para caché)
- **CDN:** Simulación con almacenamiento local

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/usuario/watchhub-streaming.git
cd watchhub-streaming

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev


📁 Estructura del Proyecto

├── public/               # Archivos públicos
├── src/
│   ├── App.tsx           # Componente principal
│   ├── index.css         # Estilos base
│   ├── main.tsx          # Punto de entrada
│   └── components/       # Componentes reutilizables (pendiente)
├── package.json
├── tailwind.config.ts
└── README.md
