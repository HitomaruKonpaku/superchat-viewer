import { Tooltip } from '@mantine/core'
import { IconStarFilled } from '@tabler/icons-react'

export function IconMembersOnly(props: { value: boolean, size?: number }) {
  return (
    <>
      {
        props.value &&
        <Tooltip label="Members-only">
          <IconStarFilled size={props.size} color="lime" />
        </Tooltip>
      }
    </>
  )
}
