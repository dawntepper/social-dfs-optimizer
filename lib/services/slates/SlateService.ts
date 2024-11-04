import { Player } from '@/lib/types/dfs';

export class SlateService {
  private readonly DK_CONTESTS_URL = 'https://api.draftkings.com/contests/v1/contests';
  private readonly FD_CONTESTS_URL = 'https://api.fanduel.com/contests';
  
  // Cache slate data for 5 minutes
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  // Default NFL main slate data with comprehensive player list
  private readonly DEFAULT_SLATE = `Name,Position,Salary,TeamAbbrev,Opponent,FPPG,Status,GameInfo,AvgPointsPerGame
Patrick Mahomes,QB,8200,KC,@LV,24.5,,KC@LV 4:25PM ET,24.5
Josh Allen,QB,8000,BUF,@MIA,26.2,,BUF@MIA 1:00PM ET,26.2
Tua Tagovailoa,QB,7600,MIA,BUF,22.8,,BUF@MIA 1:00PM ET,22.8
Justin Herbert,QB,7400,LAC,@DEN,21.5,,LAC@DEN 4:25PM ET,21.5
Brock Purdy,QB,6800,SF,@ARI,19.8,,SF@ARI 4:25PM ET,19.8
Christian McCaffrey,RB,9200,SF,@ARI,25.4,,SF@ARI 4:25PM ET,25.4
Austin Ekeler,RB,7800,LAC,@DEN,20.2,,LAC@DEN 4:25PM ET,20.2
Raheem Mostert,RB,7200,MIA,BUF,18.5,,BUF@MIA 1:00PM ET,18.5
James Cook,RB,6900,BUF,@MIA,16.8,,BUF@MIA 1:00PM ET,16.8
Isiah Pacheco,RB,5800,KC,@LV,12.8,,KC@LV 4:25PM ET,12.8
Tyreek Hill,WR,9100,MIA,BUF,24.8,,BUF@MIA 1:00PM ET,24.8
Stefon Diggs,WR,8300,BUF,@MIA,21.5,,BUF@MIA 1:00PM ET,21.5
Keenan Allen,WR,8100,LAC,@DEN,20.8,,LAC@DEN 4:25PM ET,20.8
Brandon Aiyuk,WR,7600,SF,@ARI,17.5,,SF@ARI 4:25PM ET,17.5
Davante Adams,WR,7400,LV,KC,19.8,Q,KC@LV 4:25PM ET,19.8
Deebo Samuel,WR,7200,SF,@ARI,16.4,,SF@ARI 4:25PM ET,16.4
Jaylen Waddle,WR,6800,MIA,BUF,15.8,,BUF@MIA 1:00PM ET,15.8
Rashee Rice,WR,5900,KC,@LV,14.2,,KC@LV 4:25PM ET,14.2
Travis Kelce,TE,7800,KC,@LV,18.2,,KC@LV 4:25PM ET,18.2
George Kittle,TE,6400,SF,@ARI,14.5,,SF@ARI 4:25PM ET,14.5
Dalton Kincaid,TE,5200,BUF,@MIA,11.2,,BUF@MIA 1:00PM ET,11.2
Gerald Everett,TE,4800,LAC,@DEN,9.8,,LAC@DEN 4:25PM ET,9.8
49ers D/ST,DST,4200,SF,@ARI,9.8,,SF@ARI 4:25PM ET,9.8
Bills D/ST,DST,3900,BUF,@MIA,8.8,,BUF@MIA 1:00PM ET,8.8
Chiefs D/ST,DST,3800,KC,@LV,8.5,,KC@LV 4:25PM ET,8.5
Dolphins D/ST,DST,3600,MIA,BUF,7.8,,BUF@MIA 1:00PM ET,7.8`;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize default slate in localStorage if not present
      if (!localStorage.getItem('current_slate')) {
        localStorage.setItem('current_slate', this.DEFAULT_SLATE);
      }
    }
  }

  async getDefaultSlate(): Promise<string> {
    return this.DEFAULT_SLATE;
  }

  async downloadLatestSlate(site: 'draftkings' | 'fanduel'): Promise<string> {
    // For now, return the default slate
    // In production, this would fetch from the API
    return this.DEFAULT_SLATE;
  }

  generateSampleSlate(site: 'draftkings' | 'fanduel'): string {
    return this.DEFAULT_SLATE;
  }

  validateUploadedSlate(file: File, site: 'draftkings' | 'fanduel'): boolean {
    if (!file.name.endsWith('.csv')) {
      throw new Error('File must be a CSV');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size too large');
    }

    return true;
  }

  // Initialize slate data
  initializeSlate(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_slate', this.DEFAULT_SLATE);
    }
  }

  // Parse slate data into Player objects
  parseSlateData(csvData: string): Player[] {
    const rows = csvData.split('\n');
    const headers = rows[0].toLowerCase().split(',');
    
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const posIndex = headers.findIndex(h => h.includes('position'));
    const salaryIndex = headers.findIndex(h => h.includes('salary'));
    const teamIndex = headers.findIndex(h => h.includes('team'));
    const oppIndex = headers.findIndex(h => h.includes('opponent'));
    const projIndex = headers.findIndex(h => h.includes('fppg') || h.includes('avgpoints'));
    const statusIndex = headers.findIndex(h => h.includes('status') || h.includes('injury'));

    return rows.slice(1)
      .filter(row => row.trim())
      .map((row, index) => {
        const cols = row.split(',');
        const salary = parseInt(cols[salaryIndex].replace(/[^0-9]/g, ''));
        const projectedPoints = parseFloat(cols[projIndex]) || 0;

        return {
          id: `player-${index}`,
          name: cols[nameIndex],
          position: cols[posIndex],
          team: cols[teamIndex],
          opponent: cols[oppIndex],
          salary,
          projectedPoints,
          status: cols[statusIndex] || 'ACTIVE',
          value: projectedPoints / (salary / 1000),
          isLocked: false,
          isExcluded: false,
          socialMetrics: {
            sentiment: Math.random() * 2 - 1,
            beatWriterSentiment: Math.random() * 2 - 1,
            trendingScore: Math.random(),
            insights: [
              'Recent beat writer updates available',
              'High social media engagement'
            ]
          }
        };
      });
  }
}