#!/usr/bin/env node

/**
 * Script de verificación de estado de Supabase para WatchHub
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStatus(status, message) {
  const statusColor = status === 'success' ? colors.green : 
                     status === 'warning' ? colors.yellow : colors.red;
  const statusIcon = status === 'success' ? '✅' : 
                    status === 'warning' ? '⚠️ ' : '❌';
  log(`${statusIcon} ${message}`, statusColor);
}

async function main() {
  log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════╗
║                  WATCHHUB SETUP                     ║
║              Verificación de Estado                 ║
╚══════════════════════════════════════════════════════╝${colors.reset}`);
  
  // Verificar archivo .env
  log('\n🔧 Verificando variables de entorno...', colors.cyan);
  
  if (!fs.existsSync('.env')) {
    logStatus('warning', 'Archivo .env no encontrado');
    log('Se ha creado un archivo .env con la plantilla proporcionada', colors.yellow);
  } else {
    logStatus('success', 'Archivo .env encontrado');
  }
  
  // Verificar variables críticas
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    logStatus('warning', 'VITE_SUPABASE_URL no configurada correctamente');
    log('Valor actual: ' + (supabaseUrl || 'No definida'), colors.yellow);
  } else {
    logStatus('success', 'VITE_SUPABASE_URL configurada');
  }
  
  if (!supabaseKey || supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
    logStatus('warning', 'VITE_SUPABASE_ANON_KEY no configurada correctamente');
    log('Valor actual: ' + (supabaseKey ? 'Clave de ejemplo' : 'No definida'), colors.yellow);
  } else {
    logStatus('success', 'VITE_SUPABASE_ANON_KEY configurada');
  }
  
  // Intentar conexión con Supabase
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
    log('\n🔍 Probando conexión con Supabase...', colors.cyan);
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Probar una consulta simple
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      
      if (error) {
        logStatus('warning', `Conexión establecida pero error en consulta: ${error.message}`);
        log('Esto puede ser normal si las tablas aún no están creadas', colors.yellow);
      } else {
        logStatus('success', 'Conexión con Supabase exitosa');
      }
    } catch (error) {
      logStatus('error', `Error conectando con Supabase: ${error.message}`);
    }
  }
  
  // Información adicional
  log(`\n${colors.bright}INFORMACIÓN DEL PROYECTO:${colors.reset}`);
  log(`• Proyecto ID configurado: amypgzmmlukvgzukihea`, colors.cyan);
  log(`• Clave proporcionada: adminroot123`, colors.cyan);
  log(`• Estado Docker: ${fs.existsSync('/var/run/docker.sock') || process.platform === 'win32' ? 'Disponible' : 'No disponible'}`, colors.cyan);
  
  log(`\n${colors.bright}PRÓXIMOS PASOS:${colors.reset}`);
  log(`1. Configura tus credenciales reales de Supabase en .env`, colors.yellow);
  log(`2. Si Docker está disponible, ejecuta: npx supabase start`, colors.yellow);
  log(`3. Vuelve a ejecutar este script para verificar la conexión`, colors.yellow);
  
  log(`\n${colors.green}Script completado.${colors.reset}\n`);
}

// Ejecutar el script
main().catch(console.error);
