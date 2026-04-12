'use client'

import { Button, Flex, Grid, Group, Input, Pagination, Table } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useHotkeys, useMounted } from '@mantine/hooks'
import { IconSearch, IconX } from '@tabler/icons-react'
import { BaseSyntheticEvent, JSX, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../../src/api'
import { cfg } from '../../src/cfg'
import { LoadingContext } from '../../src/provider/loading.provider'
import { SearchParamsContext } from '../../src/provider/search-params.provider'

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

export default function PaginationTable(props: IProps) {
  const mounted = useMounted()
  const { setLoading } = useContext(LoadingContext)
  const { searchParams, applyParams, qs } = useContext(SearchParamsContext)

  const timerRef = useRef<any>(null)
  const timerDelayRef = useRef(props.pollInterval)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [rows, setRows] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(cfg.defaultValue.limit)
  const [pageValue, setPageValue] = useState(cfg.defaultValue.page)
  const [pageTotal, setPageTotal] = useState(1)

  const queryRef = useRef(query)
  const limitRef = useRef(limit)
  const pageValueRef = useRef(pageValue)

  const searchRef = useRef<HTMLInputElement>(null)
  const searchForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      search: searchParams.get('q') || '',
    }
  })

  useEffect(() => {
    setQuery(searchParams.get('q') || query)
    setLimit(Number(searchParams.get('l') || props.limit || limit))
    setPageValue(Number(searchParams.get('p') || props.page || pageValue))

    return () => {
      clearTimeout(timerRef.current)
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    timerDelayRef.current = props.pollInterval
  }, [props.pollInterval])

  useEffect(() => {
    queryRef.current = query
  }, [query])

  useEffect(() => {
    limitRef.current = limit
  }, [limit])

  useEffect(() => {
    pageValueRef.current = pageValue
  }, [pageValue])

  useEffect(() => {
    if (!mounted) return

    if (!searchParams.get('l')) {
      limitRef.current = props.limit ?? cfg.defaultValue.limit
      setLimit(limitRef.current)
    }

    if (!searchParams.get('p')) {
      pageValueRef.current = cfg.defaultValue.page
      setPageValue(pageValueRef.current)
    }

    init()
  }, [mounted, qs()])

  useEffect(() => {
    if (!timerDelayRef.current) {
      clearTimeout(timerRef.current)
      return
    }
    initTimer()
  }, [timerDelayRef.current])

  useHotkeys([
    ['ArrowLeft', toPrevPage],
    ['ArrowRight', toNextPage],
    ['a', toPrevPage],
    ['d', toNextPage],
    ['ctrl+f', focusSearch],
  ])

  async function init() {
    return initData()
      .then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .finally(() => initTimer())
  }

  function initTimer() {
    clearTimeout(timerRef.current)
    if (!timerDelayRef.current) {
      return
    }

    timerRef.current = setTimeout(
      () => {
        initData()
          .finally(() => initTimer())
      },
      timerDelayRef.current,
    )
  }

  async function initData() {
    clearTimeout(timerRef.current)
    setLoading(true)

    try {
      const { total, items } = await fetchData()
      setRows(items.map((item: any, index: number) => props.toRow?.(item, index, limit, pageValue)))
      setPageTotal(Math.max(1, Math.floor((total - 1) / limit) + 1))
    } finally {
      setLoading(false)
    }
  }

  async function fetchData() {
    abortControllerRef.current?.abort()
    if (!props.apiPath) {
      return { total: 0, items: [] }
    }

    const params = {
      ...props.apiParams,
      q: queryRef.current,
      limit: limitRef.current,
      page: pageValueRef.current,
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    const { data: { total, items } } = await api.get(
      props.apiPath,
      {
        params,
        signal: controller.signal,
      },
    )
    return { total, items }
  }

  //#region search

  function onSearchKeyDown(event: BaseSyntheticEvent<KeyboardEvent>) {
    if (event.nativeEvent.code === 'Escape') {
      if (searchForm.values.search) {
        clearSearch()
      }
    }
  }

  function onSearch(values: typeof searchForm.values) {
    setQuery(values.search)
    setPageValue(1)
    applyParams({ q: values.search, p: null })
  }

  function clearSearch() {
    setQuery('')
    setPageValue(1)
    applyParams({ q: null, p: null })
    searchForm.setValues({ search: '' })
    focusSearch()
  }

  function focusSearch() {
    setTimeout(() => searchRef?.current?.focus())
  }

  //#endregion

  //#region pagination

  function onPageChange(value: number) {
    setPageValue(value)
    applyParams({ p: value !== 1 ? value : null })
  }

  function toPrevPage() {
    const page = Math.max(cfg.defaultValue.page, pageValue - 1)
    onPageChange(page)
  }

  function toNextPage() {
    const page = Math.min(pageTotal, pageValue + 1)
    onPageChange(page)
  }

  function getPagination() {
    return (
      <Pagination
        total={pageTotal}
        value={pageValue}
        size='lg'
        withEdges
        onChange={onPageChange}
      />
    )
  }

  //#endregion

  return (
    <>
      <Group justify={!props.search ? 'center' : 'flex-end'} mx={8} mt={8}>
        {
          props.search &&
          <form onSubmit={searchForm.onSubmit(onSearch)} style={{ flex: 1 }}>
            <Grid gap='xs'>
              <Grid.Col span={9}>
                <Input
                  type='search'
                  miw={240}
                  ref={searchRef}
                  key={searchForm.key('search')}
                  {...searchForm.getInputProps('search')}
                  rightSection={<IconX cursor='pointer' onClick={clearSearch} />}
                  rightSectionPointerEvents='auto'
                  onKeyDown={onSearchKeyDown}
                />
              </Grid.Col>

              <Grid.Col span={3}>
                <Button type='submit'>
                  <IconSearch size={16} />
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        }

        {getPagination()}
      </Group>

      <Table stickyHeader striped={props.striped} highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>{props.thead}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Flex justify={!props.search ? 'center' : 'flex-end'} mx={8} mb={16}>
        {getPagination()}
      </Flex>
    </>
  )
}
