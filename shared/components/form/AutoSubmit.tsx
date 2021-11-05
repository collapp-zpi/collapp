import { useFormContext } from 'react-hook-form'
import { useEffect, useRef } from 'react'

export const AutoSubmit = ({ time = 500 }) => {
  const { watch } = useFormContext()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const submitRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const subscription = watch(() => {
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        submitRef?.current?.click()
      }, time)
    })
    return () => {
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef.current)
      }
      subscription.unsubscribe()
    }
  }, [time, watch])

  return <button type="submit" hidden ref={submitRef} />
}
