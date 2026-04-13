import { Anchor, Menu } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'

interface IProps {
  id: string
  label?: string
}

export default function MenuItemAppAuthorChat(props: IProps) {
  return (
    <Anchor
      href={`/author/${props.id}`}
      target='_blank'
      underline='never'
    >
      <Menu.Item leftSection={<IconUser size={14} />}>
        {props.label || 'Show author'}
      </Menu.Item>
    </Anchor>
  )
}
