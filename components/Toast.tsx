'use client'

import { useEffect, useState } from 'react'

let toastTimeout: ReturnType<typeof setTimeout>

type ToastState = { message: string; visible: boolean }

let setGlobalToast: ((state: ToastState) => void) | null = null

export function showToast(message: string) {
  if (setGlobalToast) {
    clearTimeout(toastTimeout)
    setGlobalToast({ message, visible: true })
    toastTimeout = setTimeout(() => {
      setGlobalToast?.({ message: '', visible: false })
    }, 2800)
  }
}

export default function Toast() {
  const [state, setState] = useState<ToastState>({ message: '', visible: false })

  useEffect(() => {
    setGlobalToast = setState
    return () => {
      setGlobalToast = null
    }
  }, [])

  if (!state.visible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl text-sm font-semibold text-white shadow-2xl max-w-sm"
      style={{ background: 'var(--sidebar)' }}
    >
      {state.message}
    </div>
  )
}
