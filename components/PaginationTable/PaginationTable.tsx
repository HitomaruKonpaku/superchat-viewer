'use client'

import { Button, Flex, Grid, Group, Input, Pagination, Table } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useHotkeys, useMounted } from '@mantine/hooks'
import { IconSearch, IconX } from '@tabler/icons-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BaseSyntheticEvent, JSX, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../../src/api'
import { cfg } from '../../src/cfg'
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

export default function PaginationTable(props: IProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mounted = useMounted()
  const { setLoading } = useContext(LoadingContext)

  const [rows, setRows] = useState<any[]>([])
  const [limit, setLimit] = useState(cfg.defaultValue.limit)
  const [pageValue, setPageValue] = useState(cfg.defaultValue.page)
  const [pageTotal, setPageTotal] = useState(1)
  const [query, setQuery] = useState('')

  const [timerId, setTimerId] = useState<any>()
  const [abortController, setAbortController] = useState<AbortController>()

  const [isPageChanged, setIsPageChanged] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)
  const searchForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      search: searchParams.get('q') || '',
    }
  })

  const createQueryString = useCallback(
    (newParams: Record<string, string | undefined | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key]
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return params.toString()
    },
    [searchParams]
  )

  const setParams = (params: Record<string, any | undefined | null>) => {
    const qs = createQueryString(params)
    const href = `${pathname}?${qs}`
    router.push(href)
  }

  useEffect(() => {
    return () => {
      clearInterval(timerId)
      abortController?.abort()
    }
  }, [])

  useEffect(() => {
    if (!mounted) { return }
    setLimit(Number(searchParams.get('l')) || props.limit || cfg.defaultValue.limit)
    setPageValue(Number(searchParams.get('p')) || props.page || cfg.defaultValue.page)
    setQuery(searchParams.get('q') || '')
    setPageTotal(1)
    init()
  }, [mounted])

  useEffect(() => {
    setLimit(Number(searchParams.get('l')) || props.limit || cfg.defaultValue.limit)
    setPageValue(Number(searchParams.get('p')) || props.page || cfg.defaultValue.page)
    setQuery(searchParams.get('q') || '')
    if (!mounted) { return }
    init()
  }, [searchParams])

  useHotkeys([
    ['ArrowLeft', () => {
      onPageChange(Math.max(cfg.defaultValue.page, pageValue - 1))
    }],
    ['ArrowRight', () => {
      onPageChange(Math.min(pageTotal, pageValue + 1))
    }],
  ])

  async function init() {
    clearInterval(timerId)
    return initData()
      .then(() => {
        if (isPageChanged) {
          setIsPageChanged(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
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
    abortController?.abort()
    if (!props.apiPath) {
      return { total: 0, items: [] }
    }

    const params = {
      ...props.apiParams,
      limit,
      page: pageValue,
      q: query,
    }
    const controller = new AbortController()
    setAbortController(controller)

    if (cfg.debug) {
      console.warn('fetchData', { url: props.apiPath, params })
    }

    const { data: { total, items } } = await api.get(
      props.apiPath,
      {
        params,
        signal: controller.signal,
      },
    )
    return { total, items }
  }

  function onPageChange(value: number) {
    setIsPageChanged(true)
    setPageValue(value)
    setParams({ p: value !== 1 ? value : null })
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
    setParams({ q: values.search, p: null })
  }

  function clearSearch() {
    setPageValue(1)
    setQuery('')
    setParams({ q: null, p: null })
    searchForm.setValues({ search: '' })
    setTimeout(() => searchRef?.current?.focus())
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
