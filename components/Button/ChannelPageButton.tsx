'use client'

import { ActionIcon, Anchor, Tooltip } from '@mantine/core'
import { IconVideo } from '@tabler/icons-react'

export function ChannelPageButton({ id }: { id: string }) {
  return (
    id
    &&
    <Anchor
      href={`/channel/${id}`}
      target='_blank'
    >
      <Tooltip label='Show channel'>
        <ActionIcon
          variant='light'
          size='xl'
          radius='xl'
          aria-label='Show channel'
        >
          <IconVideo
            style={{ width: '65%', height: '65%' }}
            stroke={1.5}
          />
        </ActionIcon>
      </Tooltip>
    </Anchor>
  )
}
