import { useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  function setValue(value: T | ((prev: T) => T)) {
    const next = value instanceof Function ? value(storedValue) : value
    setStoredValue(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(next))
    }
  }

  return [storedValue, setValue]
}
