import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { db, pool } from '../db'
import { IPagination } from '../interface/pagination.interface'
import { NumberUtil } from '../util/number.util'
import { QueryUtil } from '../util/query.util'

function verifyId(id: string) {
  if (!id) {
    throw new Error('AUTHOR_ID_NOT_FOUND')
  }
}

export async function getAuthorById(id: string) {
  'use cache'
  cacheLife('minutes')

  const query = db.createQueryBuilder()
    .select('author_channel_id', 'id')
    .addSelect('author_name', 'name')
    .addSelect('author_photo', 'photo')
    .from('youtube_chat_action', 'yca')
    .andWhere('author_channel_id = :id', { id })
    .addOrderBy('yca."created_at"', 'DESC')
    .limit(1)

  const { rowCount, rows } = await pool.query(...query.getQueryAndParameters())
  if (!rowCount) {
    notFound()
  }

  const item = rows[0]
  return item
}

export async function getAuthorSuperChats(
  authorId: string,
  opts: IPagination & {
    types: string[]
  },
) {
  'use cache'
  cacheLife('minutes')

  verifyId(authorId)

  if (!opts.types.length) {
    return { total: 0, items: [] }
  }

  const queryBase = db.createQueryBuilder()
    .from('youtube_chat_action', 'yca')
    .leftJoin('youtube_video', 'yv', 'yv.id = yca.video_id')
    .andWhere('author_channel_id = :authorId', { authorId })
    .andWhere('type IN (:...types)', { types: opts.types })

  const queryCount = queryBase
    .select('COUNT(*)')

  const total = await pool.query(...queryCount.getQueryAndParameters())
    .then(QueryUtil.toTotal)

  const queryItem = queryBase
    .select('yca.id')
    .addSelect('yca.created_at')
    .addSelect('video_id')
    // .addSelect('yca.type')
    .addSelect(`
CASE
  WHEN type = 'addSuperChatItemAction'           THEN 1
  WHEN type = 'addMembershipItemAction'          THEN 2
  WHEN type = 'addMembershipMilestoneItemAction' THEN 4
  WHEN type = 'membershipGiftPurchaseAction'     THEN 8
  WHEN type = 'membershipGiftRedemptionAction'   THEN 16
  ELSE -1
END
      `, 'type')
    .addSelect('yca.message')
    .addSelect('yca.currency')
    .addSelect('yca.amount')
    .addSelect('yca.color')
    .addSelect('yca.level')
    .addSelect('yca.membership')
    .addSelect('yca.sender_name')
    .addSelect('yv.title', 'video_title')
    .addSelect('yc.id', 'channel_id')
    .addSelect('yc.custom_url', 'channel_custom_url')
    .addSelect('yc.name', 'channel_name')
    .addSelect('yc.thumbnail_url', 'channel_thumbnail_url')
    .leftJoin('youtube_channel', 'yc', 'yc.id = yv.channel_id')
    .addOrderBy('yca."created_at"', 'DESC')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows: items } = await pool.query(...queryItem.getQueryAndParameters())
  items.forEach(item => {
    item.created_at = NumberUtil.parse(item.created_at)
    item.amount = NumberUtil.parse(item.amount)
  })

  return { total, items }
}

export async function getAuthorSuperChatTypes(
  authorId: string,
) {
  'use cache'
  cacheLife('minutes')

  verifyId(authorId)

  const query = `
SELECT type,
  COUNT(*) AS count
FROM youtube_chat_action
WHERE author_channel_id = $1
GROUP BY type
ORDER BY type
  `

  const { rows: items } = await pool.query(query, [authorId])
  items.forEach(item => {
    item.count = NumberUtil.parse(item.count)
  })

  return { total: items.length, items }
}

export async function getAuthorSuperChatColors(
  authorId: string,
) {
  'use cache'
  cacheLife('minutes')

  verifyId(authorId)

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

  const { rows: items } = await pool.query(query, [authorId])
  items.forEach(item => {
    item.count = NumberUtil.parse(item.count)
  })

  return { total: items.length, items }
}

export async function getAuthorBaseChats(
  authorId: string,
  opts: IPagination,
) {
  'use cache'
  cacheLife('minutes')

  verifyId(authorId)

  const types = [
    'addChatItemAction',
    // 'addSuperChatItemAction',
  ]

  const createChatQueryBuilder = (tableName: string) => db.createQueryBuilder()
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
    .addSelect('membership')
    .from(tableName, 'yca')
    .andWhere('author_channel_id = :authorId', { authorId })
    .andWhere('type IN (:...types)', { types })

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
    .select('yca.*')
    .addSelect('yv.title', 'video_title')
    .addSelect('yc.id', 'channel_id')
    .addSelect('yc.custom_url', 'channel_custom_url')
    .addSelect('yc.name', 'channel_name')
    .addSelect('yc.thumbnail_url', 'channel_thumbnail_url')
    .addSelect('tt.*')
    .from('yca', 'yca')
    .leftJoin('youtube_video', 'yv', 'yv.id = yca.video_id')
    .leftJoin('youtube_channel', 'yc', 'yc.id = yv.channel_id')
    .leftJoin('total', 'tt', 'TRUE')
    .addOrderBy('yca."created_at"', 'DESC')
    .limit(opts.limit)
    .offset(opts.offset)

  const { rows: items } = await pool.query(...queryItem.getQueryAndParameters())
  let total = 0

  items.forEach((item) => {
    item.created_at = NumberUtil.parse(item.created_at)
    total = total || Number(item._total)
    delete item._total
  })

  return { total, items }
}
