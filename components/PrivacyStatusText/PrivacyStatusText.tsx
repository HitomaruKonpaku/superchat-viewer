import { MantineColor, Text } from '@mantine/core'
import { useEffect, useState } from 'react'

interface IProps {
  value: string
}

function getColor(status: string): MantineColor | undefined {
  switch (status) {
    case 'public':
      return 'green'
    case 'unlisted':
      return 'yellow'
    case 'private':
      return 'red'
    default:
      return undefined
  }
}

export function PrivacyStatusText(props: IProps) {
  const [color, setColor] = useState<MantineColor>()

  useEffect(() => {
    setColor(getColor(props.value))
  }, [props.value])

  return (
    <>
      <Text c={color}>
        {props.value}
      </Text>
    </>
  )
}
