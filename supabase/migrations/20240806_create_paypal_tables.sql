-- Crear tabla para suscripciones de PayPal
CREATE TABLE IF NOT EXISTS paypal_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  next_billing_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla para pagos únicos de PayPal (opcional)
CREATE TABLE IF NOT EXISTS paypal_payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'COMPLETED',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_user_id ON paypal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_subscription_id ON paypal_subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_status ON paypal_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_user_id ON paypal_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_order_id ON paypal_payments(paypal_order_id);

-- Agregar columnas a la tabla profiles si no existen
DO $$
BEGIN
  -- Agregar subscription_provider si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_provider'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_provider VARCHAR(50) DEFAULT 'stripe';
  END IF;
  
  -- Agregar subscription_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_id VARCHAR(255);
  END IF;
END
$$;

-- Habilitar RLS (Row Level Security)
ALTER TABLE paypal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para paypal_subscriptions
CREATE POLICY "Users can view their own PayPal subscriptions" 
  ON paypal_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PayPal subscriptions" 
  ON paypal_subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PayPal subscriptions" 
  ON paypal_subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas de seguridad para paypal_payments
CREATE POLICY "Users can view their own PayPal payments" 
  ON paypal_payments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PayPal payments" 
  ON paypal_payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_paypal_subscriptions_updated_at 
  BEFORE UPDATE ON paypal_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paypal_payments_updated_at 
  BEFORE UPDATE ON paypal_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
