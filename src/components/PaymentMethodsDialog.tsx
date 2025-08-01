import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { CreditCard, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentMethodsDialog({ open, onOpenChange }: PaymentMethodsDialogProps) {
  const { paymentMethods, loading, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validar número de tarjeta (simplified)
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      errors.cardNumber = 'Número de tarjeta inválido';
    }

    // Validar mes de expiración
    const month = parseInt(formData.expiryMonth);
    if (!month || month < 1 || month > 12) {
      errors.expiryMonth = 'Mes inválido';
    }

    // Validar año de expiración
    const year = parseInt(formData.expiryYear);
    const currentYear = new Date().getFullYear();
    if (!year || year < currentYear || year > currentYear + 10) {
      errors.expiryYear = 'Año inválido';
    }

    // Validar CVC
    if (!formData.cvc || formData.cvc.length < 3 || formData.cvc.length > 4) {
      errors.cvc = 'CVC inválido';
    }

    // Validar nombre del titular
    if (!formData.cardholderName.trim()) {
      errors.cardholderName = 'Nombre del titular requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateForm()) return;

    const success = await addPaymentMethod({
      cardNumber: formData.cardNumber,
      expiryMonth: parseInt(formData.expiryMonth),
      expiryYear: parseInt(formData.expiryYear),
      cvc: formData.cvc,
      cardholderName: formData.cardholderName,
      isDefault: formData.isDefault
    });

    if (success) {
      setShowAddForm(false);
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        cardholderName: '',
        isDefault: false
      });
      setFormErrors({});
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    const success = await removePaymentMethod(cardId);
    if (success && paymentMethods.length === 1) {
      // Si era la última tarjeta, cerrar el diálogo
      onOpenChange(false);
    }
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const getCardIcon = (brand: string) => {
    const brandClass = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600'
    }[brand] || 'text-gray-600';

    return <CreditCard className={`w-6 h-6 ${brandClass}`} />;
  };

  const getBrandDisplayName = (brand: string): string => {
    return {
      visa: 'Visa',
      mastercard: 'MasterCard',
      amex: 'American Express',
      discover: 'Discover'
    }[brand] || 'Tarjeta';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de pago
          </DialogTitle>
          <DialogDescription>
            Gestiona tus tarjetas de crédito y débito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de tarjetas existentes */}
          {paymentMethods.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Tarjetas guardadas</h4>
              {paymentMethods.map((card) => (
                <Card key={card.id} className={card.is_default ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCardIcon(card.card_brand)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getBrandDisplayName(card.card_brand)} •••• {card.card_last4}
                            </span>
                            {card.is_default && (
                              <Badge variant="default" className="text-xs">
                                Por defecto
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expira {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!card.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultPaymentMethod(card.id)}
                            disabled={loading}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Predeterminada
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCard(card.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Botón para agregar nueva tarjeta */}
          {!showAddForm && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar nueva tarjeta
            </Button>
          )}

          {/* Formulario para agregar tarjeta */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agregar nueva tarjeta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="card-number">Número de tarjeta</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      if (formatted.replace(/\s/g, '').length <= 19) {
                        setFormData({ ...formData, cardNumber: formatted });
                      }
                    }}
                    className={formErrors.cardNumber ? 'border-destructive' : ''}
                  />
                  {formErrors.cardNumber && (
                    <p className="text-sm text-destructive mt-1">{formErrors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="expiry-month">Mes</Label>
                    <Select value={formData.expiryMonth} onValueChange={(value) => setFormData({ ...formData, expiryMonth: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {month.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.expiryMonth && (
                      <p className="text-sm text-destructive mt-1">{formErrors.expiryMonth}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="expiry-year">Año</Label>
                    <Select value={formData.expiryYear} onValueChange={(value) => setFormData({ ...formData, expiryYear: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.expiryYear && (
                      <p className="text-sm text-destructive mt-1">{formErrors.expiryYear}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      maxLength={4}
                      value={formData.cvc}
                      onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, '') })}
                    />
                    {formErrors.cvc && (
                      <p className="text-sm text-destructive mt-1">{formErrors.cvc}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholder-name">Nombre del titular</Label>
                  <Input
                    id="cardholder-name"
                    placeholder="Juan Pérez"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  />
                  {formErrors.cardholderName && (
                    <p className="text-sm text-destructive mt-1">{formErrors.cardholderName}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                  />
                  <Label htmlFor="is-default">Establecer como método de pago predeterminado</Label>
                </div>

                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Esta es una demostración. En producción, nunca almacenarías información real de tarjetas de crédito en localStorage.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        cardNumber: '',
                        expiryMonth: '',
                        expiryYear: '',
                        cvc: '',
                        cardholderName: '',
                        isDefault: false
                      });
                      setFormErrors({});
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCard} disabled={loading}>
                    {loading ? 'Agregando...' : 'Agregar tarjeta'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
