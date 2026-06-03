import { Play, Pause, RotateCcw } from 'lucide-react'

type ControlsProps = {
  isPlaying: boolean
  onToggle: () => void
  onReset: () => void
  hideToggle?: boolean
  showReset?: boolean
}

export default function Controls({ isPlaying, onToggle, onReset, hideToggle, showReset = true }: ControlsProps) {
  if (hideToggle && !showReset) return null

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#000C31]/8 backdrop-blur border border-[#000C31]/15 rounded-full px-5 py-2.5 text-[#000C31] text-sm select-none">
      {!hideToggle && (
        <button onClick={onToggle} className="w-8 flex justify-center hover:opacity-60 transition-opacity">
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
      )}
      {showReset && (
        <button onClick={onReset} className="flex items-center hover:opacity-60 transition-opacity">
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  )
}
