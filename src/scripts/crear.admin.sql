-- Script para hacer a un usuario administrador
-- Reemplaza 'tu-email@ejemplo.com' con tu email real

-- Buscar el usuario y obtener su ID
WITH user_data AS (
  SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com'
)
-- Insertar o actualizar el rol en la tabla user_roles
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  user_data.id,
  'admin'::public.user_role,
  user_data.id  -- Se asigna a sí mismo
FROM user_data
ON CONFLICT (user_id, role) 
DO UPDATE SET 
  assigned_at = now(),
  assigned_by = EXCLUDED.assigned_by;

-- Verificar los cambios
SELECT 
    u.id,
    u.email,
    ur.role,
    ur.assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'tu-email@ejemplo.com';
