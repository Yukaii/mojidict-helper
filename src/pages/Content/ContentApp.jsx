import create from 'zustand'
import { useQuery } from 'react-query'
import { useEffect, useMemo, useCallback, Fragment } from 'react'

import store, { searchFromSelection } from '../../lib/store'
import { fetchWord, search } from './api'
import useRect from '../../lib/hooks/useRect'
import useEvent from '../../lib/hooks/useEvent'
import useSelectionRect from '../../lib/hooks/useSelectionRect'

const useStore = create(store)

export const ContentApp = () => {
  const [showCard, setShowCard] = useStore((state) => [
    state.showCard,
    state.setShowCard,
  ])
  const searchKeyword = useStore((state) => state.searchKeyword)

  const canShowCard = showCard && searchKeyword

  const [cardRect, cardContainerRef] = useRect()
  const [selectionRect, updateSelectionReact] = useSelectionRect()

  useEvent('resize', updateSelectionReact)
  useEvent('scroll', updateSelectionReact, true)
  useEvent('dblclick', () => {
    searchFromSelection()
    updateSelectionReact()
  })

  const style = useMemo(() => {
    if (selectionRect && canShowCard) {
      let translateX, translateY
      const { right, left, top, bottom, height, width } = selectionRect
      const { width: cardWidth = 300, height: cardHeight = 300 } = cardRect

      if (left + width + cardWidth > window.innerWidth) {
        translateX = right - window.pageXOffset - cardWidth
      } else {
        translateX = left + window.pageXOffset
      }

      if (top + cardHeight + height > window.innerHeight) {
        translateY = bottom + window.pageYOffset - height - 5 - cardHeight
      } else {
        translateY = top + window.pageYOffset + height + 5
      }

      return {
        transform: `translate(${translateX}px, ${translateY}px`,
      }
    } else {
      return {}
    }
  }, [selectionRect, cardRect, canShowCard])

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

          const result = await fetchWord(wordId).then((r) => r?.result)

          return {
            ...result,
            wordId,
          }
        }
      } catch {
        return null
      }
    },
    {
      enabled: !!searchKeyword,
    }
  )

  useEffect(() => {
    if (cardContainerRef.current && showCard) {
      updateSelectionReact()
    }
  }, [cardContainerRef, updateSelectionReact, showCard])

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

  const renderDetails = useCallback(() => {
    if (!data) {
      return null
    }

    const { details, subdetails } = data

    return details.map((detail) => {
      const subDetails = subdetails.filter(
        (sub) => sub.detailsId === detail.objectId
      )

      return (
        <Fragment key={detail.objectId}>
          <span className="detail-title" title={detail.title}>
            {detail.title}
          </span>
          {subDetails.map((subdetail, index) => (
            <p title={subdetail.title} key={index}>
              {index + 1}. {subdetail.title}
            </p>
          ))}
        </Fragment>
      )
    })
  }, [data])

  const word = data && data.word

  if (!canShowCard) {
    return null
  }

  return (
    <div style={style} className="mojidict-helper-card" ref={cardContainerRef}>
      <div className="close-button" onClick={() => setShowCard(false)} />

      {word && (
        <div className="word-detail-container">
          <div className="word-title" title={searchKeyword}>
            {searchKeyword}
          </div>
          <div className="word-spell">
            {word.spell} | {word.pron} {word.accent}
          </div>

          <div className="word-detail">{renderDetails()}</div>

          <div className="button-group">
            <a
              className="moji-button"
              href={`https://www.mojidict.com/details/${data?.wordId}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              詳情
            </a>
            <a
              className="moji-button"
              href={`https://www.mojidict.com/searchText/${encodeURIComponent(
                word?.spell
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              更多
            </a>
          </div>
        </div>
      )}

      {!word && (
        <div className="loading-container">
          <div className="word-detail-container">
            <div className="word-title" title={searchKeyword}>
              {searchKeyword}
            </div>
          </div>

          {isLoading ? (
            <div
              className="loading-placeholder"
              style={{
                backgroundImage: `url(${chrome.runtime.getURL(
                  'images/loading.gif'
                )})`,
              }}
            />
          ) : (
            <div className="no-result">沒有結果</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ContentApp
