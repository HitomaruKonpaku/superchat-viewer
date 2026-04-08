export class ColorUtil {
  static fromSignificance(significance: string): string {
    const dict: Record<string, string> = {
      1: 'blue',
      2: 'lightblue',
      3: 'green',
      4: 'yellow',
      5: 'orange',
      6: 'magenta',
      7: 'red',
    }
    return dict[significance]
  }
}
