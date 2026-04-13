'use client'

import { Stack, Table } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { JSX } from 'react'
import { ChatActionFormValue } from '../../src/interface/superchat.interface'
import { ChatActionTypeSelector } from '../ChatAction/ChatActionTypeSelector'
import { ChatColorSelector } from '../ChatColor/ChatColorSelector'
import PaginationTable from '../PaginationTable/PaginationTable'

interface IProps {
  listApiPath: string
  listApiParams?: Record<string, any>
  statsTypesApiPath?: string
  statsColorsApiPath?: string
  form: UseFormReturnType<ChatActionFormValue, Record<string, any>>
  limit?: number
  pollInterval?: number
  toRow: (element: Record<string, any>, index: number, limit: number, page: number) => JSX.Element
}

export function SuperChatRenderer(props: IProps) {
  return (
    <Stack gap={16}>
      <ChatActionTypeSelector
        form={props.form}
        apiPath={props.statsTypesApiPath}
        pollInterval={props.pollInterval}
      />

      <ChatColorSelector
        apiPath={props.statsColorsApiPath}
        pollInterval={props.pollInterval}
      />

      <PaginationTable
        apiPath={props.listApiPath}
        apiParams={props.listApiParams}
        limit={props.limit || 10}
        pollInterval={props.pollInterval}
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
