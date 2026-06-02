import { useState, useCallback } from 'react'
import Controls from './Controls'

type CanvasProps = {
  children: (props: { isPlaying: boolean; onReset: () => void }) => React.ReactNode
}

export default function Canvas({ children }: CanvasProps) {
  const [isPlaying, setIsPlaying] = useState(true)

  const handleReset = useCallback(() => {
    setIsPlaying(false)
  }, [])

  return (
    <div className="relative flex-1 flex items-center justify-center bg-[#FFFAEF] overflow-hidden">
      {children({ isPlaying, onReset: handleReset })}
      <Controls
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(p => !p)}
        onReset={handleReset}
      />
    </div>
  )
}
