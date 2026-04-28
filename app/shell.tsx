'use client'

import { AppShell, Burger, Flex, Group, NavLink, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconHome, IconUsers, IconUsersGroup } from '@tabler/icons-react'
import { usePathname } from 'next/navigation'

export function Shell({ children }: { children: any }) {
  const pathname = usePathname()

  const [opened, { toggle }] = useDisclosure()

  const navItems = [
    { href: '/', label: 'Home', icon: <IconHome size={24} /> },
    { href: '/channels', label: 'Channels', icon: <IconUsers size={24} /> },
    // { href: '/videos', label: 'Videos', icon: <IconVideo size={24} /> },
    { href: '/groups', label: 'Groups', icon: <IconUsersGroup size={24} /> },
  ]

  const handleLinkClick = () => {
    if (opened) {
      close()
    }
  }

  const renderNavItems = () => {
    return (
      navItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={<Text>{item.label}</Text>}
          leftSection={item.icon}
          active={pathname === item.href}
          variant='filled'
          fw='bold'
          style={{ borderRadius: 6 }}
          onClick={handleLinkClick}
        />
      ))
    )
  }

  return (
    <AppShell
      padding='sm'
      header={{
        height: 48,
      }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          mobile: !opened,
          desktop: true,
        },
      }}
    >
      <AppShell.Header>
        <Group h='100%' px='md'>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom='sm'
            size='md'
          />

          <Flex gap={6} visibleFrom='sm'>
            {renderNavItems()}
          </Flex>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p='md'>
        <Stack gap={6}>
          {renderNavItems()}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack maw={1280} mx='auto'>
          {children}
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}
