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

interface MalpracticeCounts {
  'tab-switch': number
  'window-focus': number
  'keyboard-shortcut': number
  'right-click': number
  'dev-tools': number
  total: number
}

export default function MalpracticeDetector({ examId, onTerminate, onWarningCountUpdate }: MalpracticeDetectorProps) {
  const router = useRouter()
  const isTerminated = useRef(false)
  const isToasting = useRef(false)
  const lastEventTime = useRef<Record<MalpracticeType, number>>({
    'tab-switch': 0,
    'window-focus': 0,
    'keyboard-shortcut': 0,
    'right-click': 0,
    'dev-tools': 0
  })
  const [malpracticeCounts, setMalpracticeCounts] = useState<MalpracticeCounts>({
    'tab-switch': 0,
    'window-focus': 0,
    'keyboard-shortcut': 0,
    'right-click': 0,
    'dev-tools': 0,
    total: 0
  })

  const canProcessEvent = (type: MalpracticeType) => {
    if (isToasting.current) return false
    
    const now = Date.now()
    if (now - lastEventTime.current[type] < 3000) { // 3 second cooldown
      return false
    }
    lastEventTime.current[type] = now
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
      if (!mounted || isTerminated.current || !document.hidden || !canProcessEvent('tab-switch')) return
      handleMalpractice('tab-switch')
    }

    const handleFocusChange = () => {
      if (!mounted || isTerminated.current || document.hasFocus() || !canProcessEvent('window-focus')) return
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
      
      if (
        (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
        const eventType = e.key === 'F12' || (e.ctrlKey && e.shiftKey) ? 'dev-tools' : 'keyboard-shortcut'
        if (!canProcessEvent(eventType)) return
        handleMalpractice(eventType)
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
      if (!mounted || isTerminated.current || !canProcessEvent('right-click')) return
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

    setMalpracticeCounts(prev => {
      // Don't update if we've already reached the total limit
      if (prev.total >= 10) return prev

      const newCounts = {
        ...prev,
        [type]: prev[type] + 1,
        total: prev.total + 1
      }
      
      // Update the warning count in parent component if the callback exists
      if (onWarningCountUpdate) {
        onWarningCountUpdate(newCounts.total)
      }
      
      // Show specific message based on malpractice type
      const message = (() => {
        switch (type) {
          case 'tab-switch':
            return `Warning: Switching tabs detected (${newCounts.total}/10)`
          case 'window-focus':
            return `Warning: Window focus lost (${newCounts.total}/10)`
          case 'keyboard-shortcut':
            return `Warning: Restricted keyboard shortcut used (${newCounts.total}/10)`
          case 'right-click':
            return `Warning: Right-click detected (${newCounts.total}/10)`
          case 'dev-tools':
            return `Warning: Developer tools detected (${newCounts.total}/10)`
        }
      })()

      showToast(message)

      // Check if total has reached 10 attempts
      if (newCounts.total >= 10 && !isTerminated.current) {
        isTerminated.current = true
        showToast('Multiple violations detected. Your exam will be terminated.')
        
        // Give the user a moment to see the message before terminating
        setTimeout(() => {
          onTerminate();
          router.push('/dashboard')
        }, 3000)
      }

      return newCounts
    })
  }

  return null
} 