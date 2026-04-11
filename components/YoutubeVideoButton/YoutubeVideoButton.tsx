'use client'

import { ActionIcon, Anchor, Tooltip } from '@mantine/core'
import { IconBrandYoutube } from '@tabler/icons-react'
import { VideoUtil } from '../../src/util/video.util'

export function YoutubeVideoButton({ id }: { id: string }) {
  return (
    id
    &&
    <Anchor href={VideoUtil.toUrl(id)} target='_blank'>
      <Tooltip label='Open video'>
        <ActionIcon variant='light' size='xl' radius='xl' aria-label='Open'>
          <IconBrandYoutube style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Anchor>
  )
}
