import { Stack } from '../StackBuilder';

export class StackSorter {
  sortStacks(stacks: Stack[], contestType: string): Stack[] {
    return stacks.sort((a, b) => {
      if (contestType === 'gpp') {
        return this.compareGPPStacks(a, b);
      }
      return this.compareCashStacks(a, b);
    });
  }

  private compareGPPStacks(a: Stack, b: Stack): number {
    const aScore = (a.projectedPoints * a.correlation) / (this.getStackOwnership(a) || 1);
    const bScore = (b.projectedPoints * b.correlation) / (this.getStackOwnership(b) || 1);
    return bScore - aScore;
  }

  private compareCashStacks(a: Stack, b: Stack): number {
    return b.projectedPoints - a.projectedPoints;
  }

  private getStackOwnership(stack: Stack): number {
    return stack.players.reduce((sum, p) => sum + (p.ownership || 0), 0) / stack.players.length;
  }
}

export const stackSorter = new StackSorter();