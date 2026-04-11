import { cacheLife } from 'next/dist/server/use-cache/cache-life'
import { notFound } from 'next/navigation'
import { db, pool } from '../db'
import { IPagination } from '../interface/pagination.interface'

export async function getAuthorSuperChats(
  authorId: string,
  opts: IPagination & {
    types: string[]
  },
) {
  'use cache'
  cacheLife('minutes')

  if (!opts.types.length) {
    return { total: 0, items: [] }
  }

  if (!authorId) {
    throw new Error('AUTHOR_ID_NOT_FOUND')
  }

  const queryBase = db.createQueryBuilder()
    .from('youtube_chat_action', 'yca')
    .leftJoinAndSelect('youtube_video', 'yv', 'yv.id = yca.video_id')
    .andWhere('author_channel_id = :authorId', { authorId })
    .andWhere('type IN (:...types)', { types: opts.types })

  const queryCount = queryBase
    .select('COUNT(*)')

  const { rows: [{ count }] } = await pool.query(...queryCount.getQueryAndParameters())

  const queryItem = queryBase
    .select('yca.id')
    .addSelect('yca.created_at')
    .addSelect('video_id')
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
    .addSelect('yca.message')
    .addSelect('yca.currency')
    .addSelect('yca.amount')
    .addSelect('yca.color')
    .addSelect('yca.level')
    // .addSelect(`yca.membership ->> 'thumbnail'`, 'membership_thumbnail')
    .addSelect('yca.sender_name')
    .addSelect('yv.title', 'video_title')
    .addSelect('yc.id', 'channel_id')
    .addSelect('yc.custom_url', 'channel_custom_url')
    .addSelect('yc.name', 'channel_name')
    .addSelect('yc.thumbnail_url', 'channel_thumbnail_url')
    .leftJoinAndSelect('youtube_channel', 'yc', 'yc.id = yv.channel_id')
    .addOrderBy('yca."created_at"', 'DESC')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows } = await pool.query(...queryItem.getQueryAndParameters())
  return { total: Number(count), items: rows }
}

export async function getAuthorBaseChats(
  authorId: string,
  opts: IPagination,
) {
  'use cache'
  cacheLife('minutes')

  if (!authorId) {
    throw new Error('AUTHOR_ID_NOT_FOUND')
  }

  const types = [
    'addChatItemAction',
    // 'addSuperChatItemAction',
  ]

  const createChatQueryBuilder = (tableName: string) => db.createQueryBuilder()
    .from(tableName, 'yca')
    .andWhere('author_channel_id = :authorId', { authorId })
    .andWhere('type IN (:...types)', { types })
    .select('id')
    .addSelect('created_at')
    .addSelect('video_id')
    .addSelect('author_channel_id')
    .addSelect('author_name')
    .addSelect('author_photo')
    .addSelect('is_owner')
    .addSelect('is_moderator')
    .addSelect('is_verified')
    .addSelect('message')

  const queryItem = db.createQueryBuilder()
    .addCommonTableExpression(
      createChatQueryBuilder('youtube_chat_action'),
      'yca_1',
    )
    .addCommonTableExpression(
      createChatQueryBuilder('youtube_chat_action_chat'),
      'yca_2',
    )
    .addCommonTableExpression(
      '(SELECT * FROM yca_1) UNION ALL (SELECT * FROM yca_2)',
      'yca',
    )
    .addCommonTableExpression(
      'SELECT COUNT(*) AS _total FROM yca',
      'total',
    )
    .from('yca', 'yca')
    .select('yca.*')
    .addSelect('yv.title', 'video_title')
    .addSelect('yc.id', 'channel_id')
    .addSelect('yc.custom_url', 'channel_custom_url')
    .addSelect('yc.name', 'channel_name')
    .addSelect('yc.thumbnail_url', 'channel_thumbnail_url')
    .addSelect('tt.*')
    .leftJoin('youtube_video', 'yv', 'yv.id = yca.video_id')
    .leftJoin('youtube_channel', 'yc', 'yc.id = yv.channel_id')
    .leftJoin('total', 'tt', 'TRUE')
    .addOrderBy('yca."created_at"', 'DESC')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows } = await pool.query(...queryItem.getQueryAndParameters())
  let total = 0
  const items = rows.map((v) => {
    v.created_at = Number(v.created_at)
    total = total || Number(v._total)
    delete v._total
    return v
  })
  return { total, items }
}

export async function getAuthorById(id: string) {
  'use cache'
  cacheLife('minutes')

  const queryBase = db.createQueryBuilder()
    .addSelect('author_channel_id', 'id')
    .addSelect('author_name', 'name')
    .addSelect('author_photo', 'photo')
    .from('youtube_chat_action', 'yca')
    .andWhere('author_channel_id = :authorId', { authorId: id })
    .addOrderBy('yca."created_at"', 'DESC')
    .limit(1)

  const { rowCount, rows } = await pool.query(...queryBase.getQueryAndParameters())
  if (!rowCount) {
    notFound()
  }

  return rows[0]
}

export async function getSuperChatTypesByAuthorId(
  authorId: string,
) {
  'use cache'
  cacheLife('minutes')

  if (!authorId) {
    throw new Error('AUTHOR_ID_NOT_FOUND')
  }

  const query = `
SELECT type,
  COUNT(*) AS count
FROM youtube_chat_action
WHERE author_channel_id = $1
GROUP BY type
ORDER BY type
  `

  const { rows } = await pool.query(query, [authorId])
  const items = rows.map(v => {
    v.count = Number(v.count)
    return v
  })

  return { total: items.length, items }
}

export async function getSuperChatColorsByAuthorId(
  authorId: string,
) {
  'use cache'
  cacheLife('minutes')

  if (!authorId) {
    throw new Error('AUTHOR_ID_NOT_FOUND')
  }

  const query = `
WITH sig AS (
  SELECT generate_series(1, 7) AS id
),
yca_sig AS (
  SELECT significance,
    COUNT(*) AS cnt
  FROM youtube_chat_action
  WHERE author_channel_id = $1
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

  const { rows } = await pool.query(query, [authorId])
  const items = rows.map(v => {
    v.count = Number(v.count)
    return v
  })

  return { total: items.length, items }
}
