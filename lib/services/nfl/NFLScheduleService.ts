'use client';

export class NFLScheduleService {
  // NFL Practice Report Schedule
  static readonly PRACTICE_REPORT_SCHEDULE = {
    WEDNESDAY: { time: '16:00', required: true },
    THURSDAY: { time: '16:00', required: true },
    FRIDAY: { time: '16:00', required: true },
    SATURDAY: { time: '16:00', required: false } // Only for teams playing Monday
  };

  // Game Day Report Deadlines
  static readonly GAME_DAY_DEADLINES = {
    SUNDAY_EARLY: '11:30', // For 1pm ET games
    SUNDAY_LATE: '14:30',  // For 4pm ET games
    SUNDAY_NIGHT: '19:00', // For SNF
    MONDAY_NIGHT: '19:00'  // For MNF
  };

  // Injury Report Designations
  static readonly INJURY_DESIGNATIONS = {
    OUT: 'Player will not play',
    DOUBTFUL: 'At least 75% chance player won't play',
    QUESTIONABLE: '50-50 chance of playing',
    ACTIVE: 'Player is active'
  };

  // Practice Participation Levels
  static readonly PRACTICE_LEVELS = {
    DNP: 'Did Not Participate',
    LIMITED: 'Limited Participation',
    FULL: 'Full Participation'
  };

  getNextUpdateTime(player: any): Date {
    const now = new Date();
    const gameTime = new Date(player.gameTime);
    const dayOfWeek = now.getDay();
    
    // If game day (usually Sunday)
    if (gameTime.getDate() === now.getDate()) {
      return new Date(`${gameTime.toDateString()} ${this.GAME_DAY_DEADLINES.SUNDAY_EARLY}`);
    }

    // Get next practice report time
    const reportTimes = {
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY'
    };

    const nextReportDay = reportTimes[dayOfWeek];
    if (nextReportDay) {
      return new Date(`${now.toDateString()} ${this.PRACTICE_REPORT_SCHEDULE[nextReportDay].time}`);
    }

    return gameTime;
  }

  shouldHighlightUpdate(player: any): boolean {
    const nextUpdate = this.getNextUpdateTime(player);
    const now = new Date();
    const hoursUntilUpdate = (nextUpdate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      player.status !== 'ACTIVE' && 
      hoursUntilUpdate < 24 && 
      hoursUntilUpdate > 0
    );
  }
}