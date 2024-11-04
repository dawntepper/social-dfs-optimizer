import { db } from '@/lib/db';
import { api_requests } from '@/lib/db/schema';

interface APIUsageStats {
  openai: { count: number; cost: number; limit: number };
  weather: { count: number; cost: number; limit: number };
  vegas: { count: number; cost: number; limit: number };
}

export class APITracker {
  private static instance: APITracker;
  private dailyLimits = {
    openai: 100,
    weather: 1000,
    vegas: 500
  };

  private constructor() {}

  static getInstance(): APITracker {
    if (!APITracker.instance) {
      APITracker.instance = new APITracker();
    }
    return APITracker.instance;
  }

  async trackRequest(
    apiName: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    cost: number = 0
  ): Promise<void> {
    try {
      await db.insert(api_requests).values({
        api_name: apiName,
        endpoint,
        status_code: statusCode,
        response_time: responseTime,
        cost,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking API request:', error);
    }
  }

  async getCurrentUsage(): Promise<APIUsageStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await db.select()
        .from(api_requests)
        .where(sql`created_at >= ${today.toISOString()}`);

      const usage = {
        openai: { count: 0, cost: 0, limit: this.dailyLimits.openai },
        weather: { count: 0, cost: 0, limit: this.dailyLimits.weather },
        vegas: { count: 0, cost: 0, limit: this.dailyLimits.vegas }
      };

      if (data) {
        data.forEach(request => {
          if (usage[request.api_name]) {
            usage[request.api_name].count++;
            usage[request.api_name].cost += Number(request.cost) || 0;
          }
        });
      }

      return usage;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return {
        openai: { count: 0, cost: 0, limit: this.dailyLimits.openai },
        weather: { count: 0, cost: 0, limit: this.dailyLimits.weather },
        vegas: { count: 0, cost: 0, limit: this.dailyLimits.vegas }
      };
    }
  }

  async getUsageStats(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await db.select()
        .from('daily_api_usage')
        .where(sql`date >= ${startDate.toISOString()}`);

      if (!data) {
        return [];
      }

      return data.map(row => ({
        date: row.date,
        openai: row.request_count.openai || 0,
        weather: row.request_count.weather || 0,
        vegas: row.request_count.vegas || 0
      }));
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return [];
    }
  }

  async cleanOldData(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await db.delete(api_requests)
        .where(sql`created_at < ${cutoffDate.toISOString()}`);
    } catch (error) {
      console.error('Error cleaning old data:', error);
    }
  }
}