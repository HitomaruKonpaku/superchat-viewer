'use client'

import { createTheme, Table } from '@mantine/core'

export const theme = createTheme({
  /* Put your mantine theme override here */

  fontFamily: '"Roboto Mono", monospace',

  components: {
    Table: Table.extend({
      defaultProps: {
        highlightOnHoverColor: '#5562ea88',
      },
    }),
  },
})
