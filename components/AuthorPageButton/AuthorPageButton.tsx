'use client'

import { ActionIcon, Anchor, Tooltip } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'

export function AuthorPageButton({ id }: { id: string }) {
  return (
    id
    &&
    <Anchor
      href={`/author/${id}`}
      target='_blank'
    >
      <Tooltip label='Show author'>
        <ActionIcon
          variant='light'
          size='xl'
          radius='xl'
          aria-label='Show author'
        >
          <IconUser
            style={{ width: '65%', height: '65%' }}
            stroke={1.5}
          />
        </ActionIcon>
      </Tooltip>
    </Anchor>
  )
}
