export interface ChatTypeOption {
  id: number
  key: string
  label: string
  checked: boolean
  count: number
}

export interface ChatActionFormValue {
  types: ChatTypeOption[]
}
