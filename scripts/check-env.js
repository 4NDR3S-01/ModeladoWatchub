#!/usr/bin/env node

/**
 * Script de verificación de configuración para WatchHub
 * Verifica que todas las variables de entorno estén configuradas correctamente
 */

import fs from 'fs';
import path from 'path';
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

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log(colorize('❌ Archivo .env no encontrado', 'red'));
    console.log(colorize('💡 Ejecuta: npm run setup:env para crear la configuración', 'yellow'));
    return false;
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

function validateConfiguration(envVars) {
  console.log(colorize('\n🔍 VERIFICANDO CONFIGURACIÓN DE WATCHHUB\n', 'cyan'));

  const checks = [
    {
      category: 'Supabase (Requerido)',
      color: 'blue',
      vars: [
        { key: 'VITE_SUPABASE_URL', required: true, description: 'URL del proyecto Supabase' },
        { key: 'VITE_SUPABASE_ANON_KEY', required: true, description: 'Clave anónima de Supabase' },
        { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Clave de rol de servicio' }
      ]
    },
    {
      category: 'Stripe (Requerido)',
      color: 'blue',
      vars: [
        { key: 'VITE_STRIPE_PUBLISHABLE_KEY', required: true, description: 'Clave pública de Stripe' },
        { key: 'STRIPE_SECRET_KEY', required: true, description: 'Clave secreta de Stripe' },
        { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Secreto del webhook de Stripe' }
      ]
    },
    {
      category: 'PayPal (Opcional)',
      color: 'magenta',
      vars: [
        { key: 'VITE_PAYPAL_CLIENT_ID', required: false, description: 'Client ID de PayPal' },
        { key: 'PAYPAL_CLIENT_SECRET', required: false, description: 'Client Secret de PayPal' }
      ]
    },
    {
      category: 'Aplicación',
      color: 'green',
      vars: [
        { key: 'VITE_APP_NAME', required: false, description: 'Nombre de la aplicación' },
        { key: 'VITE_APP_URL', required: false, description: 'URL de la aplicación' },
        { key: 'NODE_ENV', required: false, description: 'Entorno de ejecución' }
      ]
    },
    {
      category: 'Seguridad',
      color: 'red',
      vars: [
        { key: 'JWT_SECRET', required: true, description: 'Clave secreta para JWT' },
        { key: 'ENCRYPTION_KEY', required: true, description: 'Clave de encriptación' }
      ]
    }
  ];

  let allGood = true;
  let warnings = 0;

  checks.forEach(check => {
    console.log(colorize(`\n📁 ${check.category}`, check.color));
    console.log('─'.repeat(50));

    check.vars.forEach(varCheck => {
      const value = envVars[varCheck.key];
      const hasValue = value && value !== '';
      const isPlaceholder = value && (
        value.includes('your_') || 
        value.includes('YOUR_') || 
        value === 'development' ||
        value === 'true' ||
        value === 'debug'
      );

      if (varCheck.required && !hasValue) {
        console.log(colorize(`❌ ${varCheck.key}`, 'red'), `- ${varCheck.description}`);
        allGood = false;
      } else if (varCheck.required && isPlaceholder && !['NODE_ENV', 'VITE_DEBUG', 'VITE_LOG_LEVEL'].includes(varCheck.key)) {
        console.log(colorize(`⚠️  ${varCheck.key}`, 'yellow'), `- ${varCheck.description} (valor placeholder)`);
        warnings++;
      } else if (hasValue) {
        const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
        console.log(colorize(`✅ ${varCheck.key}`, 'green'), `- ${varCheck.description} (${displayValue})`);
      } else {
        console.log(colorize(`➖ ${varCheck.key}`, 'yellow'), `- ${varCheck.description} (opcional, no configurado)`);
      }
    });
  });

  return { allGood, warnings };
}

function showRecommendations(result) {
  console.log(colorize('\n📋 RESUMEN DE CONFIGURACIÓN\n', 'cyan'));

  if (result.allGood && result.warnings === 0) {
    console.log(colorize('🎉 ¡Configuración completa y lista!', 'green'));
    console.log(colorize('\n🚀 Comandos disponibles:', 'blue'));
    console.log(colorize('• npm run dev - Iniciar desarrollo', 'white'));
    console.log(colorize('• npm run build - Construir para producción', 'white'));
    console.log(colorize('• npm run deploy:functions - Desplegar Edge Functions', 'white'));
  } else if (!result.allGood) {
    console.log(colorize('❌ Configuración incompleta', 'red'));
    console.log(colorize('\n💡 Acciones recomendadas:', 'yellow'));
    console.log(colorize('• Ejecuta: npm run setup:env para configurar automáticamente', 'white'));
    console.log(colorize('• O edita manualmente el archivo .env', 'white'));
  } else if (result.warnings > 0) {
    console.log(colorize(`⚠️  Configuración básica completa con ${result.warnings} advertencias`, 'yellow'));
    console.log(colorize('\n💡 Recomendaciones:', 'yellow'));
    console.log(colorize('• Reemplaza los valores placeholder con configuraciones reales', 'white'));
    console.log(colorize('• Verifica que las claves de servicios externos sean válidas', 'white'));
  }

  console.log(colorize('\n📚 Recursos útiles:', 'blue'));
  console.log(colorize('• Supabase Dashboard: https://app.supabase.com', 'white'));
  console.log(colorize('• Stripe Dashboard: https://dashboard.stripe.com', 'white'));
  console.log(colorize('• PayPal Developer: https://developer.paypal.com', 'white'));
}

function main() {
  console.log(colorize('🔍 VERIFICADOR DE CONFIGURACIÓN WATCHHUB', 'cyan'));
  console.log(colorize('═'.repeat(50), 'cyan'));

  const envVars = checkEnvFile();
  if (!envVars) {
    process.exit(1);
  }

  const result = validateConfiguration(envVars);
  showRecommendations(result);

  if (!result.allGood) {
    process.exit(1);
  }
}

main();
