import { Divider, Group, Menu, Text } from '@mantine/core'
import { IconGiftFilled, IconStarFilled } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { EmojiUtil } from '../../src/util/emoji.util'
import { BaseImage } from '../Emoji/BaseImage'
import MenuItemCopy from '../menu-item/MenuItemCopy'
import ChatMessage from './ChatMessage'

interface IProps {
  value: any
  channelId?: string
}

export function ChatActionRenderer(props: IProps) {
  const [element, setElement] = useState<any>()

  useEffect(() => {
    setElement(props.value)
  }, [props.value])

  return (
    <>
      {
        element &&
        <>
          {
            ['addSuperChatItemAction', 1].includes(element.type) &&
            <Group>
              <Text>{EmojiUtil.fromColor(element.color)}</Text>
              <Text w={40} ta='right'>{element.currency}</Text>
              <Text w={80} ta='right'>{element.amount}</Text>
              {element.sc_counter && <Text w={40} ta='right'>{element.sc_counter}</Text>}
            </Group>
          }

          {
            ['addMembershipItemAction', 2].includes(element.type) &&
            <Group bg='#0f9d58' c='white' px={8} py={4}>
              <IconStarFilled size={16} />
              <Group>
                {
                  element.level
                    ? <Text>Welcome to {element.level}</Text>
                    : <Text>New member</Text>
                }
                {
                  element.membership_thumbnail &&
                  <BaseImage
                    src={element.membership_thumbnail}
                    alt='membership_thumbnail'
                    w={20}
                    h={20}
                  />
                }
              </Group>
            </Group>
          }

          {
            ['membershipGiftPurchaseAction', 4].includes(element.type) &&
            <Group bg='#0f9d58' c='white' px={8} py={4}>
              <IconGiftFilled size={16} />
              <Text w={40} ta='right'>{element.amount}</Text>
            </Group>
          }

          {
            ['membershipGiftRedemptionAction', 8].includes(element.type) &&
            <Group bg='#0f9d58' c='white' px={8} py={4}>
              <Text>Received a gift membership{element.sender_name && <> by {element.sender_name}</>}</Text>
            </Group>
          }

          {
            element.message &&
            <>
              {
                element.type &&
                <Divider my={4} />
              }

              <Menu position='bottom-start'>
                <Menu.Target>
                  <ChatMessage
                    message={element.message}
                    channelId={props.channelId}
                  />
                </Menu.Target>

                <Menu.Dropdown>
                  <MenuItemCopy value={element.message} label='Copy' />
                </Menu.Dropdown>
              </Menu>
            </>
          }
        </>
      }
    </>
  )
}
