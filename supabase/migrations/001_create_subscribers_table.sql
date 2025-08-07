-- Crear tabla subscribers según especificaciones del usuario

create table public.subscribers (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  email text not null,
  stripe_customer_id text null,
  subscribed boolean not null default false,
  subscription_tier text null,
  subscription_end timestamp with time zone null,
  updated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint subscribers_pkey primary key (id),
  constraint subscribers_email_key unique (email),
  constraint subscribers_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Crear trigger para actualizar updated_at automáticamente
create trigger update_subscribers_updated_at BEFORE
update on subscribers for EACH row
execute FUNCTION update_updated_at_column ();

-- Comentarios para documentación
comment on table public.subscribers is 'Tabla que almacena información de suscriptores del sistema';
comment on column public.subscribers.user_id is 'Referencia al usuario autenticado (puede ser null para suscriptores sin cuenta)';
comment on column public.subscribers.email is 'Email del suscriptor (único)';
comment on column public.subscribers.stripe_customer_id is 'ID del cliente en Stripe';
comment on column public.subscribers.subscribed is 'Estado de suscripción activa';
comment on column public.subscribers.subscription_tier is 'Tipo de plan (basic, standard, premium)';
comment on column public.subscribers.subscription_end is 'Fecha de expiración de la suscripción';

-- Habilitar RLS (Row Level Security)
alter table public.subscribers enable row level security;

-- Política para que los usuarios solo puedan ver su propia suscripción
create policy "Users can view own subscription"
  on public.subscribers for select
  using (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar su propia suscripción
create policy "Users can insert own subscription"
  on public.subscribers for insert
  with check (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propia suscripción
create policy "Users can update own subscription"
  on public.subscribers for update
  using (auth.uid() = user_id);

-- Política para administradores (si existe una tabla de roles)
-- create policy "Admins can manage all subscriptions"
--   on public.subscribers for all
--   using (auth.jwt() ->> 'role' = 'admin');
