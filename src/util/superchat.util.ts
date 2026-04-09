import { ChatActionForm, ChatTypeOption } from '../interface/superchat.interface'

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

  public static getInitialValues(initValue?: string | null): ChatActionForm {
    const defaultTypes = SuperChatUtil.getDefaultTypes()
    const mask = initValue !== null
      ? Number(initValue)
      : defaultTypes
    const types = SuperChatUtil.OPTIONS.map(option => ({
      ...option,
      checked: !!(mask & (1 << option.id))
    }))
    return { types }
  }

  public static getTransformValues(values: ChatActionForm) {
    const res = values.types.filter(v => v.checked).map(v => v.key).join(',')
    return res
  }

  public static getTypesParam(values: ChatActionForm): string {
    const defaultTypes = SuperChatUtil.getDefaultTypes()
    const mask = SuperChatUtil.getTypes(values.types) ?? defaultTypes
    if (mask === defaultTypes) {
      return ''
    }
    return String(mask)
  }
}
