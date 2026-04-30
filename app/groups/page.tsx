'use client'

import { Accordion, ActionIcon, Anchor, Badge, Button, Card, Flex, Group, Menu, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { useScrollIntoView } from '@mantine/hooks'
import { IconDotsVertical, IconLayoutNavbarCollapse, IconLayoutNavbarExpand } from '@tabler/icons-react'
import React, { useEffect, useRef, useState } from 'react'
import { IconBoolean } from '../../components/icon/IconBoolean'
import { ChannelImage } from '../../components/Image/ChannelImage'
import MenuItemAppAuthorChat from '../../components/menu-item/MenuItemAppAuthorChat'
import MenuItemAppChannel from '../../components/menu-item/MenuItemAppChannel'
import MenuItemCopy from '../../components/menu-item/MenuItemCopy'
import MenuItemHolodexChannel from '../../components/menu-item/MenuItemHolodexChannel'
import MenuItemYoutubeChannel from '../../components/menu-item/MenuItemYoutubeChannel'
import { api } from '../../src/api'

export default function GroupListPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [values, setValues] = useState<string[]>([])
  const controlRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLButtonElement>({
    duration: 250,
    axis: 'y',
    offset: 48,
  })

  useEffect(() => {
    async function load() {
      await initData()
    }

    load()
  }, [])

  useEffect(() => {
    if (!targetRef.current) {
      return
    }

    setTimeout(() => {
      scrollIntoView({ alignment: 'start' })
    }, 300)
  }, [targetRef.current])

  async function initData() {
    const url = 'groups'
    try {
      const { data } = await api.get(url)
      setGroups(data.items)
      return data
    } catch (error: any) {
      console.warn(error.message)
    }
  }

  const allValues = groups.map((group) => group.name)
  const isAllExpanded = values.length > 0 && values.length === allValues.length

  const toggleAll = () => {
    setValues(isAllExpanded ? [] : allValues)
  }

  const onAccordionChange = (nextValues: string[]) => {
    const closedValues = values.filter((v) => !nextValues.includes(v))
    setValues(nextValues)

    const closedValue = closedValues[0]
    if (!closedValue) {
      return
    }

    const el = controlRefs.current[closedValue]
    if (!el) {
      return
    }

    targetRef.current = el
  }

  const renderGroupControl = (group: any) => (
    <Accordion.Control
      ref={(node) => {
        controlRefs.current[group.name] = node
      }}
      style={{
        position: 'sticky',
        top: 'var(--app-shell-header-height)',
        zIndex: 1,
        backgroundColor: 'inherit',
      }}
    >
      <Group>
        {
          group.thumbnail_url &&
          <ChannelImage
            src={group.thumbnail_url}
            w={28}
            h={28}
            loading='lazy'
          />
        }

        <Text fw={600} size='lg'>
          {group.name}
        </Text>

        {
          group.en_name &&
          <Badge visibleFrom='sm'>{group.en_name}</Badge>
        }
      </Group>
    </Accordion.Control>
  )

  const renderChannel = (channel: any) => (
    <Card
      withBorder
      p='sm'
      style={{ height: '100%' }}
    >
      <Flex gap={8} align='center'>
        <ChannelImage
          src={channel.thumbnail_url}
          w={48}
          h={48}
          loading='lazy'
        />

        <Stack gap={6} visibleFrom='sm'>
          <IconBoolean value={channel.is_active} size={20} nullable />
          <IconBoolean value={channel.has_membership} size={20} nullable />
        </Stack>

        <Anchor underline='never' href={`/channel/${channel.id}`} target='_blank' flex={1}>
          <Stack gap={2} ta='justify'>
            <Flex gap={2}>
              <Flex gap={2} align='center' hiddenFrom='sm'>
                <IconBoolean value={channel.is_active} size={16} nullable />
                <IconBoolean value={channel.has_membership} size={16} nullable />
              </Flex>
              <Text span>{channel.custom_url}</Text>
            </Flex>

            <Text span>{channel.name}</Text>
          </Stack>
        </Anchor>

        <Menu >
          <Menu.Target>
            <ActionIcon
              variant='subtle'
              h={'100%'}
            >
              <IconDotsVertical />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <MenuItemYoutubeChannel id={channel.id} />
            <MenuItemHolodexChannel id={channel.id} />
            <Menu.Divider />
            <MenuItemAppChannel id={channel.id} />
            <MenuItemAppAuthorChat id={channel.id} />
            <Menu.Divider />
            <MenuItemCopy value={channel.id} label='Copy ID' />
            {channel.custom_url && <MenuItemCopy value={channel.custom_url} label='Copy handle' />}
            {channel.name && <MenuItemCopy value={channel.name} label='Copy name' />}
          </Menu.Dropdown>
        </Menu>

      </Flex>
    </Card >
  )

  const renderGroupPanel = (group: any) => (
    <Accordion.Panel>
      {group.channels?.length ? (
        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          spacing='sm'
          verticalSpacing='sm'
        >
          {group.channels.map((channel: any) =>
            React.cloneElement(renderChannel(channel), { key: channel.id }),
          )}
        </SimpleGrid>
      ) : (
        <Text c='dimmed'>Empty</Text>
      )}
    </Accordion.Panel>
  )

  return (
    <Stack gap='sm'>
      <Group justify='flex-end'>
        <Button
          disabled={!groups.length}
          onClick={toggleAll}
        >
          {
            isAllExpanded
              ? <Tooltip label='Collapse'><IconLayoutNavbarCollapse /></Tooltip>
              : <Tooltip label='Expand'><IconLayoutNavbarExpand /></Tooltip>
          }
        </Button>
      </Group>

      <Accordion
        multiple
        variant='separated'
        chevronPosition='right'
        chevronIconSize={24}
        value={values}
        onChange={onAccordionChange}
      >
        {groups.map((group, i) => {
          return (
            <Accordion.Item key={i} value={group.name}>
              {renderGroupControl(group)}
              {renderGroupPanel(group)}
            </Accordion.Item>
          )
        })}
      </Accordion>
    </Stack>
  )
}
