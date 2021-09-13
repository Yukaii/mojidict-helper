import create from 'zustand'
import { useQuery } from 'react-query'
import { useRef, useEffect, useMemo, useCallback, Fragment } from 'react'

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

  if (!showCard || !searchKeyword) {
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
