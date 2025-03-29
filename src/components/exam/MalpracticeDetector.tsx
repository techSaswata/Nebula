"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MalpracticeDetectorProps {
  examId: string
  onTerminate: () => void
  onWarningCountUpdate?: (count: number) => void
}

type MalpracticeType = 'tab-switch' | 'window-focus' | 'keyboard-shortcut' | 'right-click' | 'dev-tools'

export default function MalpracticeDetector({ examId, onTerminate, onWarningCountUpdate }: MalpracticeDetectorProps) {
  const router = useRouter()
  const isTerminated = useRef(false)
  const isToasting = useRef(false)
  const lastEventTime = useRef<number>(0)
  const [warningCount, setWarningCount] = useState(0)

  const canProcessEvent = () => {
    if (isToasting.current) return false
    
    const now = Date.now()
    if (now - lastEventTime.current < 2000) { // 2 second cooldown
      return false
    }
    lastEventTime.current = now
    return true
  }

  const showToast = (message: string) => {
    if (isToasting.current) return
    isToasting.current = true
    toast.error(message)
    setTimeout(() => {
      isToasting.current = false
    }, 1000)
  }

  // Handle tab switching and window focus
  useEffect(() => {
    let mounted = true
    if (isTerminated.current) return

    const handleVisibilityChange = () => {
      if (!mounted || isTerminated.current || !document.hidden || !canProcessEvent()) return
      handleMalpractice('tab-switch')
    }

    const handleFocusChange = () => {
      if (!mounted || isTerminated.current || document.hasFocus() || !canProcessEvent()) return
      handleMalpractice('window-focus')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleFocusChange)

    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleFocusChange)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    let mounted = true
    if (isTerminated.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mounted || isTerminated.current) return
      
      // Block keyboard shortcuts
      if (
        (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'x') ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault()
        if (!canProcessEvent()) return
        showToast('Warning: Restricted keyboard shortcuts are not allowed during the exam.')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      mounted = false
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Handle right-click
  useEffect(() => {
    let mounted = true
    if (isTerminated.current) return

    const handleContextMenu = (e: MouseEvent) => {
      if (!mounted || isTerminated.current || !canProcessEvent()) return
      e.preventDefault()
      handleMalpractice('right-click')
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      mounted = false
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  const handleMalpractice = (type: MalpracticeType) => {
    if (isTerminated.current) return

    setWarningCount(prev => {
      // Don't update if we've already reached the total limit
      if (prev >= 10) return prev

      const newCount = prev + 1
      
      // Update the warning count in parent component if the callback exists
      if (onWarningCountUpdate) {
        onWarningCountUpdate(newCount)
      }
      
      // Show specific message based on malpractice type
      const message = (() => {
        switch (type) {
          case 'tab-switch':
            return `Warning: Switching tabs detected (${newCount}/10)`
          case 'window-focus':
            return `Warning: Window focus lost (${newCount}/10)`
          case 'right-click':
            return `Warning: Right-click detected (${newCount}/10)`
          case 'dev-tools':
            return `Warning: Developer tools detected (${newCount}/10)`
          default:
            return `Warning: Malpractice detected (${newCount}/10)`
        }
      })()

      showToast(message)

      // Check if total has reached 10 attempts
      if (newCount >= 10 && !isTerminated.current) {
        isTerminated.current = true
        showToast('Multiple violations detected. Your exam will be terminated.')
        
        // Give the user a moment to see the message before terminating
        setTimeout(() => {
          onTerminate();
          router.push('/dashboard')
        }, 3000)
      }

      return newCount
    })
  }

  return null
} 