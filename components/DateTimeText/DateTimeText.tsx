import { FloatingPosition, MantineFontSize, MantineLineHeight, Menu, Text } from '@mantine/core'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

interface IProps {
  value: string
  size?: MantineFontSize & MantineLineHeight

  menuDisabled?: boolean
  menuPosition?: FloatingPosition
}

export function DateTimeText(props: IProps) {
  const [format] = useState('yyyy-LL-dd HH:mm:ss')
  const [dt, setDt] = useState<DateTime>()

  useEffect(() => {
    if (!props.value) {
      setDt(undefined)
      return
    }

    const dt = DateTime.fromMillis(Number(props.value))
    setDt(dt)
  }, [props.value])

  return (
    <>
      {
        dt &&
        <Menu
          disabled={props.menuDisabled ?? false}
          position={props.menuPosition}
        >
          <Menu.Target>
            <Text size={props.size}>{dt.toFormat(format)}</Text>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<Text>LOC:</Text>}>
              <Text>{dt.toFormat(format)}</Text>
            </Menu.Item>

            <Menu.Item leftSection={<Text>UTC: </Text>}>
              <Text>{dt.setZone('UTC').toFormat(format)}</Text>
            </Menu.Item>

            <Menu.Item leftSection={<Text>JST: </Text>}>
              <Text>{dt.setZone('UTC+9').toFormat(format)}</Text>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      }
    </>
  )
}
