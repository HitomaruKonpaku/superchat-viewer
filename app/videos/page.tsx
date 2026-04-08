'use client'

import { Anchor, Center, Group, Image, Menu, Stack, Table, Text, Tooltip } from '@mantine/core'
import ms from 'ms'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BackButton } from '../../components/BackButton/BackButton'
import { DateTimeText } from '../../components/DateTimeText/DateTimeText'
import { IconBoolean } from '../../components/icon/IconBoolean'
import { IconMembersOnly } from '../../components/icon/IconMembersOnly'
import MenuItemAppSuperChat from '../../components/menu-item/MenuItemAppSuperChat'
import MenuItemCopy from '../../components/menu-item/MenuItemCopy'
import MenuItemHolodexVideo from '../../components/menu-item/MenuItemHolodexVideo'
import MenuItemYoutubeVideo from '../../components/menu-item/MenuItemYoutubeVideo'
import PaginationTable from '../../components/PaginationTable/PaginationTable'
import { PrivacyStatusText } from '../../components/PrivacyStatusText/PrivacyStatusText'
import { YoutubeChannelButton } from '../../components/YoutubeChannelButton/YoutubeChannelButton'
import { api } from '../../src/api'
import { VideoUtil } from '../../src/util/video.util'

export default function VideoListPage() {
  const pollInterval = ms('30s')
  const searchParams = useSearchParams()
  const channel_id = searchParams.get('channel_id')
  const [backUrl] = useState('/channels')
  const [channel, setChannel] = useState<any>(null)
  const [limit] = useState(channel_id ? 50 : 20)

  useEffect(() => {
    initData()
  }, [])

  async function initData() {
    if (!channel_id) {
      return
    }

    const url = `channels/${channel_id}`
    try {
      const { data } = await api.get(url)
      setChannel(data)
    } catch (error) {
      // ignore
    }
  }

  function toRow(element: Record<string, any>, index: number, limit: number, page: number) {
    return (
      <Table.Tr key={element.id}>
        <Table.Td ta="right">
          <Text size="sm">{(index + 1) + (limit * (page - 1))}</Text>
        </Table.Td>

        <Table.Td p={0}>
          <Anchor href={`/superchat/${element.id}`} h="100%">
            <Center>
              <Image
                src={VideoUtil.toThumbnailMq(element.id)}
                referrerPolicy="no-referrer"
                radius="sm"
                maw={320}
                mah={180}
              />
            </Center>
          </Anchor>
        </Table.Td>

        <Table.Td>
          <Menu position="bottom-start">
            <Menu.Target>
              <Stack gap={4}>
                <Anchor underline="never">
                  <Text size="sm" ta="justify">{element.id}</Text>
                </Anchor>
                <Anchor underline="never">
                  <Text size="sm" ta="justify">{element.title}</Text>
                </Anchor>
                <Group>
                  <IconBoolean value={element.is_active} size={16} />
                  <IconMembersOnly value={element.is_members_only} size={16} />
                  {element.is_active && <PrivacyStatusText value={element.privacy_status} />}
                </Group>
              </Stack>
            </Menu.Target>

            <Menu.Dropdown>
              <MenuItemYoutubeVideo id={element.id} />
              <MenuItemHolodexVideo id={element.id} />
              <Menu.Divider />
              <MenuItemAppSuperChat id={element.id} />
              <Menu.Divider />
              <MenuItemCopy value={element.id} label="Copy ID" />
              <MenuItemCopy value={element.title} label="Copy title" />
            </Menu.Dropdown>
          </Menu>

          <DateTimeText
            value={element.created_at}
            size="sm"
            menuPosition="bottom-start"
          />
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <>
      <Group gap="sm" ml={16} mt={8}>
        <BackButton url={backUrl} />
        {
          channel_id &&
          <>
            <YoutubeChannelButton id={channel_id} />
            <Tooltip label={channel?.description} disabled={!channel?.description} multiline>
              <Text>{channel?.name}</Text>
            </Tooltip>
          </>}
      </Group>

      <PaginationTable
        apiPath="videos"
        apiParams={{ channel_id }}
        limit={limit}
        pollInterval={pollInterval}
        search
        thead={
          <Table.Tr>
            <Table.Th w={0} ta="center">#</Table.Th>
            <Table.Th w={120} />
            <Table.Th />
          </Table.Tr>
        }
        toRow={toRow}
      />
    </>
  )
}
