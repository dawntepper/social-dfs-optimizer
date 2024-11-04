import { db } from '@/lib/db';
import { notificationSettings } from '@/lib/db/schema';

export class NotificationService {
  async getUserSettings(userId: string) {
    const settings = await db.select()
      .from(notificationSettings)
      .where(sql`user_id = ${userId}`)
      .first();

    return settings || this.getDefaultSettings();
  }

  private getDefaultSettings() {
    return {
      severityLevels: {
        CRITICAL: true,
        HIGH: true,
        MEDIUM: true,
        LOW: false
      },
      channels: {
        inApp: true,
        email: false,
        sms: false
      },
      thresholds: {
        projectionChange: 3, // Minimum % change to trigger alert
        ownershipChange: 5,  // Minimum ownership % change
        socialSentiment: 0.3 // Minimum sentiment change (-1 to 1)
      }
    };
  }

  async updateSettings(userId: string, settings: any) {
    await db.insert(notificationSettings)
      .values({
        userId,
        settings: JSON.stringify(settings)
      })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: { settings: JSON.stringify(settings) }
      });
  }
}