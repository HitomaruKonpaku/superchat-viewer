import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { Brackets } from 'typeorm'
import { db, pool } from '../db'
import { IPagination } from '../interface/pagination.interface'
import { NumberUtil } from '../util/number.util'
import { QueryUtil } from '../util/query.util'

export async function getChannels(opts: IPagination) {
  'use cache'
  cacheLife('minutes')

  const queryBase = db.createQueryBuilder()
    .from('youtube_channel', 'yc')
    .leftJoin('user_pool', 'up', 'up.source_id = yc.id')
    .andWhere(new Brackets((b0) => b0
      .orWhere('source_type ISNULL')
      .orWhere('source_type = :source_type', { source_type: 'YOUTUBE' }),
    ))

  if (opts.query) {
    queryBase.andWhere(new Brackets((b0) => b0
      .orWhere('yc.id ILIKE :query', { query: `%${opts.query}%` })
      .orWhere('yc.custom_url ILIKE :query')
      .orWhere('yc.name ILIKE :query'),
    ))
  }

  const queryCount = queryBase
    .select('COUNT(*)')

  const total = await pool.query(...queryCount.getQueryAndParameters())
    .then(QueryUtil.toTotal)

  const queryItem = db.createQueryBuilder()
    .addCommonTableExpression(
      queryBase
        .select('yc.id')
        .addSelect('yc.created_at')
        .addSelect('yc.custom_url')
        .addSelect('yc.name')
        .addSelect('yc.thumbnail_url')
        .addSelect('up.is_active')
        .addSelect('up.has_membership')
        .addOrderBy('up."has_membership"', 'DESC', 'NULLS LAST')
        .addOrderBy('up."is_active"', 'DESC', 'NULLS LAST')
        .addOrderBy('yc."created_at"', 'ASC', 'NULLS LAST')
        .addOrderBy('yc."name"', 'ASC', 'NULLS LAST')
        .limit(opts.limit)
        .offset(opts.offset)
      ,
      'tmp_youtube_channel',
    )
    .addCommonTableExpression(
      db.createQueryBuilder()
        .addSelect('c.id')
        .addSelect('COUNT(v.id)')
        .from('tmp_youtube_channel', 'c')
        .leftJoin('youtube_video', 'v', 'v.channel_id = c.id')
        .addGroupBy('c.id')
      ,
      'tmp_stats',
    )
    .addSelect('c.*')
    .addSelect('s.count', 'video_count')
    .from('tmp_youtube_channel', 'c')
    .leftJoin('tmp_stats', 's', 's.id = c.id')

  const { rows: items } = await pool.query(...queryItem.getQueryAndParameters())
  items.forEach(item => {
    item.created_at = NumberUtil.parse(item.created_at)
    item.video_count = NumberUtil.parse(item.video_count)
  })

  return { total, items }
}

export async function getChannelById(id: string) {
  'use cache'
  cacheLife('minutes')

  const query = db.createQueryBuilder()
    .from('youtube_channel', 'yc')
    .andWhere('id = :id', { id })

  const { rowCount, rows } = await pool.query(...query.getQueryAndParameters())
  if (!rowCount) {
    notFound()
  }

  const item = rows[0]
  item.created_at = NumberUtil.parse(item.created_at)
  item.updated_at = NumberUtil.parse(item.created_at)
  item.modified_at = NumberUtil.parse(item.created_at)

  return item
}
