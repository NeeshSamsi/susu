import { Play, Pause, RotateCcw } from 'lucide-react'

type ControlsProps = {
  isPlaying: boolean
  onToggle: () => void
  onReset: () => void
  hideToggle?: boolean
  showReset?: boolean
}

export default function Controls({ isPlaying, onToggle, onReset, hideToggle, showReset = true }: ControlsProps) {
  const hasButtons = !hideToggle || showReset

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#000C31]/8 backdrop-blur border border-[#000C31]/15 rounded-full p-1.5 ${hasButtons ? 'pr-5' : 'pr-1.5'} text-[#000C31] text-sm select-none shadow-sm`}>
      <a
        href="/"
        target="_parent"
        title="neeshsamsi.com"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFAEF] border border-[#000C31]/10 shadow-sm hover:scale-125 transition-transform shrink-0"
      >
        <img src="https://neeshsamsi.com/favicon.ico" alt="Home" className="w-4 h-4 rounded-sm" />
      </a>
      
      {hasButtons && (
        <>
          <div className="w-px h-4 bg-[#000C31]/15 shrink-0" />
          {!hideToggle && (
            <button onClick={onToggle} className="w-6 flex justify-center hover:opacity-60 transition-opacity shrink-0">
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}
          {showReset && (
            <button onClick={onReset} className="w-6 flex justify-center hover:opacity-60 transition-opacity shrink-0">
              <RotateCcw size={14} />
            </button>
          )}
        </>
      )}
    </div>
  )
}
