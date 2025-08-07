-- Insertar datos de ejemplo en la tabla subscribers
-- Estos datos son solo para pruebas y desarrollo

-- Función para crear la función update_updated_at_column si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Insertar algunos suscriptores de ejemplo
INSERT INTO public.subscribers (user_id, email, stripe_customer_id, subscribed, subscription_tier, subscription_end)
VALUES 
  -- Suscriptor con plan premium activo
  (null, 'premium_user@example.com', 'cus_premium123', true, 'premium', NOW() + INTERVAL '30 days'),
  
  -- Suscriptor con plan estándar activo
  (null, 'standard_user@example.com', 'cus_standard456', true, 'standard', NOW() + INTERVAL '25 days'),
  
  -- Suscriptor con plan básico activo
  (null, 'basic_user@example.com', 'cus_basic789', true, 'basic', NOW() + INTERVAL '15 days'),
  
  -- Suscriptor con suscripción expirada
  (null, 'expired_user@example.com', 'cus_expired101', false, 'premium', NOW() - INTERVAL '5 days'),
  
  -- Suscriptor sin suscripción activa
  (null, 'inactive_user@example.com', null, false, null, null)
ON CONFLICT (email) DO NOTHING;

-- Mostrar los datos insertados
SELECT 
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  CASE 
    WHEN subscription_end IS NULL THEN 'Sin fecha de expiración'
    WHEN subscription_end < NOW() THEN 'Expirado'
    ELSE CONCAT(EXTRACT(days FROM (subscription_end - NOW())), ' días restantes')
  END as status
FROM public.subscribers
ORDER BY created_at DESC;
