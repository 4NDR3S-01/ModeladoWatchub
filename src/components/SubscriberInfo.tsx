import React from 'react';
import { useSubscribers } from '@/hooks/useSubscribers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, Mail, User } from 'lucide-react';

export function SubscriberInfo() {
  const { 
    subscriber, 
    loading, 
    error, 
    getSubscriptionStatus, 
    getDaysRemaining, 
    isActive,
    fetchSubscriber 
  } = useSubscribers();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive text-center">
            <p>Error al cargar información de suscripción</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button 
              onClick={fetchSubscriber}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriber) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Sin suscripción
          </CardTitle>
          <CardDescription>
            No se encontró información de suscripción para este usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={fetchSubscriber}
            className="text-sm text-primary underline hover:no-underline"
          >
            Actualizar información
          </button>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = getDaysRemaining();
  const status = getSubscriptionStatus();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-premium-gold" />
          Información de Suscripción
        </CardTitle>
        <CardDescription>
          Detalles de la tabla subscribers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{subscriber.email}</span>
        </div>

        {/* Estado de suscripción */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={isActive() ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>

        {/* Tipo de plan */}
        {subscriber.subscription_tier && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan:</span>
            <Badge variant="outline">
              {subscriber.subscription_tier}
            </Badge>
          </div>
        )}

        {/* Fecha de expiración */}
        {subscriber.subscription_end && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Expira:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(subscriber.subscription_end).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {daysRemaining !== null && (
              <div className="text-sm">
                {daysRemaining > 0 ? (
                  <span className="text-green-600">
                    {daysRemaining} días restantes
                  </span>
                ) : (
                  <span className="text-red-600">
                    Expirado hace {Math.abs(daysRemaining)} días
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Estado de suscripción boolean */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Suscrito:</span>
          <Badge variant={subscriber.subscribed ? "default" : "destructive"}>
            {subscriber.subscribed ? "Sí" : "No"}
          </Badge>
        </div>

        {/* Stripe Customer ID */}
        {subscriber.stripe_customer_id && (
          <div className="text-xs text-muted-foreground">
            Stripe ID: {subscriber.stripe_customer_id}
          </div>
        )}

        {/* Fechas de creación y actualización */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            Creado: {new Date(subscriber.created_at).toLocaleDateString('es-ES')}
          </div>
          <div>
            Actualizado: {new Date(subscriber.updated_at).toLocaleDateString('es-ES')}
          </div>
        </div>

        {/* Botón para refrescar */}
        <button 
          onClick={fetchSubscriber}
          className="w-full text-sm text-primary underline hover:no-underline mt-4"
        >
          Actualizar información
        </button>
      </CardContent>
    </Card>
  );
}
