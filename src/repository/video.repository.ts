import { cacheLife } from 'next/dist/server/use-cache/cache-life'
import { notFound } from 'next/navigation'
import { Brackets } from 'typeorm'
import { db, pool } from '../db'
import { IPagination } from '../interface/pagination.interface'

export async function getVideos(opts: IPagination & { channelId?: string }) {
  'use cache'
  cacheLife('minutes')

  const queryBase = db.createQueryBuilder()
    .from('youtube_video', 'v')

  if (opts.channelId) {
    queryBase.andWhere('channel_id = :channelId', { channelId: opts.channelId })
  }

  if (opts.query) {
    queryBase.andWhere(new Brackets((b0) => b0
      .orWhere('id ILIKE :query', { query: `%${opts.query}%` })
      .orWhere('title ILIKE :query')
    ))
  }

  const queryCount = queryBase
    .select('COUNT(*)')

  const { rows: [{ count }] } = await pool.query(...queryCount.getQueryAndParameters())

  const queryItem = queryBase
    .select('id')
    .addSelect('is_active')
    .addSelect('created_at')
    .addSelect('privacy_status')
    .addSelect('is_members_only')
    .addSelect('title')
    // .addSelect('actual_start')
    // .addSelect('actual_end')
    .addOrderBy('COALESCE(actual_start, created_at)', 'DESC', 'NULLS LAST')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows } = await pool.query(...queryItem.getQueryAndParameters())
  return { total: Number(count), items: rows }
}

export async function getVideoById(id: string) {
  'use cache'
  cacheLife('minutes')

  const query = `
SELECT *
FROM youtube_video
WHERE id = $1
  `

  const { rowCount, rows } = await pool.query(query, [id])
  if (!rowCount) {
    notFound()
  }

  return rows[0]
}
