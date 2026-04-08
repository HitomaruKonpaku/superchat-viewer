import { Divider, Flex, Text, Tooltip } from '@mantine/core'
import { useMounted } from '@mantine/hooks'
import { Fragment, useEffect, useState } from 'react'
import { api } from '../../src/api'
import { ColorUtil } from '../../src/util/color.util'
import { EmojiUtil } from '../../src/util/emoji.util'

interface IProps {
  apiPath: string

  pollInterval?: number
}

let abortController!: AbortController
let timerId!: any

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
    abortController?.abort()

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
    const abortController = new AbortController()
    const { data: { total, items } } = await api.get(
      props.apiPath,
      {
        signal: abortController.signal,
      },
    )
    return { total, items }
  }

  return (
    <>
      <Flex gap="sm" wrap="wrap" mx="md" my={0}>
        <Tooltip label="ALL">
          <Text>{`Σ ${Object.values(items).reduce((sum, cv) => sum + cv)}`}</Text>
        </Tooltip>

        {
          Object.keys(items).map((key) => (
            <Fragment key={key}>
              <Divider orientation="vertical" />
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
