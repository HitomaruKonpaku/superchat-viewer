import { Checkbox, Flex } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useMounted } from '@mantine/hooks'
import { BaseSyntheticEvent, useContext, useEffect, useState } from 'react'
import { api } from '../../src/api'
import { ChatActionForm, ChatTypeOption } from '../../src/interface/superchat.interface'
import { LoadingContext } from '../../src/provider/loading.provider'

interface IProps {
  form?: UseFormReturnType<ChatActionForm, string>
  apiPath?: string
  pollInterval?: number
}

export function ChatActionTypeSelector(props: IProps) {
  const mounted = useMounted()
  const { loading } = useContext(LoadingContext)

  const [timerId, setTimerId] = useState<any>()
  const [abortController, setAbortController] = useState<AbortController>()

  const types = props.form?.values?.types || []

  const allChecked = !!types.length && types.every((item) => item.checked)
  const allIndeterminate = !!types.length && !allChecked && types.some((item) => item.checked)
  const allCount = types.reduce((sum, item) => sum + item.count, 0)
  const allLabel = `ALL (${allCount})`

  useEffect(() => {
    return () => {
      clearInterval(timerId)
      abortController?.abort()
    }
  }, [])

  useEffect(() => {
    if (!mounted) { return }
    init()
  }, [mounted, props.pollInterval])

  async function init() {
    clearInterval(timerId)
    return initData()
      .finally(() => initTimer())
  }

  function initTimer() {
    clearInterval(timerId)
    if (!props.pollInterval) {
      return
    }

    setTimerId(setTimeout(
      () => {
        initData()
          .finally(() => initTimer())
      },
      props.pollInterval,
    ))
  }

  async function initData() {
    if (!props.form) {
      return
    }

    try {
      const res = await fetchData()
      const curTypes = props.form.values.types || []
      const newTypes = curTypes.map((type) => {
        const obj = res.items.find((v: any) => v.type === type.key)
        const newCount = obj?.count ?? type.count
        return {
          ...type,
          count: newCount,
        }
      })
      props.form.setFieldValue('types', newTypes)
    } finally {
      // ignore
    }
  }

  async function fetchData() {
    abortController?.abort()
    if (!props.apiPath) {
      return { total: 0, items: [] }
    }

    const controller = new AbortController()
    setAbortController(controller)
    const { data: { total, items } } = await api.get(
      props.apiPath,
      {
        signal: controller.signal,
      },
    )
    return { total, items }
  }

  function onAllChange() {
    const newChecked = !allIndeterminate && !allChecked
    const newTypes = types.map((item) => ({
      ...item,
      checked: newChecked,
    }))
    props.form?.setFieldValue('types', newTypes)
  }

  function onItemChange(event: BaseSyntheticEvent<Event, HTMLInputElement>, index: number) {
    const newTypes = [...types]
    newTypes[index] = {
      ...newTypes[index],
      checked: event.currentTarget.checked,
    }
    props.form?.setFieldValue('types', newTypes)
  }

  function getItemLabel(item: ChatTypeOption) {
    return `${item.label} (${item.count})`
  }

  return (
    <>
      {
        props.form &&
        <Flex gap='md' wrap='wrap' mx='md' my={0}>
          <Checkbox
            label={allLabel}
            checked={allChecked}
            indeterminate={allIndeterminate}
            disabled={loading}
            onChange={onAllChange}
          />

          {
            types.map((item, index: number) => (
              <Checkbox
                key={item.key || index}
                label={getItemLabel(item)}
                checked={item.checked}
                disabled={loading}
                onChange={(ev) => onItemChange(ev, index)}
              />
            ))
          }
        </Flex>
      }
    </>
  )
}
