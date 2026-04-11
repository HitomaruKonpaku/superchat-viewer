import { Anchor, Menu } from '@mantine/core'
import { IconBrandYoutube } from '@tabler/icons-react'
import { VideoUtil } from '../../src/util/video.util'

interface IProps {
  id: string
  label?: string
}

export default function MenuItemYoutubeVideo(props: IProps) {
  return (
    <Anchor
      href={VideoUtil.toUrl(props.id)}
      target='_blank'
      underline='never'
    >
      <Menu.Item leftSection={<IconBrandYoutube size={14} />}>
        {props.label || 'Open video'}
      </Menu.Item>
    </Anchor>
  )
}
