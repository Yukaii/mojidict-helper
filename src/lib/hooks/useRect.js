// From https://gist.github.com/morajabi/523d7a642d8c0a2f71fcfa0d8b3d2846#gistcomment-3874273

import { useState, useRef, useEffect } from 'react'

export const useRect = () => {
  const ref = useRef()
  const [rect, setRect] = useState({})

  const set = () =>
    setRect(ref && ref.current ? ref.current.getBoundingClientRect() : {})

  const useEffectInEvent = (event, useCapture) => {
    useEffect(() => {
      set()
      window.addEventListener(event, set, useCapture)
      return () => window.removeEventListener(event, set, useCapture)
    }, [])
  }

  useEffectInEvent('resize')
  useEffectInEvent('scroll', true)

  return [rect, ref]
}

export default useRect
