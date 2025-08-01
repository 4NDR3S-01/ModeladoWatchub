#!/usr/bin/env node

/**
 * Script de configuración automática para WatchHub
 * Configura las variables de entorno con valores reales de Supabase
 */

import fs from 'fs';
import { config } from 'dotenv';

// Cargar variables de entorno existentes
config();

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

function updateEnvFile() {
  log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════╗
║              CONFIGURACIÓN AUTOMÁTICA               ║
║                   WATCHHUB                          ║
╚══════════════════════════════════════════════════════╝${colors.reset}`);

  const projectId = 'amypgzmmlukvgzukihea';
  
  // Construir la URL de Supabase basada en el project_id del config.toml
  const supabaseUrl = `https://${projectId}.supabase.co`;
  
  // Para desarrollo local, puedes usar estas URLs también:
  const localUrls = {
    supabaseUrl: 'http://localhost:54321',
    storageUrl: 'http://localhost:54321/storage/v1/object/public'
  };

  log('\n📝 Actualizando archivo .env con configuración del proyecto...', colors.cyan);

  // Leer el archivo .env actual
  let envContent = '';
  if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
  }

  // Función para actualizar o agregar una variable
  function updateOrAddEnvVar(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(content)) {
      return content.replace(regex, newLine);
    } else {
      return content + `\n${newLine}`;
    }
  }

  // Actualizar variables de Supabase
  envContent = updateOrAddEnvVar(envContent, 'VITE_SUPABASE_URL', supabaseUrl);
  
  // Nota: En un entorno real, necesitarías obtener estas claves del dashboard de Supabase
  log(`\n${colors.yellow}📋 INFORMACIÓN IMPORTANTE:${colors.reset}`);
  log(`• URL del proyecto actualizada: ${supabaseUrl}`, colors.green);
  log(`• Project ID: ${projectId}`, colors.cyan);
  log(`• Clave proporcionada: adminroot123`, colors.cyan);
  
  log(`\n${colors.yellow}⚠️  CLAVES DE API REQUERIDAS:${colors.reset}`);
  log(`Para completar la configuración, necesitas obtener las siguientes claves del dashboard de Supabase:`, colors.yellow);
  log(`1. ANON KEY (clave pública)`, colors.white);
  log(`2. SERVICE ROLE KEY (clave privada)`, colors.white);
  
  log(`\n${colors.cyan}📍 Cómo obtener las claves:${colors.reset}`);
  log(`1. Ve a: ${supabaseUrl}/project/settings/api`, colors.white);
  log(`2. Copia la 'anon/public' key`, colors.white);
  log(`3. Copia la 'service_role' key`, colors.white);
  log(`4. Actualiza las variables en tu archivo .env`, colors.white);

  // Escribir el archivo .env actualizado
  fs.writeFileSync('.env', envContent);
  
  log(`\n✅ Archivo .env actualizado con la URL del proyecto`, colors.green);
  log(`\n${colors.bright}Para desarrollo local con Docker:${colors.reset}`);
  log(`• Ejecuta: npx supabase start`, colors.cyan);
  log(`• Esto iniciará Supabase localmente en: http://localhost:54321`, colors.cyan);
  
  return projectId;
}

async function main() {
  const projectId = updateEnvFile();
  
  log(`\n${colors.bright}RESUMEN DE CONFIGURACIÓN:${colors.reset}`);
  log(`• Proyecto: ${projectId}`, colors.green);
  log(`• URL: https://${projectId}.supabase.co`, colors.green);
  log(`• Configuración: Parcialmente completada`, colors.yellow);
  
  log(`\n${colors.yellow}PRÓXIMOS PASOS MANUALES:${colors.reset}`);
  log(`1. Obtén las claves API del dashboard de Supabase`, colors.white);
  log(`2. Actualiza VITE_SUPABASE_ANON_KEY en tu .env`, colors.white);
  log(`3. Actualiza SUPABASE_SERVICE_ROLE_KEY en tu .env`, colors.white);
  log(`4. Ejecuta: node scripts/check-status.js para verificar`, colors.white);
}

main().catch(console.error);
