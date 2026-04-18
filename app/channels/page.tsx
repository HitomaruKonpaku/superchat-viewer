'use client'

import { Anchor, Center, Group, Menu, Stack, Table, Text } from '@mantine/core'
import { useState } from 'react'
import { DateTimeText } from '../../components/DateTimeText/DateTimeText'
import { ChannelImage } from '../../components/Image/ChannelImage'
import PaginationTable from '../../components/PaginationTable/PaginationTable'
import { IconBoolean } from '../../components/icon/IconBoolean'
import MenuItemAppAuthorChat from '../../components/menu-item/MenuItemAppAuthorChat'
import MenuItemAppChannel from '../../components/menu-item/MenuItemAppChannel'
import MenuItemCopy from '../../components/menu-item/MenuItemCopy'
import MenuItemHolodexChannel from '../../components/menu-item/MenuItemHolodexChannel'
import MenuItemYoutubeChannel from '../../components/menu-item/MenuItemYoutubeChannel'
import { cfg } from '../../src/cfg'

export default function ChannelListPage() {
  const [pollInterval] = useState(cfg.channel.pollInterval)

  function toRow(element: Record<string, any>, index: number, limit: number, page: number) {
    return (
      <Table.Tr key={element.id}>
        <Table.Td ta='right'>
          <Text size='sm'>{(index + 1) + (limit * (page - 1))}</Text>
        </Table.Td>

        <Table.Td p={0}>
          <Anchor href={`/channel/${element.id}`}>
            <Center>
              <ChannelImage
                src={element.thumbnail_url}
                w={100}
                h={100}
              />
            </Center>
          </Anchor>
        </Table.Td>

        <Table.Td>
          <Stack gap={4}>
            <Menu position='bottom-start'>
              <Menu.Target>
                <Stack gap={4}>
                  <Anchor underline='never'>
                    <Text size='sm' ta='justify'>{element.id}</Text>
                  </Anchor>
                  {
                    element.custom_url &&
                    <Anchor underline='never'>
                      <Text size='sm' ta='justify'>{element.custom_url}</Text>
                    </Anchor>
                  }
                  <Anchor underline='never'>
                    <Text size='sm' ta='justify'>{element.name}</Text>
                  </Anchor>
                </Stack>
              </Menu.Target>

              <Menu.Dropdown>
                <MenuItemYoutubeChannel id={element.id} />
                <MenuItemHolodexChannel id={element.id} />
                <Menu.Divider />
                <MenuItemAppChannel id={element.id} />
                <MenuItemAppAuthorChat id={element.id} />
                <Menu.Divider />
                <MenuItemCopy value={element.id} label='Copy ID' />
                {element.custom_url && <MenuItemCopy value={element.custom_url} label='Copy handle' />}
                <MenuItemCopy value={element.name} label='Copy name' />
              </Menu.Dropdown>
            </Menu>

            <Menu position='bottom-start'>
              <Menu.Target>
                <Group>
                  <IconBoolean value={element.is_active} size={16} nullable />
                  <IconBoolean value={element.has_membership} size={16} nullable />
                  <Text size='sm' ta='right' w={40}>{element.video_count}</Text>
                </Group>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item rightSection={<IconBoolean value={element.is_active} size={16} nullable />}>
                  <Text>Active:</Text>
                </Menu.Item>
                <Menu.Item rightSection={<IconBoolean value={element.has_membership} size={16} nullable />}>
                  <Text>Member:</Text>
                </Menu.Item>
                <Menu.Item rightSection={element.video_count}>
                  <Text>Video:</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <DateTimeText
              value={element.created_at}
              size='sm'
              menuPosition='bottom-start'
            />
          </Stack>
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <>
      <PaginationTable
        apiPath='channels'
        limit={cfg.channel.limit}
        pollInterval={pollInterval}
        search
        thead={
          <Table.Tr>
            <Table.Th w={0} ta='center'>#</Table.Th>
            <Table.Th w={100} />
            <Table.Th />
          </Table.Tr>
        }
        toRow={toRow}
      />
    </>
  )
}
