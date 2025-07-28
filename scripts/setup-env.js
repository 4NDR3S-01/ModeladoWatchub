#!/usr/bin/env node

/**
 * Script de configuración interactiva para WatchHub
 * Este script ayuda a configurar todas las variables de entorno necesarias
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log(colorize('\n🎬 CONFIGURACIÓN DE WATCHHUB 🎬\n', 'cyan'));
  console.log(colorize('Este script te ayudará a configurar todas las variables de entorno necesarias.\n', 'yellow'));

  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  // Verificar si .env ya existe
  if (fs.existsSync(envPath)) {
    const overwrite = await question(colorize('⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (y/N): ', 'yellow'));
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log(colorize('Configuración cancelada.', 'red'));
      rl.close();
      return;
    }
  }

  console.log(colorize('\n📋 CONFIGURACIÓN PASO A PASO\n', 'bright'));

  const config = {};

  // Configuración de Supabase
  console.log(colorize('🗄️  CONFIGURACIÓN DE SUPABASE', 'blue'));
  config.VITE_SUPABASE_URL = await question('URL de tu proyecto Supabase: ');
  config.VITE_SUPABASE_ANON_KEY = await question('Clave anónima de Supabase: ');
  config.SUPABASE_SERVICE_ROLE_KEY = await question('Clave de rol de servicio de Supabase: ');

  // Configuración de Stripe
  console.log(colorize('\n💳 CONFIGURACIÓN DE STRIPE', 'blue'));
  config.VITE_STRIPE_PUBLISHABLE_KEY = await question('Clave pública de Stripe: ');
  config.STRIPE_SECRET_KEY = await question('Clave secreta de Stripe: ');
  config.STRIPE_WEBHOOK_SECRET = await question('Secreto del webhook de Stripe (opcional): ') || '';

  // Configuración de PayPal
  console.log(colorize('\n🅿️  CONFIGURACIÓN DE PAYPAL (OPCIONAL)', 'blue'));
  const usePaypal = await question('¿Deseas configurar PayPal? (y/N): ');
  if (usePaypal.toLowerCase() === 'y' || usePaypal.toLowerCase() === 'yes') {
    config.VITE_PAYPAL_CLIENT_ID = await question('Client ID de PayPal: ');
    config.PAYPAL_CLIENT_SECRET = await question('Client Secret de PayPal: ');
  }

  // Configuración de la aplicación
  console.log(colorize('\n⚙️  CONFIGURACIÓN DE LA APLICACIÓN', 'blue'));
  config.VITE_APP_NAME = await question('Nombre de la aplicación (WatchHub): ') || 'WatchHub';
  config.VITE_APP_URL = await question('URL de la aplicación (http://localhost:5173): ') || 'http://localhost:5173';

  // Configuración de servicios externos
  console.log(colorize('\n🌐 SERVICIOS EXTERNOS (OPCIONAL)', 'blue'));
  const useExternalServices = await question('¿Deseas configurar servicios externos (TMDB, Analytics)? (y/N): ');
  if (useExternalServices.toLowerCase() === 'y' || useExternalServices.toLowerCase() === 'yes') {
    config.TMDB_API_KEY = await question('API Key de TMDB (opcional): ') || '';
    config.VITE_GOOGLE_ANALYTICS_ID = await question('Google Analytics ID (opcional): ') || '';
  }

  // Generar claves de seguridad
  console.log(colorize('\n🔐 GENERANDO CLAVES DE SEGURIDAD...', 'blue'));
  config.JWT_SECRET = generateRandomKey(64);
  config.ENCRYPTION_KEY = generateRandomKey(32);

  // Configuración de desarrollo
  config.NODE_ENV = 'development';
  config.VITE_DEBUG = 'true';
  config.VITE_LOG_LEVEL = 'debug';

  // Crear archivo .env
  const envContent = createEnvContent(config);
  fs.writeFileSync(envPath, envContent);

  console.log(colorize('\n✅ CONFIGURACIÓN COMPLETADA', 'green'));
  console.log(colorize(`📁 Archivo .env creado en: ${envPath}`, 'green'));
  console.log(colorize('\n📋 PRÓXIMOS PASOS:', 'yellow'));
  console.log(colorize('1. Verifica las variables en el archivo .env', 'white'));
  console.log(colorize('2. Ejecuta: npm run dev para iniciar el desarrollo', 'white'));
  console.log(colorize('3. Ejecuta: npm run deploy:functions para desplegar las funciones', 'white'));
  
  rl.close();
}

function generateRandomKey(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createEnvContent(config) {
  let content = `# ===========================================
# WATCHHUB - CONFIGURACIÓN DE ENTORNO
# Generado automáticamente el ${new Date().toLocaleString()}
# ===========================================

# ===========================================
# CONFIGURACIÓN DE SUPABASE
# ===========================================
VITE_SUPABASE_URL=${config.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${config.VITE_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}

# ===========================================
# CONFIGURACIÓN DE STRIPE
# ===========================================
VITE_STRIPE_PUBLISHABLE_KEY=${config.VITE_STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${config.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${config.STRIPE_WEBHOOK_SECRET}

`;

  if (config.VITE_PAYPAL_CLIENT_ID) {
    content += `# ===========================================
# CONFIGURACIÓN DE PAYPAL
# ===========================================
VITE_PAYPAL_CLIENT_ID=${config.VITE_PAYPAL_CLIENT_ID}
PAYPAL_CLIENT_SECRET=${config.PAYPAL_CLIENT_SECRET}

`;
  }

  content += `# ===========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ===========================================
VITE_APP_NAME=${config.VITE_APP_NAME}
VITE_APP_URL=${config.VITE_APP_URL}
VITE_API_URL=${config.VITE_APP_URL}/api

# ===========================================
# CONFIGURACIÓN DE CONTENIDO Y MEDIOS
# ===========================================
VITE_STORAGE_BUCKET_URL=${config.VITE_SUPABASE_URL}/storage/v1/object/public
VITE_CDN_URL=${config.VITE_SUPABASE_URL}

`;

  if (config.TMDB_API_KEY || config.VITE_GOOGLE_ANALYTICS_ID) {
    content += `# ===========================================
# CONFIGURACIÓN DE SERVICIOS EXTERNOS
# ===========================================
`;
    if (config.TMDB_API_KEY) content += `TMDB_API_KEY=${config.TMDB_API_KEY}\n`;
    if (config.VITE_GOOGLE_ANALYTICS_ID) content += `VITE_GOOGLE_ANALYTICS_ID=${config.VITE_GOOGLE_ANALYTICS_ID}\n`;
    content += '\n';
  }

  content += `# ===========================================
# CONFIGURACIÓN DE DESARROLLO
# ===========================================
NODE_ENV=${config.NODE_ENV}
VITE_DEBUG=${config.VITE_DEBUG}
VITE_LOG_LEVEL=${config.VITE_LOG_LEVEL}

# ===========================================
# CONFIGURACIÓN DE SEGURIDAD
# ===========================================
JWT_SECRET=${config.JWT_SECRET}
ENCRYPTION_KEY=${config.ENCRYPTION_KEY}

# ===========================================
# CONFIGURACIÓN DE CORREO ELECTRÓNICO
# ===========================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@watchhub.com
`;

  return content;
}

main().catch(console.error);
