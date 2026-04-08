export class SuperChatUtil {
  public static getDefaultTypes() {
    const tmp: Record<string, boolean> = {
      addSuperChatItemAction: true,
      addMembershipItemAction: false,
      membershipGiftPurchaseAction: false,
      membershipGiftRedemptionAction: false,
    }
    return tmp
  }

  public static getInitialValues(initValue?: string | null) {
    const tmp = SuperChatUtil.getDefaultTypes()
    if (initValue) {
      const arr = initValue.split(',')
      Object.keys(tmp).forEach((key) => {
        tmp[key] = arr.includes(key)
      })
    }
    return tmp
  }

  public static getTransformValues(values: any) {
    const tmp = Object.keys(values).filter((key) => values[key])
    return tmp.join(',')
  }

  public static getTypesParam(values: any) {
    const defaultConfig = SuperChatUtil.getDefaultTypes()
    const defaultStr = Object.keys(values)
      .filter(v => defaultConfig[v])
      .join(',')
    const tmp = Object.keys(values)
      .filter(v => values[v])
      .join(',')

    if (!tmp) {
      return '.'
    }

    if (tmp === defaultStr) {
      return null
    }

    return tmp
  }
}
