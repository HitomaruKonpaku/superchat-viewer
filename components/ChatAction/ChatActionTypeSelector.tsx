import { Checkbox, Flex } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { BaseSyntheticEvent, useContext } from 'react'
import { LoadingContext } from '../../src/provider/loading.provider'

interface IProps {
  form?: UseFormReturnType<any>
}

export function ChatActionTypeSelector(props: IProps) {
  const { loading } = useContext(LoadingContext)

  function getChecked() {
    const res = Object.values(props.form?.values || {}).every(v => v)
    return res
  }

  function getIndeterminate() {
    const res = Object.values(props.form?.values || {}).some(v => v)
      && !getChecked()
    return res
  }

  function onChange(event: BaseSyntheticEvent<Event, HTMLInputElement>) {
    const indeterminate = getIndeterminate()
    const tmp = props.form?.getValues()
    Object.keys(tmp).forEach((key) => {
      if (indeterminate) {
        tmp[key] = false
      } else {
        tmp[key] = event.currentTarget.checked
      }
    })
    props.form?.setValues(tmp)
  }

  return (
    <>
      {
        props.form &&
        <Flex gap="md" wrap="wrap" mx="md" my={0}>
          <Checkbox
            label="<ALL>"
            checked={getChecked()}
            indeterminate={getIndeterminate()}
            disabled={loading}
            onChange={onChange}
          />

          {
            Object.keys(props.form.values).map((key) => (
              <Checkbox
                label={key}
                key={props.form?.key(key)}
                {...props.form?.getInputProps(key)}
                defaultChecked={props.form?.getValues()[key]}
                disabled={loading}
              />
            ))
          }
        </Flex>
      }
    </>
  )
}
