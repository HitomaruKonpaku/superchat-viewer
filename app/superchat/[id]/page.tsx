'use client'

import { Anchor, Divider, Group, Image, Menu, Stack, Table, Text, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconStarFilled } from '@tabler/icons-react'
import ms from 'ms'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { BackButton } from '../../../components/BackButton/BackButton'
import { ChatActionRenderer } from '../../../components/ChatAction/ChatActionRenderer'
import { ChatActionTypeSelector } from '../../../components/ChatAction/ChatActionTypeSelector'
import { ChatColorSelector } from '../../../components/ChatColor/ChatColorSelector'
import { DateTimeText } from '../../../components/DateTimeText/DateTimeText'
import MenuItemAppAuthorChat from '../../../components/menu-item/MenuItemAppAuthorChat'
import MenuItemAppVideo from '../../../components/menu-item/MenuItemAppChannel'
import MenuItemCopy from '../../../components/menu-item/MenuItemCopy'
import MenuItemHolodexChannel from '../../../components/menu-item/MenuItemHolodexChannel'
import MenuItemYoutubeChannel from '../../../components/menu-item/MenuItemYoutubeChannel'
import PaginationTable from '../../../components/PaginationTable/PaginationTable'
import { YoutubeVideoButton } from '../../../components/YoutubeVideoButton/YoutubeVideoButton'
import { api } from '../../../src/api'
import { SuperChatUtil } from '../../../src/util/superchat.util'

export default function SuperChatPage() {
  const [pollInterval, setPollInterval] = useState(ms('30s'))
  const id = useParams().id?.toString() as string
  const [backUrl, setBackUrl] = useState('/channels')
  const [video, setVideo] = useState<any>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: SuperChatUtil.getInitialValues(searchParams.get('types')),
    transformValues: SuperChatUtil.getTransformValues,
  })

  const updateSearchParams = useCallback(
    (newParams: { [key: string]: string | null }) => {
      const curParams = new URLSearchParams(searchParams.toString())
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key]
        curParams.delete(key)
        if (value) {
          curParams.set(key, value)
        }
      })
      return curParams.toString()
    },
    [searchParams]
  )

  const updateParams = (params: Record<string, any>) => {
    const qs = updateSearchParams(params)
    const href = `${pathname}?${qs}`
    router.push(href)
  }

  useEffect(() => {
    initData()
  }, [])

  useEffect(() => {
    const types = SuperChatUtil.getTypesParam(form.values)
    updateParams({ types })
  }, [form.values])

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
    } catch (error: any) {
      console.warn(error.message)
    }
  }

  function toRow(element: Record<string, any>, index: number, limit: number, page: number) {
    return (
      <Table.Tr key={element.id}>
        <Table.Td ta="right">
          <Text size="sm">{(index + 1) + (limit * (page - 1))}</Text>
        </Table.Td>

        <Table.Td >
          <Stack gap={2}>
            <Group gap={8}>
              {
                element.author_photo &&
                <Image
                  src={element.author_photo}
                  referrerPolicy="no-referrer"
                  radius="sm"
                  w={40}
                  h={40}
                />
              }

              <Stack gap={2} flex={1}>
                <Menu position="bottom-start">
                  <Menu.Target>
                    <Anchor underline="never">
                      <Text ta="justify">{element.author_name}</Text>
                    </Anchor>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <MenuItemYoutubeChannel id={element.author_channel_id} />
                    <MenuItemHolodexChannel id={element.author_channel_id} />
                    <Menu.Divider />
                    <MenuItemAppVideo id={element.author_channel_id} />
                    <MenuItemAppAuthorChat id={element.author_channel_id} />
                    <Menu.Divider />
                    <MenuItemCopy value={element.author_channel_id} label="Copy ID" />
                    <MenuItemCopy value={element.author_name} label="Copy name" />
                  </Menu.Dropdown>
                </Menu>

                <DateTimeText
                  value={element.created_at}
                  size="sm"
                  menuPosition="bottom-start"
                />
              </Stack>
            </Group>

            <Divider my={4} />
            <ChatActionRenderer value={element} />
          </Stack>
        </Table.Td>
      </Table.Tr >
    )
  }

  return (
    <>
      <Group gap="sm" ml={8} mt={8}>
        <BackButton url={backUrl} />
        <YoutubeVideoButton id={id} />
        {video?.is_members_only && <Tooltip label="Members only"><IconStarFilled color="lime" size={16} /></Tooltip>}
        <Tooltip label={video?.description} disabled={!video?.description} multiline>
          <Text>{video?.title}</Text>
        </Tooltip>
      </Group>

      <ChatActionTypeSelector
        form={form}
        apiPath={`superchats/${id}/stats/types`}
        pollInterval={pollInterval}
      />

      <ChatColorSelector
        apiPath={`superchats/${id}/stats/colors`}
        pollInterval={pollInterval}
      />

      <PaginationTable
        apiPath={`superchats/${id}`}
        apiParams={{ types: form.getTransformedValues() }}
        limit={500}
        pollInterval={pollInterval}
        thead={
          <Table.Tr>
            <Table.Th w={0} ta="center">#</Table.Th>
            <Table.Th />
          </Table.Tr>
        }
        toRow={toRow}
      />
    </>
  )
}
