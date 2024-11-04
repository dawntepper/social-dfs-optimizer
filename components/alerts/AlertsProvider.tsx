'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AlertsContextType {
  alerts: any[];
  settings: any;
  updateSettings: (settings: any) => void;
}

const AlertsContext = createContext<AlertsContextType>({
  alerts: [],
  settings: {},
  updateSettings: () => {}
});

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState([]);
  const [settings, setSettings] = useState({
    notifications: {
      projections: true,
      social: true,
      weather: true
    },
    thresholds: {
      projectionChange: 3,
      socialSentiment: 0.3,
      weatherSeverity: 'HIGH'
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'PROJECTION_ALERT' && settings.notifications.projections) {
        handleProjectionAlert(data.data);
      } else if (data.type === 'SOCIAL_UPDATE' && settings.notifications.social) {
        handleSocialUpdate(data.data);
      }
    };

    return () => {
      ws.close();
    };
  }, [settings]);

  const handleProjectionAlert = (alert: any) => {
    if (alert.percentageChange >= settings.thresholds.projectionChange / 100) {
      setAlerts(prev => [alert, ...prev]);
      
      toast({
        title: alert.notification.title,
        description: alert.notification.body,
        variant: alert.severity === 'CRITICAL' ? 'destructive' : 'default'
      });
    }
  };

  const handleSocialUpdate = (update: any) => {
    if (Math.abs(update.sentimentChange) >= settings.thresholds.socialSentiment) {
      setAlerts(prev => [update, ...prev]);
      
      toast({
        title: 'Social Sentiment Update',
        description: update.summary,
        variant: 'default'
      });
    }
  };

  const updateSettings = (newSettings: any) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <AlertsContext.Provider value={{ alerts, settings, updateSettings }}>
      {children}
    </AlertsContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertsContext);