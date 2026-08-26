import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    /** Column alignment; numeric columns should be `end`. */
    align?: 'start' | 'end'
    /**
     * Hide this column below the given breakpoint, so narrow viewports show
     * a deliberate subset instead of a truncated table. Reserve for
     * diagnostic-detail columns; the triage columns should survive every
     * width.
     */
    hideBelow?: 'sm' | 'md' | 'lg'
  }
}
