import { ChatActionFormValue, ChatTypeOption } from '../interface/superchat.interface'
import { BitUtil } from './bit.util'

export class SuperChatUtil {
  public static readonly OPTIONS: ChatTypeOption[] = [
    {
      id: 0,
      key: 'addSuperChatItemAction',
      label: 'addSuperChat',
      checked: true,
      count: 0,
    },
    {
      id: 1,
      key: 'addMembershipItemAction',
      label: 'addMembership',
      checked: false,
      count: 0,
    },
    {
      id: 2,
      key: 'membershipGiftPurchaseAction',
      label: 'membershipGiftPurchase',
      checked: false,
      count: 0,
    },
    {
      id: 3,
      key: 'membershipGiftRedemptionAction',
      label: 'membershipGiftRedemption',
      checked: false,
      count: 0,
    },
  ]

  public static getTypes(options: ChatTypeOption[]): number {
    let mask = 0
    options.forEach((option) => {
      if (option.checked) {
        mask |= (1 << option.id)
      }
    })
    return mask
  }

  public static getDefaultTypes(): number {
    const mask = SuperChatUtil.getTypes(SuperChatUtil.OPTIONS)
    return mask
  }

  public static getInitialValues(initValue?: string | null): ChatActionFormValue {
    const mask = [undefined, null, ''].includes(initValue)
      ? SuperChatUtil.getDefaultTypes()
      : Number(initValue)
    const types = SuperChatUtil.OPTIONS.map(option => ({
      ...option,
      checked: !!(mask & (1 << option.id))
    }))
    return { types }
  }

  public static getTransformValues(values: ChatActionFormValue) {
    const types = BitUtil.fromBoolsToNumber(values.types.map(v => v.checked).reverse())
    return { types }
  }

  public static getTypesParam(value: number): string {
    const defaultTypes = SuperChatUtil.getDefaultTypes()
    if (value === defaultTypes) {
      return ''
    }
    return String(value)
  }
}
