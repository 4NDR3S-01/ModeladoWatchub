-- Insertar datos de ejemplo en la tabla subscribers para pruebas

-- Primero, asegurarse de que la función update_updated_at_column() existe
-- Si no existe, crearla:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Insertar usuarios de ejemplo (estos IDs deben coincidir con usuarios reales de auth.users)
-- Nota: En producción, estos datos se crearían automáticamente cuando los usuarios se suscriban

-- Usuario con suscripción premium activa
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Reemplazar con ID real de usuario
  'usuario.premium@example.com',
  'cus_premium123456789',
  true,
  'premium',
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '15 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Usuario con suscripción estándar activa
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Reemplazar con ID real de usuario
  'usuario.standard@example.com',
  'cus_standard123456789',
  true,
  'standard',
  NOW() + INTERVAL '25 days',
  NOW() - INTERVAL '10 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Usuario con suscripción básica activa
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003', -- Reemplazar con ID real de usuario
  'usuario.basic@example.com',
  'cus_basic123456789',
  true,
  'basic',
  NOW() + INTERVAL '20 days',
  NOW() - INTERVAL '5 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Usuario con suscripción expirada
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000004', -- Reemplazar con ID real de usuario
  'usuario.expirado@example.com',
  'cus_expired123456789',
  false,
  'premium',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '35 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Usuario sin suscripción
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000005', -- Reemplazar con ID real de usuario
  'usuario.sin.suscripcion@example.com',
  NULL,
  false,
  NULL,
  NULL,
  NOW() - INTERVAL '2 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Suscriptor sin cuenta de usuario (solo email)
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  NULL,
  'suscriptor.solo.email@example.com',
  'cus_emailonly123456789',
  true,
  'standard',
  NOW() + INTERVAL '15 days',
  NOW() - INTERVAL '7 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Usuario con suscripción próxima a expirar (3 días)
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000006', -- Reemplazar con ID real de usuario
  'usuario.proximo.vencimiento@example.com',
  'cus_expiring123456789',
  true,
  'premium',
  NOW() + INTERVAL '3 days',
  NOW() - INTERVAL '27 days',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Comentarios para explicar los diferentes estados
COMMENT ON TABLE public.subscribers IS 'Datos de ejemplo para pruebas:
- Usuario premium activo (30 días restantes)
- Usuario estándar activo (25 días restantes)  
- Usuario básico activo (20 días restantes)
- Usuario con suscripción expirada (hace 5 días)
- Usuario sin suscripción
- Suscriptor solo con email (sin cuenta de usuario)
- Usuario con suscripción próxima a expirar (3 días)';

-- Verificar que los datos se insertaron correctamente
SELECT 
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  CASE 
    WHEN subscription_end IS NULL THEN 'Sin fecha de expiración'
    WHEN subscription_end < NOW() THEN 'Expirado'
    WHEN subscription_end < NOW() + INTERVAL '7 days' THEN 'Próximo a expirar'
    ELSE 'Activo'
  END as status,
  CASE 
    WHEN subscription_end IS NULL THEN NULL
    ELSE EXTRACT(days FROM subscription_end - NOW())::integer
  END as dias_restantes
FROM public.subscribers
ORDER BY created_at DESC;
