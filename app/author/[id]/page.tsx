'use client'

import { Anchor, Divider, Group, Image, Menu, Stack, Table, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { BackButton } from '../../../components/BackButton/BackButton'
import { ChatActionRenderer } from '../../../components/ChatAction/ChatActionRenderer'
import { ChatActionTypeSelector } from '../../../components/ChatAction/ChatActionTypeSelector'
import { ChatColorSelector } from '../../../components/ChatColor/ChatColorSelector'
import { DateTimeText } from '../../../components/DateTimeText/DateTimeText'
import MenuItemAppAuthorChat from '../../../components/menu-item/MenuItemAppAuthorChat'
import MenuItemAppVideo from '../../../components/menu-item/MenuItemAppChannel'
import MenuItemAppSuperChat from '../../../components/menu-item/MenuItemAppSuperChat'
import MenuItemCopy from '../../../components/menu-item/MenuItemCopy'
import MenuItemHolodexChannel from '../../../components/menu-item/MenuItemHolodexChannel'
import MenuItemHolodexVideo from '../../../components/menu-item/MenuItemHolodexVideo'
import MenuItemYoutubeChannel from '../../../components/menu-item/MenuItemYoutubeChannel'
import MenuItemYoutubeVideo from '../../../components/menu-item/MenuItemYoutubeVideo'
import PaginationTable from '../../../components/PaginationTable/PaginationTable'
import { YoutubeChannelButton } from '../../../components/YoutubeChannelButton/YoutubeChannelButton'
import { api } from '../../../src/api'
import { SuperChatUtil } from '../../../src/util/superchat.util'

export default function AuthorPage() {
  const [backUrl] = useState('/channels')
  const id = useParams().id?.toString() as string
  const [author, setAuthor] = useState<any>(null)


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
    if (!id) {
      return
    }

    const url = `authors/${id}`
    try {
      const { data } = await api.get(url)
      document.title = data.name
      setAuthor(data)
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

        <Table.Td >
          <Stack gap={2}>
            <Group gap={8}>
              {
                element.channel_thumbnail_url &&
                <Image
                  src={element.channel_thumbnail_url}
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
                      <Text ta="justify">{element.channel_custom_url || element.channel_id}</Text>
                    </Anchor>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <MenuItemYoutubeChannel id={element.channel_id} />
                    <MenuItemHolodexChannel id={element.channel_id} />
                    <Menu.Divider />
                    <MenuItemAppVideo id={element.channel_id} />
                    <MenuItemAppAuthorChat id={element.channel_id} />
                    <Menu.Divider />
                    <MenuItemCopy value={element.channel_id} label="Copy ID" />
                    {element.channel_custom_url && <MenuItemCopy value={element.channel_custom_url} label="Copy handle" />}
                    <MenuItemCopy value={element.channel_name} label="Copy name" />
                  </Menu.Dropdown>
                </Menu>

                <Menu position="bottom-start">
                  <Menu.Target>
                    <Anchor underline="never">
                      <Text ta="justify">{element.video_title}</Text>
                    </Anchor>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <MenuItemYoutubeVideo id={element.video_id} />
                    <MenuItemHolodexVideo id={element.video_id} />
                    <Menu.Divider />
                    <MenuItemAppSuperChat id={element.video_id} />
                    <Menu.Divider />
                    <MenuItemCopy value={element.video_id} label="Copy ID" />
                    <MenuItemCopy value={element.video_title} label="Copy title" />
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
      </Table.Tr>
    )
  }

  return (
    <>
      <Group gap="sm" ml={8} mt={8}>
        <BackButton url={backUrl} />
        <YoutubeChannelButton id={id} />
        <Text>{author?.name}</Text>
      </Group>

      <ChatActionTypeSelector form={form} />

      <ChatColorSelector
        apiPath={`authors/${id}/colors`}
      />

      <PaginationTable
        apiPath={`authors/${id}/chats`}
        apiParams={{ types: form.getTransformedValues() }}
        limit={100}
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
