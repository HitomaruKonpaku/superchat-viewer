import { Menu } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { IconCopy } from '@tabler/icons-react'

interface IProps {
  value: string
  label?: string
}

export default function MenuItemCopy(props: IProps) {
  const clipboard = useClipboard({ timeout: 500 })

  return (
    <Menu.Item
      leftSection={<IconCopy size={14} />}
      onClick={() => clipboard.copy(props.value)}>
      {props.label}
    </Menu.Item>
  )
}
