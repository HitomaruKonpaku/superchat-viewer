import { cacheLife } from 'next/cache'
import { pool } from '../db'
import { IPagination } from '../interface/pagination.interface'

export async function getGroups(opts: IPagination) {
  'use cache'
  cacheLife('minutes')

  const query = `
WITH ggc AS (
  SELECT g.id,
    g.name,
    g.full_name,
    g.en_name,
    g.thumbnail_url,
    g.sort AS group_sort,
    gc.channel_id,
    gc.sort AS channel_sort
  FROM "group" AS g
    LEFT JOIN group_channel AS gc ON gc.group_id = g.id
    AND gc.type = 'YOUTUBE'
)
SELECT ggc.name,
  ggc.full_name,
  ggc.en_name,
  ggc.thumbnail_url,
  COALESCE(
    json_agg(
      json_build_object(
        'id', yc.id,
        'is_active', up.is_active,
        'custom_url', yc.custom_url,
        'name', yc.name,
        'thumbnail_url', yc.thumbnail_url
      )
      ORDER BY ggc.channel_sort ASC NULLS LAST
    ) FILTER (
      WHERE ggc.channel_id IS NOT NULL
    ),
    '[]'::json
  ) AS channels
FROM ggc
  LEFT JOIN youtube_channel AS yc ON yc.id = ggc.channel_id
  LEFT JOIN user_pool AS up ON up.source_id = yc.id
GROUP BY ggc.id,
  ggc.name,
  ggc.full_name,
  ggc.en_name,
  ggc.thumbnail_url,
  ggc.group_sort
ORDER BY ggc.group_sort ASC NULLS LAST
  `

  const { rows: items } = await pool.query(query)
  return { total: items.length, items }
}
