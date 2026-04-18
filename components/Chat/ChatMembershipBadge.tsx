import { Tooltip } from '@mantine/core'
import { Membership } from '../../src/interface/membership.interface'
import { BadgeImage } from '../Image/BadgeImage'

interface IProps {
  membership: Membership
}

export function ChatMembershipBadge({ membership }: IProps) {
  return (
    membership
    &&
    <>
      <Tooltip
        label={membership.since || membership.status}
      >
        <BadgeImage
          src={membership.thumbnail}
          alt='membership_thumbnail'
          w={24}
          h={24}
        />
      </Tooltip>
    </>
  )
}
