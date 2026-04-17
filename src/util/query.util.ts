import { QueryResult } from 'pg'

export class QueryUtil {
  public static toTotal(result: QueryResult<any>) {
    const value = result.rows[0].count
    return Number(value)
  }
}
