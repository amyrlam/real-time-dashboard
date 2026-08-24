import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    /** Column alignment; numeric columns should be `end`. */
    align?: 'start' | 'end'
  }
}
