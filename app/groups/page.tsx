'use client'

import { Accordion, Anchor, Badge, Button, Card, Flex, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { IconLayoutNavbarCollapse, IconLayoutNavbarExpand } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'
import { IconBoolean } from '../../components/icon/IconBoolean'
import { ChannelImage } from '../../components/Image/ChannelImage'
import { api } from '../../src/api'

export default function GroupListPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [values, setValues] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      await initData()
    }

    load()
  }, [])

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

  const renderGroupControl = (group: any) => (
    <Accordion.Control
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
      <Flex gap='sm' align='center'>
        <ChannelImage
          src={channel.thumbnail_url}
          w={48}
          h={48}
          loading='lazy'
        />

        <Stack gap={2} style={{ flex: 1 }}>
          <Flex gap={6} align='center'>
            <IconBoolean value={channel.is_active} size={16} />
            <Anchor underline='never' href={`/channel/${channel.id}`} target='_blank' flex={1}>
              <Text span>{channel.custom_url}</Text>
            </Anchor>
          </Flex>

          <Anchor underline='never' href={`/channel/${channel.id}`} target='_blank'>
            <Text span>{channel.name}</Text>
          </Anchor>
        </Stack>
      </Flex>
    </Card>
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
        onChange={setValues}
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
    </Stack >
  )
}
