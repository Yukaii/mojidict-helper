// Modify From https://gist.github.com/morajabi/523d7a642d8c0a2f71fcfa0d8b3d2846#gistcomment-3874273

import { useCallback, useState } from 'react'

export const useSelectionRect = () => {
  const [selectionRect, setRect] = useState({})

  const updateSelection = useCallback(() => {
    const selection = window.getSelection()
    const range = selection.rangeCount > 0 && selection?.getRangeAt(0)

    setRect(range ? range.getBoundingClientRect() : {})
  }, [])

  return [selectionRect, updateSelection]
}

export default useSelectionRect
