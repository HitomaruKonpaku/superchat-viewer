import { Anchor, Menu } from '@mantine/core'
import { IconBrandYoutube } from '@tabler/icons-react'
import { ChannelUtil } from '../../src/util/channel.util'

interface IProps {
  id: string
  label?: string
}

export default function MenuItemYoutubeChannel(props: IProps) {
  return (
    <Anchor
      href={ChannelUtil.toUrl(props.id)}
      target="_blank"
      underline="never"
    >
      <Menu.Item leftSection={<IconBrandYoutube size={14} />}>
        {props.label || 'Open channel'}
      </Menu.Item>
    </Anchor>
  )
}
