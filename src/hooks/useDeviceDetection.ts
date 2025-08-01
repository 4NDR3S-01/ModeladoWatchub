import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceInfo {
  name: string;
  type: 'Móvil' | 'Tablet' | 'Computadora' | 'TV' | 'Desconocido';
  browser: string;
  os: string;
  lastActive: string;
  isCurrent: boolean;
  sessionId: string;
}

export const useDeviceDetection = () => {
  const { user } = useAuth();
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);

  const detectDeviceType = (): 'Móvil' | 'Tablet' | 'Computadora' | 'TV' | 'Desconocido' => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // TV devices
    if (userAgent.includes('smart-tv') || userAgent.includes('smarttv') || 
        userAgent.includes('roku') || userAgent.includes('appletv')) {
      return 'TV';
    }
    
    // Mobile devices
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      if (/ipad|tablet/i.test(userAgent) || 
          (userAgent.includes('android') && !userAgent.includes('mobile'))) {
        return 'Tablet';
      }
      return 'Móvil';
    }
    
    // Desktop/Laptop
    if (/windows|mac|linux/i.test(userAgent)) {
      return 'Computadora';
    }
    
    return 'Desconocido';
  };

  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    } else if (userAgent.includes('Opera')) {
      return 'Opera';
    }
    
    return 'Navegador desconocido';
  };

  const detectOS = (): string => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) {
      return 'Windows';
    } else if (userAgent.includes('Mac')) {
      return 'macOS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    } else if (userAgent.includes('Android')) {
      return 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS';
    }
    
    return 'Sistema desconocido';
  };

  const generateDeviceName = (type: string, os: string, browser: string): string => {
    const deviceNames = {
      'Móvil': {
        'iOS': 'iPhone',
        'Android': 'Android Phone'
      },
      'Tablet': {
        'iOS': 'iPad',
        'Android': 'Android Tablet'
      },
      'Computadora': {
        'Windows': 'PC Windows',
        'macOS': 'Mac',
        'Linux': 'Linux PC'
      }
    };

    const baseName = deviceNames[type]?.[os] || `${type} ${os}`;
    return `${baseName} (${browser})`;
  };

  const generateSessionId = (): string => {
    // Generar un ID único para la sesión actual
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getLocationFromTimezone = (): string => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const locationMap: { [key: string]: string } = {
        'America/Mexico_City': 'Ciudad de México, México',
        'America/New_York': 'Nueva York, EE.UU.',
        'America/Los_Angeles': 'Los Ángeles, EE.UU.',
        'Europe/Madrid': 'Madrid, España',
        'Europe/London': 'Londres, Reino Unido',
        'America/Buenos_Aires': 'Buenos Aires, Argentina',
        'America/Bogota': 'Bogotá, Colombia',
        'America/Lima': 'Lima, Perú',
        'Europe/Paris': 'París, Francia',
        'Europe/Berlin': 'Berlín, Alemania',
        'Asia/Tokyo': 'Tokio, Japón',
        'America/Sao_Paulo': 'São Paulo, Brasil'
      };

      return locationMap[timezone] || timezone.replace(/_/g, ' ').replace('/', ', ');
    } catch {
      return 'Ubicación desconocida';
    }
  };

  useEffect(() => {
    if (!user) return;

    const deviceType = detectDeviceType();
    const browser = detectBrowser();
    const os = detectOS();
    const deviceName = generateDeviceName(deviceType, os, browser);
    const sessionId = generateSessionId();
    const location = getLocationFromTimezone();

    const current: DeviceInfo = {
      name: deviceName,
      type: deviceType,
      browser,
      os,
      lastActive: 'Activo ahora',
      isCurrent: true,
      sessionId
    };

    setCurrentDevice(current);

    // Simular dispositivos conectados previamente (en una implementación real, 
    // estos vendrían de una base de datos)
    const mockDevices: DeviceInfo[] = [
      current,
      {
        name: 'iPhone 14 Pro (Safari)',
        type: 'Móvil',
        browser: 'Safari',
        os: 'iOS',
        lastActive: 'Hace 2 horas',
        isCurrent: false,
        sessionId: 'session_prev_1'
      },
      {
        name: 'Samsung Smart TV',
        type: 'TV',
        browser: 'TV Browser',
        os: 'Tizen',
        lastActive: 'Hace 1 día',
        isCurrent: false,
        sessionId: 'session_prev_2'
      },
      {
        name: 'iPad Air (Safari)',
        type: 'Tablet',
        browser: 'Safari',
        os: 'iOS',
        lastActive: 'Hace 3 días',
        isCurrent: false,
        sessionId: 'session_prev_3'
      }
    ];

    // Filtrar dispositivos duplicados basados en características similares
    const uniqueDevices = mockDevices.filter((device, index, arr) => {
      if (device.isCurrent) return true;
      return !arr.some((other, otherIndex) => 
        otherIndex < index && 
        other.name === device.name && 
        other.type === device.type
      );
    });

    setConnectedDevices(uniqueDevices);

    // Guardar información del dispositivo actual en localStorage para persistencia
    localStorage.setItem('currentDeviceInfo', JSON.stringify({
      ...current,
      location,
      loginTime: new Date().toISOString()
    }));

  }, [user]);

  const disconnectDevice = (sessionId: string) => {
    if (sessionId === currentDevice?.sessionId) {
      // No permitir desconectar el dispositivo actual
      return false;
    }

    setConnectedDevices(prev => 
      prev.filter(device => device.sessionId !== sessionId)
    );
    return true;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Móvil':
        return 'smartphone';
      case 'Tablet':
        return 'tablet';
      case 'Computadora':
        return 'monitor';
      case 'TV':
        return 'tv';
      default:
        return 'device';
    }
  };

  return {
    currentDevice,
    connectedDevices,
    disconnectDevice,
    getDeviceIcon,
    refreshDevices: () => {
      // Lógica para refrescar la lista de dispositivos desde el servidor
      console.log('Refreshing devices...');
    }
  };
};
