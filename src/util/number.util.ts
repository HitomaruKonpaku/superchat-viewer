export class NumberUtil {
  public static parse(value: unknown, defaultValue: any = undefined) {
    if (value === undefined || value === null) {
      return defaultValue
    }

    const n = Number(value)
    return Number.isNaN(n)
      ? defaultValue
      : n
  }

  public static range(cur: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
    return Math.max(min, Math.min(max, cur))
  }

  public static fromDate(value: number | string | Date, defaultValue = undefined) {
    if (!value && value !== 0) {
      return defaultValue
    }
    const date = new Date(value)
    const n = date.getTime()
    return n
  }
}
