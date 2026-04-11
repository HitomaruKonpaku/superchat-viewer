import { Divider, Flex, Text, Tooltip } from '@mantine/core'
import { useMounted } from '@mantine/hooks'
import { Fragment, useEffect, useState } from 'react'
import { api } from '../../src/api'
import { ColorUtil } from '../../src/util/color.util'
import { EmojiUtil } from '../../src/util/emoji.util'

interface IProps {
  apiPath?: string
  pollInterval?: number
}

export function ChatColorSelector(props: IProps) {
  const mounted = useMounted()

  const [items, setItems] = useState<Record<string, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  })

  const [timerId, setTimerId] = useState<any>()
  const [abortController, setAbortController] = useState<AbortController>()

  useEffect(() => {
    return () => {
      clearInterval(timerId)
      abortController?.abort()
    }
  }, [])

  useEffect(() => {
    if (!mounted) { return }
    init()
  }, [props.pollInterval])

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
    try {
      const res = await fetchData()
      res.items.forEach((v: any) => {
        items[v.significance] = v.count
      })
      setItems({ ...items })
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

  return (
    <>
      <Flex gap='sm' wrap='wrap' mx='md' my={0}>
        <Tooltip label='ALL'>
          <Text>{`Σ ${Object.values(items).reduce((sum, cv) => sum + cv)}`}</Text>
        </Tooltip>

        {
          Object.keys(items).map((key) => (
            <Fragment key={key}>
              <Divider orientation='vertical' />
              <Tooltip label={ColorUtil.fromSignificance(key)}>
                <Text>{`${EmojiUtil.fromSignificance(key)} ${items[key]}`}</Text>
              </Tooltip>
            </Fragment>
          ))
        }
      </Flex>
    </>
  )
}
