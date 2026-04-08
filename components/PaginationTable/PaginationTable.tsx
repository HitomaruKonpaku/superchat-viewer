'use client'

import { Button, Flex, Grid, Group, Input, Pagination, Table } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMounted } from '@mantine/hooks'
import { IconSearch, IconX } from '@tabler/icons-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BaseSyntheticEvent, JSX, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../../src/api'
import { LoadingContext } from '../../src/provider/loading.provider'

interface IProps {
  apiPath: string
  apiParams?: Record<string, any>

  limit?: number
  page?: number

  pollInterval?: number

  search?: boolean
  striped?: boolean

  thead?: JSX.Element
  toRow?: (element: Record<string, any>, index: number, limit: number, page: number) => JSX.Element
}

let abortController!: AbortController
let timerId!: any

export default function PaginationTable(props: IProps) {
  const LIMIT_DEFAULT = 10
  const PAGE_DEFAULT = 1

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setLoading } = useContext(LoadingContext)

  const mounted = useMounted()

  const [rows, setRows] = useState<any[]>([])
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || props.limit || LIMIT_DEFAULT)
  const [pageValue, setPageValue] = useState(Number(searchParams.get('p') || searchParams.get('page')) || props.page || PAGE_DEFAULT)
  const [pageTotal, setPageTotal] = useState(1)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const searchRef = useRef<HTMLInputElement>(null)
  const searchForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      search: searchParams.get('q') || '',
    }
  })

  const updateSearchParams = useCallback(
    (newParams: { [key: string]: string | null }) => {
      const curParams = new URLSearchParams(searchParams.toString())
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key]
        curParams.delete(key)
        if (value) {
          curParams.set(key, value)
        }
      })
      return curParams.toString()
    },
    [searchParams]
  )

  const updateParams = (params: Record<string, any>) => {
    const qs = updateSearchParams(params)
    const href = `${pathname}?${qs}`
    router.push(href)
  }

  useEffect(() => {
    setLimit(props.limit || limit)
  }, [props.limit])

  useEffect(() => {
    setPageValue(props.page || pageValue)
  }, [props.page])

  useEffect(() => {
    initTimer()
  }, [props.pollInterval])

  useEffect(() => {
    reload()
  }, [props.apiParams])

  useEffect(() => {
    reload()
  }, [mounted])

  useEffect(() => {
    updateParams({
      q: query,
      p: pageValue !== 1 ? pageValue : null,
    })
    reload()
  }, [limit, pageValue, query])

  useEffect(() => {
    return () => {
      clearInterval(timerId)
    }
  }, [])

  function reload() {
    if (mounted) {
      init()
    }
  }

  function init() {
    clearInterval(timerId)
    initData()
      .then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .finally(() => {
        initTimer()
      })
  }

  async function initData() {
    setLoading(true)
    abortController?.abort()

    try {
      const { total, items } = await fetchData()
      setRows(items.map((item: any, index: number) => props.toRow?.(item, index, limit, pageValue)))
      setPageTotal(Math.max(1, Math.floor((total - 1) / limit) + 1))
    } finally {
      setLoading(false)
    }
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
        params: {
          ...props.apiParams,
          limit,
          page: pageValue,
          q: query,
        },
        signal: abortController.signal,
      },
    )
    return { total, items }
  }

  function onPageChange(value: number) {
    setPageValue(value)
  }

  function onSearchKeyDown(event: BaseSyntheticEvent<KeyboardEvent>) {
    if (event.nativeEvent.code === 'Escape') {
      if (searchForm.values.search) {
        clearSearch()
      }
    }
  }

  function onSearch(values: typeof searchForm.values) {
    setPageValue(1)
    setQuery(values.search)
  }

  function clearSearch() {
    setPageValue(1)
    setQuery('')
    searchForm.setValues({ search: '' })
    setTimeout(() => searchRef?.current?.focus())
  }

  return (
    <>
      <Group justify={!props.search ? "center" : "flex-end"} mx={16} my={8}>
        {
          props.search &&
          <form onSubmit={searchForm.onSubmit(onSearch)} style={{ flex: 1 }}>
            <Grid gutter="xs">
              <Grid.Col span={9}>
                <Input
                  type="search"
                  miw={240}
                  ref={searchRef}
                  key={searchForm.key('search')}
                  {...searchForm.getInputProps('search')}
                  rightSection={<IconX cursor="pointer" onClick={clearSearch} />}
                  rightSectionPointerEvents="auto"
                  onKeyDown={onSearchKeyDown}
                />
              </Grid.Col>

              <Grid.Col span={3}>
                <Button type="submit">
                  <IconSearch size={16} />
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        }

        <Pagination
          total={pageTotal}
          value={pageValue}
          size="lg"
          withEdges
          onChange={onPageChange}
        />
      </Group>

      <Table stickyHeader striped={props.striped} highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>{props.thead}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Flex justify={!props.search ? "center" : "flex-end"} mx={16} my={8}>
        <Pagination
          total={pageTotal}
          value={pageValue}
          size="lg"
          withEdges
          onChange={onPageChange}
        />
      </Flex>
    </>
  )
}
