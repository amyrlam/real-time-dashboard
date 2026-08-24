import { cn } from '../../lib/cn'

export interface SkeletonProps {
  /** Size/shape via utility classes, e.g. `h-4 w-24` or `size-8 rounded-full`. */
  className?: string
}

/**
 * A pulsing placeholder block. Compose several to sketch a loading layout
 * that matches the loaded content's silhouette.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn('block animate-pulse rounded-md bg-sunken', className)}
    />
  )
}
