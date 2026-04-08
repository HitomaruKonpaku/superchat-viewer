'use client'

import { ActionIcon, Stack } from '@mantine/core'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'

export function Scroller() {
  function onClickTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onClickBottom() {
    window.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: 'smooth' })
  }

  return (
    <Stack gap="xs" pos="fixed" bottom={64} right={16} opacity={0.8} >
      <ActionIcon variant="light" size="xl" radius="xl" onClick={onClickTop}>
        <IconArrowUp />
      </ActionIcon>
      <ActionIcon variant="light" size="xl" radius="xl" onClick={onClickBottom}>
        <IconArrowDown />
      </ActionIcon>
    </Stack>
  )
}
