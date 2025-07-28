#!/usr/bin/env node

/**
 * Script para configurar secretos en Supabase Edge Functions
 * Configura automáticamente todas las variables de entorno necesarias
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log(colorize('❌ Archivo .env no encontrado', 'red'));
    console.log(colorize('💡 Ejecuta: npm run setup:env primero', 'yellow'));
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(colorize('❌ Supabase CLI no está instalado', 'red'));
    console.log(colorize('💡 Instala con: npm install -g supabase', 'yellow'));
    console.log(colorize('💡 O visita: https://supabase.com/docs/guides/cli', 'yellow'));
    return false;
  }
}

function setSupabaseSecrets(envVars) {
  console.log(colorize('\n🔐 CONFIGURANDO SECRETOS EN SUPABASE\n', 'cyan'));

  // Secretos necesarios para Edge Functions
  const secrets = {
    'SUPABASE_URL': envVars.VITE_SUPABASE_URL,
    'SUPABASE_ANON_KEY': envVars.VITE_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': envVars.SUPABASE_SERVICE_ROLE_KEY,
    'STRIPE_SECRET_KEY': envVars.STRIPE_SECRET_KEY,
    'STRIPE_WEBHOOK_SECRET': envVars.STRIPE_WEBHOOK_SECRET,
    'PAYPAL_CLIENT_ID': envVars.VITE_PAYPAL_CLIENT_ID,
    'PAYPAL_CLIENT_SECRET': envVars.PAYPAL_CLIENT_SECRET,
    'JWT_SECRET': envVars.JWT_SECRET,
    'ENCRYPTION_KEY': envVars.ENCRYPTION_KEY,
    'SMTP_HOST': envVars.SMTP_HOST,
    'SMTP_PORT': envVars.SMTP_PORT,
    'SMTP_USER': envVars.SMTP_USER,
    'SMTP_PASSWORD': envVars.SMTP_PASSWORD,
    'FROM_EMAIL': envVars.FROM_EMAIL
  };

  let setCount = 0;
  let errorCount = 0;

  Object.entries(secrets).forEach(([key, value]) => {
    if (value && value !== '' && !value.includes('your_')) {
      try {
        console.log(colorize(`Configurando ${key}...`, 'blue'));
        execSync(`supabase secrets set ${key}="${value}"`, { stdio: 'pipe' });
        console.log(colorize(`✅ ${key} configurado`, 'green'));
        setCount++;
      } catch (error) {
        console.log(colorize(`❌ Error configurando ${key}`, 'red'));
        errorCount++;
      }
    } else {
      console.log(colorize(`⏭️  Omitiendo ${key} (no configurado)`, 'yellow'));
    }
  });

  console.log(colorize(`\n📊 RESUMEN:`, 'cyan'));
  console.log(colorize(`✅ Secretos configurados: ${setCount}`, 'green'));
  console.log(colorize(`⏭️  Secretos omitidos: ${Object.keys(secrets).length - setCount - errorCount}`, 'yellow'));
  if (errorCount > 0) {
    console.log(colorize(`❌ Errores: ${errorCount}`, 'red'));
  }

  return { setCount, errorCount };
}

function createSupabaseEnv(envVars) {
  const supabaseEnvPath = path.join(__dirname, '..', 'supabase', '.env');
  
  const supabaseVars = {
    'SUPABASE_URL': envVars.VITE_SUPABASE_URL,
    'SUPABASE_ANON_KEY': envVars.VITE_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': envVars.SUPABASE_SERVICE_ROLE_KEY,
    'STRIPE_SECRET_KEY': envVars.STRIPE_SECRET_KEY,
    'STRIPE_WEBHOOK_SECRET': envVars.STRIPE_WEBHOOK_SECRET,
    'PAYPAL_CLIENT_ID': envVars.VITE_PAYPAL_CLIENT_ID,
    'PAYPAL_CLIENT_SECRET': envVars.PAYPAL_CLIENT_SECRET,
    'JWT_SECRET': envVars.JWT_SECRET,
    'ENCRYPTION_KEY': envVars.ENCRYPTION_KEY
  };

  let content = `# Configuración para Edge Functions de Supabase
# Generado automáticamente el ${new Date().toLocaleString()}

`;

  Object.entries(supabaseVars).forEach(([key, value]) => {
    if (value && value !== '' && !value.includes('your_')) {
      content += `${key}=${value}\n`;
    }
  });

  // Crear directorio supabase si no existe
  const supabaseDir = path.dirname(supabaseEnvPath);
  if (!fs.existsSync(supabaseDir)) {
    fs.mkdirSync(supabaseDir, { recursive: true });
  }

  fs.writeFileSync(supabaseEnvPath, content);
  console.log(colorize(`📁 Archivo supabase/.env creado`, 'green'));
}

function main() {
  console.log(colorize('🔐 CONFIGURADOR DE SECRETOS SUPABASE', 'cyan'));
  console.log(colorize('═'.repeat(50), 'cyan'));

  // Verificar CLI de Supabase
  if (!checkSupabaseCLI()) {
    process.exit(1);
  }

  // Cargar variables de entorno
  const envVars = loadEnvFile();

  // Verificar que tenemos las variables básicas
  if (!envVars.VITE_SUPABASE_URL || !envVars.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(colorize('❌ Configuración de Supabase incompleta', 'red'));
    console.log(colorize('💡 Ejecuta: npm run setup:env primero', 'yellow'));
    process.exit(1);
  }

  // Crear archivo .env para Supabase
  createSupabaseEnv(envVars);

  // Configurar secretos
  const result = setSupabaseSecrets(envVars);

  console.log(colorize('\n🎉 CONFIGURACIÓN COMPLETADA', 'green'));
  console.log(colorize('\n📋 PRÓXIMOS PASOS:', 'yellow'));
  console.log(colorize('1. Ejecuta: npm run deploy:functions', 'white'));
  console.log(colorize('2. Verifica las funciones en el dashboard de Supabase', 'white'));
  console.log(colorize('3. Configura los webhooks en Stripe/PayPal si es necesario', 'white'));

  if (result.errorCount > 0) {
    process.exit(1);
  }
}

main();
