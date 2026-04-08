import { IPagination } from '../interface/pagination.interface'
import { NumberUtil } from './number.util'

export class RequestUtil {
  static parsePaginationParams(searchParams: URLSearchParams): IPagination {
    const limit = NumberUtil.range(NumberUtil.parse(searchParams.get('limit'), 100), 1, 1000)
    const page = NumberUtil.range(NumberUtil.parse(searchParams.get('page'), 1), 1)
    const offset = limit * (page - 1)
    const query = (searchParams.get('q') || searchParams.get('query')) as string
    return {
      limit,
      offset,
      query,
    }
  }

  static parseChatActionTypes(searchParams: URLSearchParams) {
    const allTypes = [
      'addSuperChatItemAction',
      'addMembershipItemAction',
      'membershipGiftPurchaseAction',
      'membershipGiftRedemptionAction',
    ]
    const defaultTypes = [
      'addSuperChatItemAction',
    ]
    const tmpTypes = searchParams.get('types')?.split(',') || defaultTypes
    const types = allTypes.filter((type) => tmpTypes.includes(type))
    return types
  }
}
