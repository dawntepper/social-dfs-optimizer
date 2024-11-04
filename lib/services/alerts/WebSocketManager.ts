import { WebSocketService } from './WebSocketService';
import { NotificationService } from './NotificationService';
import { ProjectionAlertService } from './ProjectionAlertService';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wsService: WebSocketService;
  private notificationService: NotificationService;
  private alertService: ProjectionAlertService;

  private constructor() {
    this.wsService = new WebSocketService();
    this.notificationService = new NotificationService();
    this.alertService = new ProjectionAlertService();
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async handleProjectionUpdate(data: any) {
    const alert = await this.alertService.checkProjectionChange(
      data.player,
      data.oldProjection,
      data.newProjection,
      data.socialMetrics
    );

    if (alert) {
      // Broadcast to all connected clients
      this.wsService.broadcastAlert({
        type: 'PROJECTION_UPDATE',
        data: alert
      });

      // Send targeted notifications based on user preferences
      const users = await this.notificationService.getUsersToNotify(alert);
      for (const user of users) {
        this.wsService.sendUserAlert(user.id, {
          type: 'PROJECTION_ALERT',
          data: {
            ...alert,
            notification: {
              title: `${alert.playerName} Projection Update`,
              body: `Projection changed by ${(alert.percentageChange * 100).toFixed(1)}%`,
              severity: alert.severity
            }
          }
        });
      }
    }
  }

  async handleSocialUpdate(data: any) {
    // Similar to projection updates but for social metrics
    const alert = await this.alertService.checkSocialChange(data);
    if (alert) {
      this.wsService.broadcastAlert({
        type: 'SOCIAL_UPDATE',
        data: alert
      });
    }
  }

  async handleWeatherUpdate(data: any) {
    const alert = await this.alertService.checkWeatherChange(data);
    if (alert) {
      this.wsService.broadcastAlert({
        type: 'WEATHER_UPDATE',
        data: alert
      });
    }
  }
}