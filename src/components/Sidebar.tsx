import { useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'

type SidebarProps = {
  isOpen: boolean
  experiments: Record<string, { title: string }>
}

export default function Sidebar({ isOpen, experiments }: SidebarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [params, setParams] = useSearchParams()
  const active = params.get('experiment') ?? Object.keys(experiments)[0]

  useEffect(() => {
    gsap.to(ref.current, {
      x: isOpen ? 0 : -240,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [isOpen])

  return (
    <div
      ref={ref}
      className="absolute left-0 top-0 bottom-0 w-60 bg-[#111] border-r border-white/10 z-40 flex flex-col pt-2"
      style={{ transform: 'translateX(-240px)' }}
    >
      <p className="text-white/30 text-xs uppercase tracking-widest px-4 py-2">Experiments</p>
      <ul className="flex flex-col gap-0.5 px-2">
        {Object.entries(experiments).map(([id, { title }]) => (
          <li key={id}>
            <button
              onClick={() => setParams({ experiment: id })}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                active === id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
