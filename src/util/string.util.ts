export class StringUtil {
  static toIsoString(s: string) {
    if (!s) {
      return ''
    }

    return new Date(Number(s))
      .toISOString()
  }

  static toMultilineIsoString(s: string) {
    if (!s) {
      return ''
    }

    return new Date(Number(s))
      .toISOString()
      .replace('T', 'T\n')
  }
}
