export class BitUtil {
  public static fromBoolsToNumber(arr: boolean[]): number {
    if (!Array.isArray(arr) || arr.length === 0) {
      return 0
    }

    const res = arr.reduce((acc, bool) => {
      return (acc << 1) | (bool ? 1 : 0)
    }, 0)

    return res
  }

  public static fromNumberToBools(num: number, length = 0): boolean[] {
    const bits = []

    if (length === 0) {
      if (num === 0) {
        return [false]
      }

      let n = num
      while (n > 0) {
        bits.unshift(n & 1 ? true : false)
        n = Math.floor(n / 2)
      }
      return bits
    }

    for (let i = length - 1; i >= 0; i--) {
      bits.push((num & (1 << i)) !== 0)
    }

    return bits
  }
}
