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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { use2FA } from '@/hooks/use2FA';
import { Shield, Copy, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TwoFactorDialog({ open, onOpenChange }: TwoFactorDialogProps) {
  const { twoFactor, loading, enable2FA, verify2FA, disable2FA, getBackupCodes } = use2FA();
  const { toast } = useToast();
  const [step, setStep] = useState<'main' | 'setup' | 'verify' | 'backup'>('main');
  const [verificationCode, setVerificationCode] = useState('');
  const [factorData, setFactorData] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable2FA = async () => {
    const result = await enable2FA();
    if (result) {
      setFactorData(result);
      setStep('setup');
    }
  };

  const handleVerify2FA = async () => {
    if (!factorData || !verificationCode) {
      toast({
        title: "Código requerido",
        description: "Por favor ingresa el código de verificación",
        variant: "destructive",
      });
      return;
    }

    const success = await verify2FA(factorData.factorId, verificationCode);
    if (success) {
      const codes = await getBackupCodes();
      setBackupCodes(codes);
      setStep('backup');
    }
  };

  const handleDisable2FA = async () => {
    const success = await disable2FA();
    if (success) {
      setStep('main');
      setVerificationCode('');
      setFactorData(null);
      setBackupCodes([]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const downloadBackupCodes = () => {
    const content = `Códigos de respaldo de WatchHub\nGenerados: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\n¡Guarda estos códigos en un lugar seguro!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watchhub-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Códigos descargados",
      description: "Los códigos de respaldo se han descargado exitosamente",
    });
  };

  const resetDialog = () => {
    setStep('main');
    setVerificationCode('');
    setFactorData(null);
    setBackupCodes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Estado Principal */}
        {step === 'main' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verificación en dos pasos
              </DialogTitle>
              <DialogDescription>
                Agrega una capa extra de seguridad a tu cuenta
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Autenticación TOTP</h4>
                      <p className="text-sm text-muted-foreground">
                        Usa una aplicación como Google Authenticator
                      </p>
                    </div>
                  </div>
                  <Badge variant={twoFactor.isEnabled ? "default" : "secondary"}>
                    {twoFactor.isEnabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              )}

              {twoFactor.isEnabled ? (
                <Alert>
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription>
                    La verificación en dos pasos está activa. Tu cuenta está protegida con autenticación adicional.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Tu cuenta no tiene verificación en dos pasos. Te recomendamos activarla para mayor seguridad.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>
                Cerrar
              </Button>
              {twoFactor.isEnabled ? (
                <Button 
                  variant="destructive" 
                  onClick={handleDisable2FA}
                  disabled={loading}
                >
                  {loading ? "Desactivando..." : "Desactivar 2FA"}
                </Button>
              ) : (
                <Button 
                  onClick={handleEnable2FA}
                  disabled={loading}
                >
                  {loading ? "Configurando..." : "Activar 2FA"}
                </Button>
              )}
            </DialogFooter>
          </>
        )}

        {/* Configuración del 2FA */}
        {step === 'setup' && factorData && (
          <>
            <DialogHeader>
              <DialogTitle>Configurar autenticación</DialogTitle>
              <DialogDescription>
                Escanea el código QR con tu aplicación de autenticación
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  <img 
                    src={factorData.qrCode} 
                    alt="Código QR para 2FA"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Clave secreta (configuración manual)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={factorData.secret} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(factorData.secret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Después de escanear el código, ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>
                Cancelar
              </Button>
              <Button onClick={() => setStep('verify')}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Verificación del código */}
        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Verificar código</DialogTitle>
              <DialogDescription>
                Ingresa el código de 6 dígitos de tu aplicación de autenticación
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de verificación</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('setup')}>
                Volver
              </Button>
              <Button 
                onClick={handleVerify2FA}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verificando..." : "Verificar"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Códigos de respaldo */}
        {step === 'backup' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                ¡2FA Activado!
              </DialogTitle>
              <DialogDescription>
                Guarda estos códigos de respaldo en un lugar seguro
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Estos códigos te permitirán acceder a tu cuenta si pierdes tu dispositivo de autenticación. 
                  Cada código solo se puede usar una vez.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {backupCodes.map((code, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-muted rounded text-center font-mono text-sm cursor-pointer hover:bg-muted/80"
                    onClick={() => copyToClipboard(code)}
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar todos
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={resetDialog} className="w-full">
                Finalizar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
