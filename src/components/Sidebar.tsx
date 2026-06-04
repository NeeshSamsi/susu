import { useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'

export type ExperimentGroup = {
  label: string
  items: { id: string; label: string }[]
}

type SidebarProps = {
  isOpen: boolean
  groups: ExperimentGroup[]
  onClose: () => void
}

export default function Sidebar({ isOpen, groups, onClose }: SidebarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [params, setParams] = useSearchParams()
  const active = params.get('experiment') ?? groups[0]?.items[0]?.id ?? ''

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
      className="absolute left-0 top-0 bottom-0 w-60 bg-[#111] border-r border-white/10 z-40 flex flex-col pt-2 overflow-y-auto"
      style={{ transform: 'translateX(-240px)' }}
    >
      <p className="text-white/30 text-xs uppercase tracking-widest px-4 py-2">Experiments</p>
      <ul className="flex flex-col gap-0 px-2 pb-4">
        {groups.map(({ label, items }) => (
          <li key={label} className="mt-1">
            {/* Group label — prominent */}
            <p className="text-white/75 text-sm font-medium px-3 pt-2 pb-1">{label}</p>
            {/* Sub-items — less prominent, indented */}
            <ul className="flex flex-row gap-0.5 pl-3">
              {items.map(({ id, label: itemLabel }) => (
                <li key={id}>
                  <button
                    onClick={() => { setParams({ experiment: id }); onClose() }}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      active === id
                        ? 'bg-white/10 text-white/80'
                        : 'text-white/25 hover:text-white/50 hover:bg-white/5'
                    }`}
                  >
                    {itemLabel}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
