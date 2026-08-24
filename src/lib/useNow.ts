import { useSyncExternalStore } from 'react'

type Listener = () => void

const listeners = new Set<Listener>()
let timer: ReturnType<typeof setInterval> | null = null
let now = Date.now()

function subscribe(listener: Listener) {
  listeners.add(listener)
  if (timer === null) {
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }
}

/**
 * The current time, updating once per second. All subscribers share a single
 * interval, so "updated Ns ago" labels across the page tick in unison instead
 * of drifting against each other.
 */
export function useNow(): Date {
  const ms = useSyncExternalStore(
    subscribe,
    () => now,
    () => now,
  )
  return new Date(ms)
}
