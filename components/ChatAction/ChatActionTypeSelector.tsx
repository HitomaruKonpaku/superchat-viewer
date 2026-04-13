import { Checkbox, Flex } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useMounted } from '@mantine/hooks'
import { BaseSyntheticEvent, useContext, useEffect, useRef } from 'react'
import { api } from '../../src/api'
import { ChatActionFormValue, ChatTypeOption } from '../../src/interface/superchat.interface'
import { LoadingContext } from '../../src/provider/loading.provider'

interface IProps {
  form?: UseFormReturnType<ChatActionFormValue, Record<string, any>>
  apiPath?: string
  pollInterval?: number
}

export function ChatActionTypeSelector(props: IProps) {
  const mounted = useMounted()
  const { loading } = useContext(LoadingContext)

  const timerRef = useRef<any>(null)
  const timerDelayRef = useRef(props.pollInterval)
  const abortControllerRef = useRef<AbortController | null>(null)

  const types = props.form?.values?.types || []

  const allChecked = !!types.length && types.every((item) => item.checked)
  const allIndeterminate = !!types.length && !allChecked && types.some((item) => item.checked)
  const allCount = types.reduce((sum, item) => sum + item.count, 0)
  const allLabel = `ALL (${allCount})`

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    timerDelayRef.current = props.pollInterval
  }, [props.pollInterval])

  useEffect(() => {
    if (!mounted) return
    init()
  }, [mounted])

  useEffect(() => {
    if (!timerDelayRef.current) {
      clearTimeout(timerRef.current)
      return
    }
    initTimer()
  }, [timerDelayRef.current])

  async function init() {
    return initData()
      .finally(() => initTimer())
  }

  function initTimer() {
    clearTimeout(timerRef.current)
    if (!props.pollInterval) {
      return
    }

    timerRef.current = setTimeout(
      () => {
        initData()
          .finally(() => initTimer())
      },
      props.pollInterval,
    )
  }

  async function initData() {
    clearTimeout(timerRef.current)
    if (!props.form) {
      return
    }

    try {
      const res = await fetchData()
      const items = props.form.values.types || []
      items.forEach((item) => {
        const obj = res.items.find((v: any) => v.type === item.key)
        const newCount = obj?.count ?? item.count
        item.count = newCount
      })
    } finally {
      // ignore
    }
  }

  async function fetchData() {
    abortControllerRef.current?.abort()
    if (!props.apiPath) {
      return { total: 0, items: [] }
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
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
