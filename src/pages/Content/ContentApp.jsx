import create from 'zustand'
import { useQuery } from 'react-query'
import { useRef, useEffect, useMemo, useCallback } from 'react'

import store from '../../lib/store'
import { fetchWord, search } from './api'

const useStore = create(store)

export const ContentApp = () => {
  const [showCard, setShowCard] = useStore((state) => [
    state.showCard,
    state.setShowCard,
  ])
  const searchKeyword = useStore((state) => state.searchKeyword)
  const selectionRect = useStore((state) => state.selectionRect)

  const style = useMemo(() => {
    if (selectionRect) {
      const translateX = selectionRect.left + window.pageXOffset
      const translateY =
        selectionRect.top + selectionRect.height + window.pageYOffset
      return {
        transform: `translate(${translateX}px, ${translateY}px`,
      }
    } else {
      return {}
    }
  }, [selectionRect])

  const { data = null, isLoading } = useQuery(
    ['searchKeyword', searchKeyword],
    async () => {
      try {
        const res = await search(searchKeyword)

        if (
          (res?.result?.searchResults || []).filter((r) => r.type === 0)
            .length > 0
        ) {
          const wordId = res.result.searchResults[0].tarId

          return fetchWord(wordId)
        }
      } catch {
        return []
      }
    },
    {
      enabled: !!searchKeyword,
    }
  )

  const cardContainerRef = useRef()

  const onClickOutside = useCallback((e) => {
    if (!cardContainerRef.current?.contains(e.target)) {
      setShowCard(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.addEventListener('click', onClickOutside)

    return () => {
      document.removeEventListener('click', onClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!showCard || !searchKeyword) {
    return null
  }

  return (
    <div style={style} className="mojidict-helper-card" ref={cardContainerRef}>
      {isLoading && 'Loading....'}
      the keyword: {searchKeyword}
    </div>
  )
}

export default ContentApp
