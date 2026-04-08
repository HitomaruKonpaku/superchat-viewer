import { Anchor, Menu } from '@mantine/core'
import { HolodexUtil } from '../../src/util/holodex.util'
import { IconHolodex } from '../icon/IconHolodex'

interface IProps {
  id: string
  label?: string
}

export default function MenuItemHolodexVideo(props: IProps) {
  return (
    <Anchor
      href={HolodexUtil.toVideoUrl(props.id)}
      target="_blank"
      underline="never"
    >
      <Menu.Item leftSection={<IconHolodex size={14} />}>
        {props.label || 'Open Holodex'}
      </Menu.Item>
    </Anchor>
  )
}
