'use client'

import { Button, Flex, Group, Input, Pagination, Table, Tooltip } from '@mantine/core'
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
  onApiResponse?: (data: any) => any

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

  const [items, setItems] = useState<any[]>([])
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
    },
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
    ['A', toPrevPage],
    ['D', toNextPage],
    ['Q', toFirstPage],
    ['E', toLastPage],
    ['W', scrollUp],
    ['S', scrollDown],
    ['R', scrollTop],
    ['F', scrollBottom],
    ['F3', focusSearch],
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
      const data = await fetchData()
      const { total, items } = data
      setItems(items)
      setPageTotal(Math.max(1, Math.floor((total - 1) / limit) + 1))
      props.onApiResponse?.(data)
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
    const { data } = await api.get(
      props.apiPath,
      {
        params,
        signal: controller.signal,
      },
    )
    return data
  }

  //#region scroll

  function scrollUp() {
    const scale = 0.75
    const top = window.scrollY - window.innerHeight * scale
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function scrollDown() {
    const scale = 0.75
    const top = window.scrollY + window.innerHeight * scale
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function scrollBottom() {
    window.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: 'smooth' })
  }

  //#endregion

  //#region search

  function onSearchKeyDown(event: BaseSyntheticEvent<KeyboardEvent>) {
    if (event.nativeEvent.code === 'Escape') {
      if (searchForm.values.search) {
        clearSearch()
        return
      }
    }
    if (event.nativeEvent.code === 'F2') {
      unfocusSearch()
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

  function unfocusSearch() {
    setTimeout(() => searchRef?.current?.blur())
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

  function toFirstPage() {
    onPageChange(1)
  }

  function toLastPage() {
    onPageChange(pageTotal)
  }

  function getPagination() {
    return (
      <Pagination.Root
        total={pageTotal}
        value={pageValue}
        size='lg'
        onChange={onPageChange}
      >
        <Group justify='center' gap={5}>
          <Tooltip label='(Q)'>
            <Pagination.First />
          </Tooltip>
          <Tooltip label='(A)'>
            <Pagination.Previous />
          </Tooltip>
          <Pagination.Items />
          <Tooltip label='(D)'>
            <Pagination.Next />
          </Tooltip>
          <Tooltip label='(E)'>
            <Pagination.Last />
          </Tooltip>
        </Group>
      </Pagination.Root>
    )
  }

  //#endregion

  return (
    <>
      <Group justify={!props.search ? 'center' : 'flex-end'}>
        {
          props.search &&
          <form onSubmit={searchForm.onSubmit(onSearch)} style={{ flex: 1 }}>
            <Flex gap={6}>
              <Tooltip label='(F3) to focus, (F2) to unfocus'>
                <Input
                  type='search'
                  placeholder='Search'
                  miw={200}
                  ref={searchRef}
                  key={searchForm.key('search')}
                  {...searchForm.getInputProps('search')}
                  rightSection={
                    <Tooltip label='(ESC)'>
                      <IconX cursor='pointer' onClick={clearSearch} />
                    </Tooltip>
                  }
                  rightSectionPointerEvents='auto'
                  onKeyDown={onSearchKeyDown}
                />
              </Tooltip>

              <Button type='submit'>
                <IconSearch size={16} />
              </Button>
            </Flex>
          </form>
        }

        {getPagination()}
      </Group>

      <Table stickyHeader striped={props.striped} highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>{props.thead}</Table.Thead>
        <Table.Tbody>
          {items.map((item: any, index: number) => props.toRow?.(item, index, limit, pageValue))}
        </Table.Tbody>
      </Table>

      <Flex justify={!props.search ? 'center' : 'flex-end'}>
        {getPagination()}
      </Flex>
    </>
  )
}
