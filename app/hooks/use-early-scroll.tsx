import { useCallback, useRef } from "react"

export function useEarlyScroll() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])
  return { scrollToTop }
}
