'use client'

import { ActionIcon, Anchor, Tooltip } from '@mantine/core'
import { IconBrandYoutube } from '@tabler/icons-react'
import { ChannelUtil } from '../../src/util/channel.util'

export function YoutubeChannelButton({ id }: { id: string }) {
  return (
    id
    &&
    <Anchor href={ChannelUtil.toUrl(id)} target="_blank">
      <Tooltip label="Open channel">
        <ActionIcon variant="light" size="xl" radius="xl" aria-label="Open">
          <IconBrandYoutube style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Anchor>
  )
}
