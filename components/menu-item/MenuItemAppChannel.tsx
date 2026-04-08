import { Anchor, Menu } from '@mantine/core'
import { IconVideo } from '@tabler/icons-react'

interface IProps {
  id: string
  label?: string
}

export default function MenuItemAppVideo(props: IProps) {
  return (
    <Anchor
      href={`/channel/${props.id}`}
      target="_blank"
      underline="never"
    >
      <Menu.Item leftSection={<IconVideo size={14} />}>
        {props.label || 'Show channel'}
      </Menu.Item>
    </Anchor>
  )
}
