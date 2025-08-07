-- Crear tabla para suscripciones de PayPal
CREATE TABLE IF NOT EXISTS paypal_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    paypal_subscription_id TEXT NOT NULL UNIQUE,
    plan_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para pagos únicos de PayPal
CREATE TABLE IF NOT EXISTS paypal_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    paypal_order_id TEXT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_user_id ON paypal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_status ON paypal_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_user_id ON paypal_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_payments_status ON paypal_payments(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE paypal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para paypal_subscriptions
CREATE POLICY "Users can view their own PayPal subscriptions" ON paypal_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PayPal subscriptions" ON paypal_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PayPal subscriptions" ON paypal_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de seguridad para paypal_payments
CREATE POLICY "Users can view their own PayPal payments" ON paypal_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PayPal payments" ON paypal_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PayPal payments" ON paypal_payments
    FOR UPDATE USING (auth.uid() = user_id);
