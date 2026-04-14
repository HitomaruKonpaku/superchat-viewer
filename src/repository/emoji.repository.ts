import { cacheLife } from 'next/cache'
import { db, pool } from '../db'

export async function getEmojis(channelIds: string[]) {
  'use cache'
  cacheLife('minutes')

  const query = db.createQueryBuilder()
    .select('id')
    .addSelect('channel_id')
    .addSelect('shortcuts')
    // .addSelect('search_terms')
    // .addSelect(`image #>> '{accessibility,accessibilityData,label}'`, 'label')
    // eslint-disable-next-line quotes
    .addSelect(`image -> 'thumbnails'`, 'thumbnails')
    .from('youtube_chat_emoji', 'e')

  if (channelIds.length) {
    query.andWhere('channel_id IN (:...channelIds)', { channelIds })
  }

  const { rows: items } = await pool.query(...query.getQueryAndParameters())
  return { total: items.length, items }
}
