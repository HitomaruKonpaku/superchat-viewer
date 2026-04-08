export class EmojiUtil {
  static fromBoolean(value: boolean) {
    if (value === undefined || value === null) {
      return '❔'
    }
    return value
      ? '✅'
      : '❌'
  }

  static fromSignificance(significance: string): string {
    const dict: Record<string, string> = {
      1: '🔵',
      2: '🔵',
      3: '🟢',
      4: '🟡',
      5: '🟠',
      6: '🟣',
      7: '🔴',
    }
    return dict[significance]
  }

  static fromColor(color: string): string {
    const dict: Record<string, string> = {
      blue: '🔵',
      lightblue: '🔵',
      green: '🟢',
      yellow: '🟡',
      orange: '🟠',
      magenta: '🟣',
      red: '🔴',
    }
    return dict[color]
  }
}
