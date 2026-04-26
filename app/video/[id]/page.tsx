'use client'

import { Anchor, Divider, Flex, Group, Menu, Stack, Table, Text, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconStarFilled } from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { BackButton } from '../../../components/Button/BackButton'
import { YoutubeVideoButton } from '../../../components/Button/YoutubeVideoButton'
import { ChatActionRenderer } from '../../../components/Chat/ChatActionRenderer'
import { ChatMembershipBadge } from '../../../components/Chat/ChatMembershipBadge'
import { SuperChatRenderer } from '../../../components/Chat/ChatRenderer/SuperChatRenderer'
import { DateTimeText } from '../../../components/DateTimeText/DateTimeText'
import { BaseImage } from '../../../components/Image/BaseImage'
import { ChannelImage } from '../../../components/Image/ChannelImage'
import MenuItemAppAuthorChat from '../../../components/menu-item/MenuItemAppAuthorChat'
import MenuItemAppVideo from '../../../components/menu-item/MenuItemAppChannel'
import MenuItemCopy from '../../../components/menu-item/MenuItemCopy'
import MenuItemHolodexChannel from '../../../components/menu-item/MenuItemHolodexChannel'
import MenuItemYoutubeChannel from '../../../components/menu-item/MenuItemYoutubeChannel'
import { api } from '../../../src/api'
import { cfg } from '../../../src/cfg'
import { EMOJI_DEFAULT_CHANNELS } from '../../../src/constant/emoji.constant'
import { ChannelEmojiContext } from '../../../src/provider/channel-emoji.provider'
import { ConfigContext } from '../../../src/provider/config.provider'
import { SearchParamsContext } from '../../../src/provider/search-params.provider'
import { BitUtil } from '../../../src/util/bit.util'
import { SuperChatUtil } from '../../../src/util/superchat.util'

export default function VideoPage() {
  const { sus } = useContext(ConfigContext)
  const { searchParams, applyParams } = useContext(SearchParamsContext)
  const { addItems } = useContext(ChannelEmojiContext)

  const [backUrl, setBackUrl] = useState('/channels')
  const [pollInterval, setPollInterval] = useState(cfg.video.schat.pollInterval)
  const id = useParams().id?.toString() as string
  const [video, setVideo] = useState<any>(null)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: SuperChatUtil.getInitialValues(searchParams.get('types')),
    transformValues: SuperChatUtil.getTransformValues,
    onValuesChange: (value) => {
      const types = SuperChatUtil.getTypesParam(BitUtil.fromBoolsToNumber(value.types.map(v => v.checked).reverse()))
      applyParams({ types, p: null })
    },
  })

  //#region data

  useEffect(() => {
    async function load() {
      const res = await initData()
      if (res?.channel_id) {
        await initEmojis(res.channel_id)
      }
    }

    load()
  }, [id])

  async function initData() {
    const url = `videos/${id}`
    try {
      const { data } = await api.get(url)
      document.title = data.title
      setVideo(data)
      setBackUrl(`/channel/${data.channel_id}`)
      if (data.actual_end) {
        setPollInterval(0)
      }
      return data
    } catch (error: any) {
      console.warn(error.message)
    }
  }

  async function initEmojis(channelId: string) {
    if (!channelId) {
      return
    }

    const url = 'channel-emojis'
    try {
      const { data } = await api.get(url, {
        params: {
          channel_id: [channelId, ...EMOJI_DEFAULT_CHANNELS].join(','),
        },
      })
      addItems(data.items)
    } catch (error: any) {
      console.warn(error.message)
    }
  }

  //#endregion

  function toRow(element: Record<string, any>, index: number, limit: number, page: number) {
    return (
      <Table.Tr key={element.id}>
        <Table.Td ta='right'>
          <Menu trigger='click-hover'>
            <Menu.Target>
              <Text size='sm'>{(index + 1) + (limit * (page - 1))}</Text>
            </Menu.Target>

            <Menu.Dropdown>
              <MenuItemCopy value={element.id} label='Copy ID' />
            </Menu.Dropdown>
          </Menu>
        </Table.Td>

        <Table.Td>
          <Stack gap={2}>
            <Group gap={8}>
              {
                element.author_photo &&
                <ChannelImage src={element.author_photo} />
              }

              <Stack gap={2} flex={1}>
                <Flex gap={6}>
                  <ChatMembershipBadge membership={element.membership} />

                  <Menu position='bottom-start'>
                    <Menu.Target>
                      <Anchor underline='never'>
                        <Text ta='justify'>{element.author_name}</Text>
                      </Anchor>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <MenuItemYoutubeChannel id={element.author_channel_id} />
                      <MenuItemHolodexChannel id={element.author_channel_id} />
                      <Menu.Divider />
                      <MenuItemAppVideo id={element.author_channel_id} />
                      <MenuItemAppAuthorChat id={element.author_channel_id} />
                      <Menu.Divider />
                      <MenuItemCopy value={element.author_channel_id} label='Copy ID' />
                      <MenuItemCopy value={element.author_name} label='Copy name' />
                    </Menu.Dropdown>
                  </Menu>
                </Flex>

                <DateTimeText
                  value={element.created_at}
                  size='sm'
                  menuPosition='bottom-start'
                />
              </Stack>
            </Group>

            <Divider my={4} />

            <ChatActionRenderer
              value={element}
              channelId={video?.channel_id}
            />
          </Stack>
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <>
      <Group gap={8} mx={8} mt={8}>
        <BackButton url={backUrl} />
        <YoutubeVideoButton id={id} />
        {video?.is_members_only && <Tooltip label='Members only'><IconStarFilled color='lime' size={16} /></Tooltip>}
        <Tooltip label={video?.description} disabled={!video?.description} multiline>
          <Text>{video?.title}</Text>
        </Tooltip>

        {
          sus &&
          <Flex
            flex={1}
            justify='end'
          >
            <Anchor
              href={`/video/${id}/msg`}
              underline='never'
            >
              <BaseImage
                src={'/img/poyoyo-sus.png'}
                w={32}
                h={32}
              >
              </BaseImage>
            </Anchor>
          </Flex>
        }
      </Group>

      <SuperChatRenderer
        listApiPath={`videos/${id}/schats`}
        listApiParams={{ ...form.getTransformedValues() }}
        statsTypesApiPath={`videos/${id}/stats/types`}
        statsColorsApiPath={`videos/${id}/stats/colors`}
        form={form}
        limit={cfg.video.schat.limit}
        pollInterval={pollInterval}
        toRow={toRow}
      >
      </SuperChatRenderer>
    </>
  )
}
