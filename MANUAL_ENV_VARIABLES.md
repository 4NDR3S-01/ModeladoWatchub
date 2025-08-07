# Gestión de Secretos (Variables de Entorno) en ModeladoWatchub

## 1. Introducción
Las variables de entorno son valores configurables que se utilizan para almacenar información sensible como claves API, credenciales de bases de datos y configuraciones específicas del entorno. En este proyecto, se utilizan para gestionar secretos de forma segura.

## 2. Ubicación de las Variables de Entorno
En el entorno de desarrollo, las variables de entorno deben almacenarse en un archivo `.env` ubicado en la raíz del proyecto. Este archivo debe estar incluido en el archivo `.gitignore` para evitar que se suba al repositorio.

### Archivo `.gitignore`
Asegúrate de que el archivo `.env` esté ignorado:
```
# Ignorar archivos de configuración sensibles
.env
```

## 3. Formato del Archivo `.env`
El archivo `.env` debe seguir el siguiente formato:
```
# Supabase Configuration
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Other Configuration
VERCEL_ANALYTICS_ID=analytics-id
DATABASE_URL=postgres://user:password@localhost:5432/dbname
API_KEY=123456789abcdef
SECRET_KEY=supersecretkey
```

## 4. Cargar Variables de Entorno
En este proyecto, se utiliza la librería `dotenv` para cargar las variables de entorno en el código. Asegúrate de instalarla si aún no está incluida:

### Instalación
```bash
npm install dotenv
```

### Uso en el Código
```javascript
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log(`Conectando a la base de datos: ${databaseUrl}`);
```

## 5. Seguridad
- **No exponer secretos:** Nunca incluir secretos directamente en el código fuente.
- **Control de versiones:** Asegúrate de que el archivo `.env` esté en el archivo `.gitignore`.
- **Rotación de claves:** Cambiar las claves regularmente y revocar las que ya no se usen.

## 6. Configuración en Producción
En plataformas como Vercel y Supabase, las variables de entorno se configuran directamente en el panel de administración.

### Vercel
1. Accede al panel de administración de tu proyecto en Vercel.
2. Ve a la sección "Environment Variables".
3. Agrega las variables necesarias con sus valores correspondientes.

### Supabase
1. Accede al panel de administración de Supabase.
2. Ve a la sección "Settings" > "API".
3. Copia las claves necesarias y configúralas en tu entorno de producción.

## 7. Ejemplo Práctico
### Desarrollo
En el entorno local, crea un archivo `.env` con las siguientes variables:
```
# Supabase Configuration
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# Stripe Configuration (for credit card payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal Configuration (for PayPal payments)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Other Configuration
DATABASE_URL=postgres://user:password@localhost:5432/dbname
API_KEY=123456789abcdef
SECRET_KEY=supersecretkey
```

### Configuración de PayPal
Para configurar PayPal:
1. Crea una cuenta de desarrollador en https://developer.paypal.com/
2. Crea una aplicación en el panel de desarrollador
3. Copia el Client ID y Client Secret
4. Para pruebas, usa el modo "sandbox"
5. Para producción, cambia PAYPAL_MODE=live y usa las credenciales de producción

### Producción
Configura las mismas variables en el panel de administración de Vercel y Supabase.
En Supabase, ve a "Settings" > "Edge Functions" > "Environment Variables" para configurar las variables de PayPal.

---

Siguiendo estas prácticas, podrás gestionar secretos de forma segura y eficiente en el proyecto `ModeladoWatchub`. Si tienes dudas, consulta la documentación oficial de las herramientas utilizadas.
