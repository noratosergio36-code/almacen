import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Always match the server render — sync from localStorage after mount
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) setStoredValue(JSON.parse(item) as T)
    } catch {}
  }, [key])

  function setValue(value: T | ((prev: T) => T)) {
    const next = value instanceof Function ? value(storedValue) : value
    setStoredValue(next)
    try {
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }

  return [storedValue, setValue]
}
