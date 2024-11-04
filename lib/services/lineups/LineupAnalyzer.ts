import { Player } from '@/lib/types/dfs';

interface LineupAnalysis {
  ownership: OwnershipAnalysis;
  stacks: StackAnalysis;
  correlations: CorrelationAnalysis;
  value: ValueAnalysis;
  gameTheory: GameTheoryAnalysis;
}

interface OwnershipAnalysis {
  totalOwnership: number;
  averageOwnership: number;
  highestOwned: Player[];
  lowestOwned: Player[];
  leverageSpots: Player[];
}

interface StackAnalysis {
  primaryStacks: Stack[];
  bringbacks: Stack[];
  uniqueStacks: Stack[];
  stackTypes: {
    qbWr: number;
    qbTe: number;
    rbWr: number;
    wrWr: number;
  };
}

interface CorrelationAnalysis {
  positiveCorrelations: [string, string, number][];
  negativeCorrelations: [string, string, number][];
  stackCorrelations: [string[], number][];
}

interface ValueAnalysis {
  totalSalary: number;
  averageValue: number;
  bestValues: Player[];
  worstValues: Player[];
  salaryDistribution: Record<string, number>;
}

interface GameTheoryAnalysis {
  uniqueness: number;
  contestEdge: number;
  leverageScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface Stack {
  players: Player[];
  correlation: number;
  totalSalary: number;
  projectedPoints: number;
  leverageScore: number;
}

export class LineupAnalyzer {
  analyzeLineup(lineup: Player[]): LineupAnalysis {
    return {
      ownership: this.analyzeOwnership(lineup),
      stacks: this.analyzeStacks(lineup),
      correlations: this.analyzeCorrelations(lineup),
      value: this.analyzeValue(lineup),
      gameTheory: this.analyzeGameTheory(lineup)
    };
  }

  private analyzeOwnership(lineup: Player[]): OwnershipAnalysis {
    const totalOwnership = lineup.reduce((sum, p) => sum + (p.ownership || 0), 0);
    const averageOwnership = totalOwnership / lineup.length;

    // Sort players by ownership
    const sortedByOwnership = [...lineup].sort((a, b) => 
      (b.ownership || 0) - (a.ownership || 0)
    );

    return {
      totalOwnership,
      averageOwnership,
      highestOwned: sortedByOwnership.slice(0, 3),
      lowestOwned: sortedByOwnership.slice(-3),
      leverageSpots: this.findLeverageSpots(lineup)
    };
  }

  private analyzeStacks(lineup: Player[]): StackAnalysis {
    const qb = lineup.find(p => p.position === 'QB');
    const stacks: StackAnalysis = {
      primaryStacks: [],
      bringbacks: [],
      uniqueStacks: [],
      stackTypes: {
        qbWr: 0,
        qbTe: 0,
        rbWr: 0,
        wrWr: 0
      }
    };

    if (qb) {
      // Find QB stacks
      const sameTeamPlayers = lineup.filter(p => 
        p.team === qb.team && p !== qb
      );

      // Analyze QB-WR stacks
      const wrStacks = sameTeamPlayers.filter(p => p.position === 'WR');
      stacks.stackTypes.qbWr = wrStacks.length;

      // Analyze QB-TE stacks
      const teStacks = sameTeamPlayers.filter(p => p.position === 'TE');
      stacks.stackTypes.qbTe = teStacks.length;

      // Create primary stacks
      if (wrStacks.length > 0 || teStacks.length > 0) {
        stacks.primaryStacks.push({
          players: [qb, ...wrStacks, ...teStacks],
          correlation: this.calculateStackCorrelation([qb, ...wrStacks, ...teStacks]),
          totalSalary: [qb, ...wrStacks, ...teStacks].reduce((sum, p) => sum + p.salary, 0),
          projectedPoints: [qb, ...wrStacks, ...teStacks].reduce((sum, p) => sum + p.projectedPoints, 0),
          leverageScore: this.calculateLeverageScore([qb, ...wrStacks, ...teStacks])
        });
      }

      // Find bring-back stacks
      const oppPlayers = lineup.filter(p => p.team === qb.opponent);
      if (oppPlayers.length > 0) {
        stacks.bringbacks.push({
          players: oppPlayers,
          correlation: this.calculateStackCorrelation(oppPlayers),
          totalSalary: oppPlayers.reduce((sum, p) => sum + p.salary, 0),
          projectedPoints: oppPlayers.reduce((sum, p) => sum + p.projectedPoints, 0),
          leverageScore: this.calculateLeverageScore(oppPlayers)
        });
      }
    }

    // Find unique non-QB stacks
    const rbWrStacks = this.findRbWrStacks(lineup);
    stacks.stackTypes.rbWr = rbWrStacks.length;
    stacks.uniqueStacks.push(...rbWrStacks);

    return stacks;
  }

  private analyzeCorrelations(lineup: Player[]): CorrelationAnalysis {
    const correlations: CorrelationAnalysis = {
      positiveCorrelations: [],
      negativeCorrelations: [],
      stackCorrelations: []
    };

    // Analyze all player pairs
    for (let i = 0; i < lineup.length; i++) {
      for (let j = i + 1; j < lineup.length; j++) {
        const correlation = this.calculatePlayerCorrelation(
          lineup[i],
          lineup[j]
        );

        if (correlation > 0.3) {
          correlations.positiveCorrelations.push([
            lineup[i].name,
            lineup[j].name,
            correlation
          ]);
        } else if (correlation < -0.3) {
          correlations.negativeCorrelations.push([
            lineup[i].name,
            lineup[j].name,
            correlation
          ]);
        }
      }
    }

    // Analyze stack correlations
    const stacks = this.findAllStacks(lineup);
    correlations.stackCorrelations = stacks.map(stack => [
      stack.players.map(p => p.name),
      this.calculateStackCorrelation(stack.players)
    ]);

    return correlations;
  }

  private analyzeValue(lineup: Player[]): ValueAnalysis {
    const totalSalary = lineup.reduce((sum, p) => sum + p.salary, 0);
    const values = lineup.map(p => ({
      player: p,
      value: p.projectedPoints / (p.salary / 1000)
    }));

    // Sort by value
    const sortedByValue = [...values].sort((a, b) => b.value - a.value);

    // Calculate salary distribution by position
    const salaryDistribution = lineup.reduce((dist, p) => {
      dist[p.position] = (dist[p.position] || 0) + p.salary;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalSalary,
      averageValue: values.reduce((sum, v) => sum + v.value, 0) / values.length,
      bestValues: sortedByValue.slice(0, 3).map(v => v.player),
      worstValues: sortedByValue.slice(-3).map(v => v.player),
      salaryDistribution
    };
  }

  private analyzeGameTheory(lineup: Player[]): GameTheoryAnalysis {
    const uniqueness = this.calculateUniqueness(lineup);
    const leverageScore = this.calculateLineupLeverage(lineup);
    
    return {
      uniqueness,
      contestEdge: this.calculateContestEdge(lineup),
      leverageScore,
      riskLevel: this.determineRiskLevel(uniqueness, leverageScore),
      recommendations: this.generateRecommendations(lineup)
    };
  }

  private findLeverageSpots(lineup: Player[]): Player[] {
    return lineup.filter(player => {
      const ownership = player.ownership || 0;
      const projectedPoints = player.projectedPoints;
      const salary = player.salary;

      // Find players with low ownership but high projection relative to salary
      const value = projectedPoints / (salary / 1000);
      return ownership < 10 && value > 2;
    });
  }

  private calculateStackCorrelation(players: Player[]): number {
    // Implement historical correlation calculation
    return 0.5 + Math.random() * 0.3; // Placeholder
  }

  private calculateLeverageScore(players: Player[]): number {
    const avgOwnership = players.reduce((sum, p) => sum + (p.ownership || 0), 0) / players.length;
    const projectedPoints = players.reduce((sum, p) => sum + p.projectedPoints, 0);
    return (projectedPoints * 0.7) * (1 - avgOwnership / 100);
  }

  private findRbWrStacks(lineup: Player[]): Stack[] {
    const stacks: Stack[] = [];
    const rbs = lineup.filter(p => p.position === 'RB');
    const wrs = lineup.filter(p => p.position === 'WR');

    rbs.forEach(rb => {
      const sameTeamWrs = wrs.filter(wr => wr.team === rb.team);
      if (sameTeamWrs.length > 0) {
        stacks.push({
          players: [rb, ...sameTeamWrs],
          correlation: this.calculateStackCorrelation([rb, ...sameTeamWrs]),
          totalSalary: [rb, ...sameTeamWrs].reduce((sum, p) => sum + p.salary, 0),
          projectedPoints: [rb, ...sameTeamWrs].reduce((sum, p) => sum + p.projectedPoints, 0),
          leverageScore: this.calculateLeverageScore([rb, ...sameTeamWrs])
        });
      }
    });

    return stacks;
  }

  private calculatePlayerCorrelation(player1: Player, player2: Player): number {
    // Implement historical correlation calculation
    if (player1.team === player2.team) {
      return 0.3 + Math.random() * 0.4;
    }
    return -0.2 + Math.random() * 0.4;
  }

  private findAllStacks(lineup: Player[]): Stack[] {
    const stacks: Stack[] = [];
    const teams = new Set(lineup.map(p => p.team));

    teams.forEach(team => {
      const teamPlayers = lineup.filter(p => p.team === team);
      if (teamPlayers.length >= 2) {
        stacks.push({
          players: teamPlayers,
          correlation: this.calculateStackCorrelation(teamPlayers),
          totalSalary: teamPlayers.reduce((sum, p) => sum + p.salary, 0),
          projectedPoints: teamPlayers.reduce((sum, p) => sum + p.projectedPoints, 0),
          leverageScore: this.calculateLeverageScore(teamPlayers)
        });
      }
    });

    return stacks;
  }

  private calculateUniqueness(lineup: Player[]): number {
    const avgOwnership = lineup.reduce((sum, p) => sum + (p.ownership || 0), 0) / lineup.length;
    return 1 - (avgOwnership / 100);
  }

  private calculateContestEdge(lineup: Player[]): number {
    const uniqueness = this.calculateUniqueness(lineup);
    const projectedPoints = lineup.reduce((sum, p) => sum + p.projectedPoints, 0);
    return uniqueness * (projectedPoints / 100);
  }

  private calculateLineupLeverage(lineup: Player[]): number {
    const avgOwnership = lineup.reduce((sum, p) => sum + (p.ownership || 0), 0) / lineup.length;
    const projectedPoints = lineup.reduce((sum, p) => sum + p.projectedPoints, 0);
    return (projectedPoints / 100) * (1 - avgOwnership / 100);
  }

  private determineRiskLevel(
    uniqueness: number,
    leverageScore: number
  ): 'low' | 'medium' | 'high' {
    const score = uniqueness * leverageScore;
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  private generateRecommendations(lineup: Player[]): string[] {
    const recommendations: string[] = [];
    const analysis = {
      ownership: this.analyzeOwnership(lineup),
      value: this.analyzeValue(lineup),
      stacks: this.analyzeStacks(lineup)
    };

    // Ownership-based recommendations
    if (analysis.ownership.averageOwnership > 20) {
      recommendations.push('Consider pivoting to lower-owned players for GPPs');
    }

    // Value-based recommendations
    if (analysis.value.averageValue < 2) {
      recommendations.push('Look for higher value plays to improve ceiling');
    }

    // Stack-based recommendations
    if (analysis.stacks.primaryStacks.length === 0) {
      recommendations.push('Add correlated stacks to increase upside');
    }

    return recommendations;
  }
}

export const lineupAnalyzer = new LineupAnalyzer();