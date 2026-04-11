import { IconCheck, IconQuestionMark, IconX } from '@tabler/icons-react'

export function IconBoolean(props: { value: boolean, size?: number, nullable?: boolean }) {
  if (props.nullable && typeof props.value !== 'boolean') {
    return (
      <IconQuestionMark size={props.size} color='yellow' />
    )
  }

  return (
    <>
      {
        props.value
          ? <IconCheck size={props.size} color='lime' />
          : <IconX size={props.size} color='red' />
      }
    </>
  )
}
