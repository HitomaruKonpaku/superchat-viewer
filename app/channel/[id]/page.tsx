'use client'

import { Anchor, Center, Group, Menu, Stack, Table, Text, Tooltip } from '@mantine/core'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthorPageButton } from '../../../components/Button/AuthorPageButton'
import { BackButton } from '../../../components/Button/BackButton'
import { YoutubeChannelButton } from '../../../components/Button/YoutubeChannelButton'
import { DateTimeText } from '../../../components/DateTimeText/DateTimeText'
import { IconBoolean } from '../../../components/icon/IconBoolean'
import { IconMembersOnly } from '../../../components/icon/IconMembersOnly'
import { VideoImage } from '../../../components/Image/VideoImage'
import MenuItemAppSuperChat from '../../../components/menu-item/MenuItemAppSuperChat'
import MenuItemCopy from '../../../components/menu-item/MenuItemCopy'
import MenuItemHolodexVideo from '../../../components/menu-item/MenuItemHolodexVideo'
import MenuItemYoutubeVideo from '../../../components/menu-item/MenuItemYoutubeVideo'
import PaginationTable from '../../../components/PaginationTable/PaginationTable'
import { PrivacyStatusText } from '../../../components/PrivacyStatusText/PrivacyStatusText'
import { api } from '../../../src/api'
import { cfg } from '../../../src/cfg'
import { VideoUtil } from '../../../src/util/video.util'

export default function ChannelPage() {
  const [pollInterval] = useState(cfg.video.pollInterval)
  const id = useParams().id?.toString() as string
  const [backUrl] = useState('/channels')
  const [channel, setChannel] = useState<any>(null)
  const [limit] = useState(id ? cfg.video.limit : 20)

  useEffect(() => {
    initData()
  }, [])

  async function initData() {
    if (!id) {
      return
    }

    const url = `channels/${id}`
    try {
      const { data } = await api.get(url)
      document.title = data.name
      setChannel(data)
    } catch (error: any) {
      console.warn(error.message)
    }
  }

  function toRow(element: Record<string, any>, index: number, limit: number, page: number) {
    return (
      <Table.Tr key={element.id}>
        <Table.Td ta='right'>
          <Text size='sm'>{(index + 1) + (limit * (page - 1))}</Text>
        </Table.Td>

        <Table.Td p={0}>
          <Anchor href={`/video/${element.id}`} h='100%'>
            <Center>
              <VideoImage
                src={VideoUtil.toThumbnailMq(element.id)}
              />
            </Center>
          </Anchor>
        </Table.Td>

        <Table.Td>
          <Menu position='bottom-start'>
            <Menu.Target>
              <Stack gap={4}>
                <Anchor underline='never'>
                  <Text size='sm' ta='justify'>{element.id}</Text>
                </Anchor>
                <Anchor underline='never'>
                  <Text size='sm' ta='justify'>{element.title}</Text>
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
              <MenuItemCopy value={element.id} label='Copy ID' />
              <MenuItemCopy value={element.title} label='Copy title' />
            </Menu.Dropdown>
          </Menu>

          <DateTimeText
            value={element.created_at}
            size='sm'
            menuPosition='bottom-start'
          />
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <>
      <Group gap={8}>
        <BackButton url={backUrl} />
        {
          id &&
          <>
            <AuthorPageButton id={id} />
            <YoutubeChannelButton id={id} />
            <Tooltip label={channel?.description} disabled={!channel?.description} multiline>
              <Text>{channel?.name}</Text>
            </Tooltip>
          </>}
      </Group>

      <PaginationTable
        apiPath='videos'
        apiParams={{ channel_id: id }}
        limit={limit}
        pollInterval={pollInterval}
        search
        thead={
          <Table.Tr>
            <Table.Th w={0} ta='center'>#</Table.Th>
            <Table.Th w={{ base: 100, sm: 120, md: 160 }} />
            <Table.Th />
          </Table.Tr>
        }
        toRow={toRow}
      />
    </>
  )
}
