import { cacheLife } from 'next/dist/server/use-cache/cache-life'
import { notFound } from 'next/navigation'
import { Brackets } from 'typeorm'
import { db, pool } from '../db'
import { IPagination } from '../interface/pagination.interface'

export async function getVideos(opts: IPagination & { channelId?: string }) {
  'use cache'
  cacheLife('minutes')

  const queryBase = db.createQueryBuilder()
    .from('youtube_video', 'yv')

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
    .addOrderBy('COALESCE(actual_start, created_at)', 'DESC', 'NULLS LAST')
    .addOrderBy('modified_at', 'ASC', 'NULLS LAST')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows } = await pool.query(...queryItem.getQueryAndParameters())
  return { total: Number(count), items: rows }
}

export async function getVideoById(id: string) {
  'use cache'
  cacheLife('minutes')

  const query = db.createQueryBuilder()
    .from('youtube_video', 'yv')
    .andWhere('id = :id', { id })

  const { rowCount, rows } = await pool.query(...query.getQueryAndParameters())
  if (!rowCount) {
    notFound()
  }

  return rows[0]
}

export async function getVideoSuperChats(
  videoId: string,
  opts: IPagination & {
    types: string[]
  },
) {
  'use cache'
  cacheLife('minutes')

  if (!opts.types.length) {
    return { total: 0, items: [] }
  }

  if (!videoId) {
    throw new Error('VIDEO_ID_NOT_FOUND')
  }

  const queryBase = db.createQueryBuilder()
    .from('youtube_chat_action', 'yca')
    .andWhere('video_id = :videoId', { videoId })
    .andWhere('type IN (:...types)', { types: opts.types })

  const queryCount = queryBase
    .select('COUNT(*)')

  const { rows: [{ count }] } = await pool.query(...queryCount.getQueryAndParameters())

  const queryItem = db.createQueryBuilder()
    .addCommonTableExpression(queryBase.select('*'), 'yca')
    .addCommonTableExpression(
      db.createQueryBuilder()
        .select('id')
        .addSelect('ROW_NUMBER () OVER (PARTITION BY author_channel_id ORDER BY created_at)', 'sc_counter')
        .from('yca', 'yca')
        .andWhere('type = :scType', { scType: 'addSuperChatItemAction' })
      ,
      'sc',
    )
    .select('yca.id')
    .addSelect('yca.created_at')
    // .addSelect('yca.type')
    .addSelect(`
CASE
  WHEN type = 'addSuperChatItemAction'         THEN 1
  WHEN type = 'addMembershipItemAction'        THEN 2
  WHEN type = 'membershipGiftPurchaseAction'   THEN 4
  WHEN type = 'membershipGiftRedemptionAction' THEN 8
  ELSE -1
END
      `, 'type')
    .addSelect('yca.author_channel_id')
    .addSelect('yca.author_name')
    .addSelect('yca.author_photo')
    .addSelect('yca.message')
    .addSelect('yca.currency')
    .addSelect('yca.amount')
    .addSelect('yca.color')
    .addSelect('yca.level')
    // .addSelect(`yca.membership ->> 'thumbnail'`, 'membership_thumbnail')
    .addSelect('yca.sender_name')
    .addSelect('sc.sc_counter')
    .from('yca', 'yca')
    .leftJoin('sc', 'sc', 'sc.id = yca.id')
    .addOrderBy('yca."created_at"')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows } = await pool.query(...queryItem.getQueryAndParameters())
  return { total: Number(count), items: rows }
}

export async function getVideoSuperChatTypes(
  videoId: string,
) {
  'use cache'
  cacheLife('minutes')

  if (!videoId) {
    throw new Error('VIDEO_ID_NOT_FOUND')
  }

  const query = `
SELECT type,
  COUNT(*) AS count
FROM youtube_chat_action
WHERE video_id = $1
GROUP BY type
ORDER BY type
  `

  const { rows } = await pool.query(query, [videoId])
  const items = rows.map(v => {
    v.count = Number(v.count)
    return v
  })

  return { total: items.length, items }
}

export async function getVideoSuperChatColors(
  videoId: string,
) {
  'use cache'
  cacheLife('minutes')

  if (!videoId) {
    throw new Error('VIDEO_ID_NOT_FOUND')
  }

  const query = `
WITH sig AS (
  SELECT generate_series(1, 7) AS id
),
yca_sig AS (
  SELECT significance,
    COUNT(*) AS cnt
  FROM youtube_chat_action
  WHERE video_id = $1
    AND type = 'addSuperChatItemAction'
  GROUP BY significance
)
SELECT s.id AS significance,
  (
    ARRAY [
      'blue',
      'lightblue',
      'green',
      'yellow',
      'orange',
      'magenta',
      'red'
    ]
  ) [s.id] AS color,
  COALESCE(ys.cnt, 0) AS count
FROM sig AS s
  LEFT JOIN yca_sig AS ys ON ys.significance = s.id
ORDER BY s.id
  `

  const { rows } = await pool.query(query, [videoId])
  const items = rows.map(v => {
    v.count = Number(v.count)
    return v
  })

  return { total: items.length, items }
}
