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
    .from('youtube_chat_emoji', 'yce')

  if (channelIds.length) {
    query.andWhere('channel_id IN (:...channelIds)', { channelIds })
  }

  const { rows: items } = await pool.query(...query.getQueryAndParameters())
  return { total: items.length, items }
}

export async function getChannelEmojis(channelIds: string[]) {
  'use cache'
  cacheLife('minutes')

  const query = db.createQueryBuilder()
    .select('channel_id')
    .addSelect(`
      json_agg(
        json_build_object(
          'id', id,
          'shortcuts', shortcuts,
          'thumbnails', image -> 'thumbnails'
        )
      )
      `, 'emojis')
    .from('youtube_chat_emoji', 'yce')
    .groupBy('channel_id')

  if (channelIds.length) {
    query.andWhere('channel_id IN (:...channelIds)', { channelIds })
  }

  const { rows: items } = await pool.query(...query.getQueryAndParameters())
  return { total: items.length, items }
}
