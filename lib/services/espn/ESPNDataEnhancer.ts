import { ESPNService } from './ESPNService';
import { Player } from '@/lib/types/dfs';
import { SentimentAnalyzer } from '@/lib/utils/sentiment';

export class ESPNDataEnhancer {
  private espnService: ESPNService;
  private sentimentAnalyzer: SentimentAnalyzer;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: any, timestamp: number }>;

  constructor() {
    this.espnService = new ESPNService();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.cache = new Map();
  }

  async enhancePlayerData(players: Player[]): Promise<Player[]> {
    try {
      const [espnPlayers, espnTeams] = await Promise.all([
        this.getCachedData('players', () => this.espnService.getPlayers()),
        this.getCachedData('teams', () => this.espnService.getTeams())
      ]);
      
      return await Promise.all(players.map(async player => {
        const espnPlayer = this.findMatchingPlayer(player, espnPlayers);
        if (!espnPlayer) return player;

        // Get player news and analyze sentiment
        const news = await this.getCachedData(
          `news_${espnPlayer.id}`,
          () => this.espnService.getNews(espnPlayer.id)
        );

        const sentiment = news.length > 0 ? 
          this.sentimentAnalyzer.analyzeMultiple(news.map(n => n.text)) :
          null;

        return {
          ...player,
          status: espnPlayer.status || player.status,
          actualPoints: espnPlayer.actualPoints || player.actualPoints,
          projectedPoints: player.projectedPoints || espnPlayer.projectedPoints,
          socialMetrics: sentiment ? {
            sentiment: sentiment.score,
            beatWriterSentiment: sentiment.confidence,
            trendingScore: news.length > 5 ? 0.8 : news.length / 10,
            insights: this.generateInsights(news, sentiment)
          } : undefined
        };
      }));
    } catch (error) {
      console.error('Failed to enhance player data:', error);
      return players;
    }
  }

  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  private findMatchingPlayer(player: Player, espnPlayers: Player[]): Player | undefined {
    return espnPlayers.find(ep => 
      this.normalizePlayerName(ep.name) === this.normalizePlayerName(player.name) &&
      ep.position === player.position
    );
  }

  private normalizePlayerName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/jr$/, '')
      .replace(/sr$/, '')
      .replace(/iii$/, '')
      .trim();
  }

  private generateInsights(news: any[], sentiment: any): string[] {
    const insights: string[] = [];

    if (news.length > 0) {
      insights.push(`${news.length} recent news items`);
    }

    if (sentiment.score > 0.5) {
      insights.push('Strong positive sentiment in recent news');
    } else if (sentiment.score < -0.5) {
      insights.push('Concerning negative sentiment in recent news');
    }

    if (news.length > 5) {
      insights.push('High news volume - trending player');
    }

    return insights;
  }
}