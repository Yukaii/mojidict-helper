import { useEffect } from 'react'

export const useEvent = (event, callback, useCapture) => {
  useEffect(() => {
    callback()
    window.addEventListener(event, callback, useCapture)
    return () => window.removeEventListener(event, callback, useCapture)
  }, [])
}

export default useEvent
