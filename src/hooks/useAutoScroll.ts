import { useEffect, useRef, useCallback } from 'react'

/**
 * Auto-scrolls a container to the bottom when new content is added,
 * but only if user is already near the bottom.
 */
export function useAutoScroll<T>(deps: T[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      const threshold = 100
      isNearBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to bottom when deps change and user is near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps])

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  return { containerRef, scrollToBottom }
}
