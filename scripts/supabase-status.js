#!/usr/bin/env node

/**
 * Script de configuración y verificación del estado de Supabase para WatchHub
 * Este script verifica la conexión a Supabase y configura las variables de entorno
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStatus(status, message) {
  const statusColor = status === 'success' ? colors.green : 
                     status === 'warning' ? colors.yellow : colors.red;
  const statusIcon = status === 'success' ? '✅' : 
                    status === 'warning' ? '⚠️ ' : '❌';
  log(`${statusIcon} ${message}`, statusColor);
}

async function checkSupabaseConnection() {
  log('\n🔍 Verificando conexión con Supabase...', colors.cyan);
  
  try {
    // Cargar variables de entorno
    config();
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logStatus('error', 'Variables de entorno de Supabase no configuradas');
      log('Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env', colors.yellow);
      return false;
    }
    
    if (supabaseUrl.includes('your-project') || supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
      logStatus('warning', 'Variables de entorno con valores de ejemplo');
      log('Por favor, reemplaza los valores de ejemplo con tus credenciales reales de Supabase', colors.yellow);
      return false;
    }
    
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar conexión haciendo una consulta simple
    const { data, error } = await supabase.from('_supabase_migrations').select('version').limit(1);
    
    if (error) {
      logStatus('error', `Error conectando con Supabase: ${error.message}`);
      return false;
    }
    
    logStatus('success', 'Conexión con Supabase establecida correctamente');
    return true;
    
  } catch (error) {
    logStatus('error', `Error verificando Supabase: ${error.message}`);
    return false;
  }
}

async function checkDatabaseTables() {
  log('\n📊 Verificando estructura de la base de datos...', colors.cyan);
  
  try {
    config();
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logStatus('warning', 'No se pueden verificar las tablas sin credenciales válidas');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Lista de tablas esperadas
    const expectedTables = [
      'profiles',
      'subscriptions', 
      'content',
      'reviews',
      'watchlist',
      'categories'
    ];
    
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          logStatus('warning', `Tabla '${table}' no encontrada o sin acceso`);
        } else {
          logStatus('success', `Tabla '${table}' verificada`);
        }
      } catch (err) {
        logStatus('warning', `Error verificando tabla '${table}': ${err.message}`);
      }
    }
    
    return true;
    
  } catch (error) {
    logStatus('error', `Error verificando estructura de BD: ${error.message}`);
    return false;
  }
}

async function generateEnvExample() {
  log('\n📋 Generando archivo .env.example...', colors.cyan);
  
  const envExample = `# ===========================================
# WATCHHUB - CONFIGURACIÓN DE ENTORNO
# ===========================================
# Copia este archivo como .env y configura tus valores reales

# ===========================================
# CONFIGURACIÓN DE SUPABASE (REQUERIDO)
# ===========================================
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio

# ===========================================
# CONFIGURACIÓN DE STRIPE (REQUERIDO)
# ===========================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ===========================================
VITE_APP_NAME=WatchHub
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api

# Configuración adicional...
NODE_ENV=development
VITE_DEBUG=true
`;

  fs.writeFileSync('.env.example', envExample);
  logStatus('success', 'Archivo .env.example generado');
}

async function checkEnvironmentVariables() {
  log('\n🔧 Verificando variables de entorno...', colors.cyan);
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    logStatus('warning', 'Archivo .env no encontrado');
    log('Creando archivo .env desde la plantilla...', colors.yellow);
    
    // Crear archivo .env básico
    const basicEnv = `# WatchHub Environment Variables
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_APP_NAME=WatchHub
NODE_ENV=development
`;
    fs.writeFileSync(envPath, basicEnv);
    logStatus('success', 'Archivo .env creado con configuración básica');
  } else {
    logStatus('success', 'Archivo .env encontrado');
  }
  
  // Verificar variables críticas
  config();
  
  const criticalVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  for (const varName of criticalVars) {
    if (process.env[varName]) {
      if (process.env[varName].includes('tu-proyecto') || process.env[varName].includes('tu_clave')) {
        logStatus('warning', `${varName} tiene valor de ejemplo`);
      } else {
        logStatus('success', `${varName} configurada`);
      }
    } else {
      logStatus('error', `${varName} no configurada`);
    }
  }
}

async function main() {
  log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════╗
║                  WATCHHUB SETUP                     ║
║              Verificación de Estado                 ║
╚══════════════════════════════════════════════════════╝${colors.reset}`);
  
  // Verificar variables de entorno
  await checkEnvironmentVariables();
  
  // Generar archivo de ejemplo
  await generateEnvExample();
  
  // Verificar conexión con Supabase
  const connectionOk = await checkSupabaseConnection();
  
  // Verificar estructura de base de datos
  if (connectionOk) {
    await checkDatabaseTables();
  }
  
  log(`\n${colors.bright}${colors.green}════════════════════════════════════════════════════════${colors.reset}`);
  log(`${colors.bright}RESUMEN:${colors.reset}`);
  log(`${colors.cyan}• Configuración: ${connectionOk ? 'Completada' : 'Pendiente'}${colors.reset}`);
  log(`${colors.cyan}• Estado de BD: ${connectionOk ? 'Conectada' : 'Desconectada'}${colors.reset}`);
  log(`${colors.yellow}• Clave proporcionada: adminroot123${colors.reset}`);
  
  if (!connectionOk) {
    log(`\n${colors.yellow}📝 PRÓXIMOS PASOS:${colors.reset}`);
    log(`1. Configura tus credenciales reales de Supabase en el archivo .env`);
    log(`2. Reemplaza 'tu-proyecto.supabase.co' con tu URL real`);
    log(`3. Vuelve a ejecutar este script para verificar la conexión`);
  }
  
  log(`${colors.bright}${colors.green}════════════════════════════════════════════════════════${colors.reset}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkSupabaseConnection, checkDatabaseTables, checkEnvironmentVariables };
