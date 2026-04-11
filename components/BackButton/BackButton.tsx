'use client'

import { ActionIcon, Tooltip } from '@mantine/core'
import { IconArrowBack } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

export function BackButton({ url, defaultUrl }: { url?: string, defaultUrl?: string }) {
  const router = useRouter()

  function onClick() {
    if (url) {
      router.push(url)
      return
    }

    const tmp = history.back() as undefined
    if (!tmp && defaultUrl) {
      router.push(defaultUrl)
    }
  }

  return (
    <Tooltip label='Back'>
      <ActionIcon variant='light' size='xl' radius='xl' aria-label='Back' onClick={onClick}>
        <IconArrowBack style={{ width: '70%', height: '70%' }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )
}
