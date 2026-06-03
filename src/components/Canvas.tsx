import { useState, useCallback } from 'react'
import Controls from './Controls'

type CanvasProps = {
  children: (props: { isPlaying: boolean; onReset: () => void }) => React.ReactNode
  hideToggle?: boolean
  hideReset?: boolean
}

export default function Canvas({ children, hideToggle, hideReset }: CanvasProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [resetKey, setResetKey] = useState(0)

  const handleReset = useCallback(() => {
    setResetKey(k => k + 1)
    setIsPlaying(true)
  }, [])

  return (
    <div className="relative flex-1 flex items-center justify-center bg-[#FFFAEF] overflow-hidden">
      <div key={resetKey} className="contents">
        {children({ isPlaying, onReset: handleReset })}
      </div>
      <Controls
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(p => !p)}
        onReset={handleReset}
        hideToggle={hideToggle}
        showReset={!hideReset}
      />
    </div>
  )
}
