import { Checkbox, Flex } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useMounted } from '@mantine/hooks'
import { BaseSyntheticEvent, useContext, useEffect } from 'react'
import { api } from '../../src/api'
import { ChatActionForm, ChatTypeOption } from '../../src/interface/superchat.interface'
import { LoadingContext } from '../../src/provider/loading.provider'

interface IProps {
  form?: UseFormReturnType<ChatActionForm, string>
  apiPath?: string
  pollInterval?: number
}

let abortController!: AbortController
let timerId!: any

export function ChatActionTypeSelector(props: IProps) {
  const mounted = useMounted()
  const { loading } = useContext(LoadingContext)

  const types = props.form?.values?.types || []

  const allChecked = !!types.length && types.every((item) => item.checked)
  const allIndeterminate = !!types.length && !allChecked && types.some((item) => item.checked)
  const allCount = types.reduce((sum, item) => sum + item.count, 0)
  const allLabel = `ALL (${allCount})`

  useEffect(() => {
    initTimer()
  }, [props.pollInterval])

  useEffect(() => {
    reload()
  }, [mounted])

  useEffect(() => {
    return () => {
      clearInterval(timerId)
    }
  }, [])

  async function initData() {

    try {
      const res = await fetchData()
      types.forEach((type) => {
        const obj = res.items.find((v: any) => v.type === type.key)
        type.count = obj?.count ?? type.count
      })
    } finally {
      // ignore
    }
  }

  function reload() {
    if (mounted) {
      init()
    }
  }

  function init() {
    clearInterval(timerId)
    initData()
      .finally(() => {
        initTimer()
      })
  }

  function initTimer() {
    clearInterval(timerId)
    if (!props.pollInterval) {
      return
    }

    timerId = setTimeout(
      () => {
        initData()
          .finally(() => initTimer())
      },
      props.pollInterval,
    )
  }

  async function fetchData() {
    abortController?.abort()
    if (!props.apiPath) {
      return { total: 0, items: [] }
    }

    abortController = new AbortController()
    const { data: { total, items } } = await api.get(
      props.apiPath,
      {
        signal: abortController.signal,
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
        <Flex gap="md" wrap="wrap" mx="md" my={0}>
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
