'use client'

import { Anchor, Divider, Group, Image, Menu, Stack, Table, Tabs, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { BackButton } from '../../../components/BackButton/BackButton'
import { ChatActionRenderer } from '../../../components/ChatAction/ChatActionRenderer'
import { CommonChatRenderer } from '../../../components/ChatRenderer/CommonChatRenderer'
import { SuperChatRenderer } from '../../../components/ChatRenderer/SuperChatRenderer'
import { DateTimeText } from '../../../components/DateTimeText/DateTimeText'
import MenuItemAppAuthorChat from '../../../components/menu-item/MenuItemAppAuthorChat'
import MenuItemAppVideo from '../../../components/menu-item/MenuItemAppChannel'
import MenuItemAppSuperChat from '../../../components/menu-item/MenuItemAppSuperChat'
import MenuItemCopy from '../../../components/menu-item/MenuItemCopy'
import MenuItemHolodexChannel from '../../../components/menu-item/MenuItemHolodexChannel'
import MenuItemHolodexVideo from '../../../components/menu-item/MenuItemHolodexVideo'
import MenuItemYoutubeChannel from '../../../components/menu-item/MenuItemYoutubeChannel'
import MenuItemYoutubeVideo from '../../../components/menu-item/MenuItemYoutubeVideo'
import { YoutubeChannelButton } from '../../../components/YoutubeChannelButton/YoutubeChannelButton'
import { api } from '../../../src/api'
import { cfg } from '../../../src/cfg'
import { SearchParamsContext } from '../../../src/provider/search-params.provider'
import { SuperChatUtil } from '../../../src/util/superchat.util'

export default function AuthorPage() {
  const { searchParams, applyParams } = useContext(SearchParamsContext)

  const [backUrl] = useState('/channels')
  const [pollInterval] = useState(cfg.author.chat.pollInterval)
  const id = useParams().id?.toString() as string
  const [author, setAuthor] = useState<any>(null)

  const [defaultTab] = useState('sc')
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || defaultTab)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: SuperChatUtil.getInitialValues(searchParams.get('types')),
    transformValues: SuperChatUtil.getTransformValues,
    onValuesChange: (value) => {
      const newTypes = SuperChatUtil.getTypesParam(value)
      applyParams({ types: newTypes, p: null })
    },
  })

  //#region data

  useEffect(() => {
    initData()
  }, [])

  async function initData() {
    if (!id) {
      return
    }

    const url = `authors/${id}`
    try {
      const { data } = await api.get(url)
      document.title = data.name
      setAuthor(data)
    } catch (error: any) {
      console.warn(error.message)
    }
  }

  //#endregion

  //#region tab

  useEffect(() => {
    const tab = searchParams.get('tab')
    setActiveTab(tab || defaultTab)
  }, [searchParams.get('tab')])

  function getTabValue(value: string | null) {
    return value ?? defaultTab
  }

  function onTabChange(value: string | null) {
    const tab = getTabValue(value)
    applyParams({
      tab: tab !== defaultTab ? tab : null,
      types: null,
      p: null,
    })
  }

  //#endregion

  function toRow(element: Record<string, any>, index: number, limit: number, page: number) {
    return (
      <Table.Tr key={element.id}>
        <Table.Td ta='right'>
          <Text size='sm'>{(index + 1) + (limit * (page - 1))}</Text>
        </Table.Td>

        <Table.Td >
          <Stack gap={2}>
            <Group gap={8}>
              {
                element.channel_thumbnail_url &&
                <Image
                  src={element.channel_thumbnail_url}
                  referrerPolicy='no-referrer'
                  radius='sm'
                  w={40}
                  h={40}
                />
              }

              <Stack gap={2} flex={1}>
                <Menu position='bottom-start'>
                  <Menu.Target>
                    <Anchor underline='never'>
                      <Text ta='justify'>{element.channel_custom_url || element.channel_id}</Text>
                    </Anchor>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <MenuItemYoutubeChannel id={element.channel_id} />
                    <MenuItemHolodexChannel id={element.channel_id} />
                    <Menu.Divider />
                    <MenuItemAppVideo id={element.channel_id} />
                    <MenuItemAppAuthorChat id={element.channel_id} />
                    <Menu.Divider />
                    <MenuItemCopy value={element.channel_id} label='Copy ID' />
                    {element.channel_custom_url && <MenuItemCopy value={element.channel_custom_url} label='Copy handle' />}
                    <MenuItemCopy value={element.channel_name} label='Copy name' />
                  </Menu.Dropdown>
                </Menu>

                <Menu position='bottom-start'>
                  <Menu.Target>
                    <Anchor underline='never'>
                      <Text ta='justify'>{element.video_title}</Text>
                    </Anchor>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <MenuItemYoutubeVideo id={element.video_id} />
                    <MenuItemHolodexVideo id={element.video_id} />
                    <Menu.Divider />
                    <MenuItemAppSuperChat id={element.video_id} />
                    <Menu.Divider />
                    <MenuItemCopy value={element.video_id} label='Copy ID' />
                    <MenuItemCopy value={element.video_title} label='Copy title' />
                  </Menu.Dropdown>
                </Menu>

                <DateTimeText
                  value={element.created_at}
                  size='sm'
                  menuPosition='bottom-start'
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
      <Group gap='sm' ml={8} mt={8}>
        <BackButton url={backUrl} />
        <YoutubeChannelButton id={id} />
        <Text>{author?.name}</Text>
      </Group>

      <Tabs
        value={activeTab}
        variant='pills'
        onChange={onTabChange}
      >
        <Tabs.List ml={8} mb={16}>
          <Tabs.Tab value='sc'>
            SuperChat & Membership
          </Tabs.Tab>
          <Tabs.Tab value='msg'>
            Messages
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='sc'>
          <SuperChatRenderer
            listApiPath={`authors/${id}/schats`}
            listApiParams={{ types: form.getTransformedValues() }}
            statsTypesApiPath={`authors/${id}/stats/types`}
            statsColorsApiPath={`authors/${id}/stats/colors`}
            form={form}
            limit={cfg.author.chat.limit}
            pollInterval={pollInterval}
            toRow={toRow}
          >
          </SuperChatRenderer>
        </Tabs.Panel>

        <Tabs.Panel value='msg'>
          <CommonChatRenderer
            listApiPath={`authors/${id}/chats`}
            limit={cfg.author.chat.limit}
            pollInterval={pollInterval}
            toRow={toRow}
          >
          </CommonChatRenderer>
        </Tabs.Panel>
      </Tabs>
    </>
  )
}
