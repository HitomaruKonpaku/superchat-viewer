import { Tooltip } from '@mantine/core'
import { IconBadge } from '@tabler/icons-react'
import { useState } from 'react'
import { Membership } from '../../src/interface/membership.interface'
import { BadgeImage } from '../Image/BadgeImage'

interface IProps {
  membership: Membership
}

export function ChatMembershipBadge({ membership }: IProps) {
  const [error, setError] = useState(false)

  const onFallbackError = () => {
    setError(true)
  }

  if (!membership) {
    return null
  }

  if (error) {
    return (
      <Tooltip
        label={membership.since || membership.status}
      >
        <IconBadge size={24} />
      </Tooltip>
    )
  }

  return (
    <Tooltip
      label={membership.since || membership.status}
    >
      <BadgeImage
        src={membership.thumbnail}
        alt='membership_thumbnail'
        w={24}
        h={24}
        onFallbackError={onFallbackError}
      />
    </Tooltip>
  )
}
