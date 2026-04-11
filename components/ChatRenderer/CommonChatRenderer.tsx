'use client'

import { Stack, Table } from '@mantine/core'
import { JSX } from 'react'
import PaginationTable from '../PaginationTable/PaginationTable'

interface IProps {
  listApiPath: string
  listApiParams?: Record<string, any>
  limit?: number
  pollInterval?: number
  toRow: (element: Record<string, any>, index: number, limit: number, page: number) => JSX.Element
}

export function CommonChatRenderer(props: IProps) {
  return (
    <Stack gap={16}>
      <PaginationTable
        apiPath={props.listApiPath}
        apiParams={props.listApiParams}
        limit={props.limit || 10}
        thead={
          <Table.Tr>
            <Table.Th w={0} ta='center'>#</Table.Th>
            <Table.Th />
          </Table.Tr>
        }
        toRow={props.toRow}
      />
    </Stack>
  )
}
