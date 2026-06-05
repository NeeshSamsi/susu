import { useRef, useEffect, useMemo, useState } from 'react'
import gsap from 'gsap'
import type { ExperimentProps } from '../types'

const BASE_PATHS = [
  'M139.538 99.7005L140.942 104.913L142.775 111.519C143.544 114.291 145.656 113.093 145.962 114.195C146.109 114.726 145.832 115.245 145.093 115.925C144.082 116.838 142.081 118.129 140.98 118.414C139.879 118.699 139.239 118.213 138.718 116.639L138.394 115.624C137.361 118.129 135.161 119.919 133.038 120.469C128.792 121.568 125.624 119.416 124.276 114.556L122.896 109.582C122.169 106.962 120.355 107.717 120.039 106.577C119.902 106.084 120.104 105.747 120.932 105.085C122.372 103.898 124.95 102.255 125.579 102.092C126.208 101.929 126.578 102.199 126.8 102.997L128.204 108.209L129.51 112.917C130.311 115.803 131.642 117.412 133.99 116.763C136.064 116.186 137.636 113.5 136.741 110.273L135.635 106.286C134.908 103.666 133.094 104.42 132.778 103.281C132.641 102.788 132.843 102.451 133.67 101.789C135.111 100.602 137.689 98.9582 138.318 98.7954C138.947 98.6326 139.317 98.9031 139.538 99.7005Z',
  'M107.193 120.256C104.111 119.443 102.501 118.237 101.391 117.944C100.2 117.63 99.8259 118.355 99.004 118.138C98.2232 117.932 97.8622 117.316 98.048 115.5C98.2478 113.47 98.4256 111.521 98.8338 109.373C99.09 108.269 99.4827 107.635 100.264 107.841C101.003 108.036 101.2 108.609 101.609 110.018C102.184 112.6 103.717 116.519 108.361 117.745C111.402 118.547 113.172 117.062 113.771 115.181C114.613 112.409 111.569 110.001 108.59 107.349C104.716 103.94 101.499 101.355 102.799 96.5787C103.999 92.1663 109.182 89.6294 115.264 91.2347C117.278 91.7662 118.809 92.7776 119.754 93.0271C120.781 93.2983 121.182 92.7966 122.004 93.0136C122.744 93.2088 123.085 93.7329 122.982 95.5712C122.925 97.0748 122.802 98.8213 122.482 100.646C122.267 101.761 121.833 102.384 120.97 102.156C120.313 101.982 119.963 101.326 119.501 99.9458C118.685 97.6043 117.159 94.4683 113.954 93.6223C111.324 92.9281 109.489 94.0058 108.938 96.0298C108.234 98.6206 110.235 100.494 113.925 103.767C118.012 107.363 121.487 109.972 120.295 114.516C118.902 119.962 112.741 121.721 107.193 120.256Z',
  'M95.5383 87.7005L96.9423 92.9125L98.7754 99.5192C99.5444 102.291 101.656 101.093 101.962 102.195C102.109 102.726 101.832 103.245 101.093 103.925C100.082 104.838 98.0809 106.129 96.98 106.414C95.8792 106.699 95.2388 106.213 94.7177 104.639L94.3939 103.624C93.3614 106.129 91.1611 107.919 89.038 108.469C84.7918 109.568 81.6244 107.416 80.2759 102.556L78.8959 97.5823C78.169 94.9624 76.3555 95.7166 76.0394 94.5775C75.9025 94.0839 76.104 93.7469 76.9317 93.085C78.3723 91.8983 80.9503 90.2545 81.5793 90.0918C82.2084 89.929 82.5784 90.1995 82.7997 90.9968L84.2036 96.2089L85.51 100.917C86.3106 103.803 87.642 105.412 89.9904 104.763C92.0637 104.186 93.6362 101.5 92.7407 98.2728L91.6345 94.286C90.9076 91.6661 89.0942 92.4202 88.7781 91.2811C88.6412 90.7875 88.8426 90.4505 89.6704 89.7887C91.111 88.602 93.6889 86.9582 94.318 86.7954C94.9471 86.6326 95.3171 86.9031 95.5383 87.7005Z',
  'M62.8255 108.273C59.8665 107.487 58.3209 106.321 57.2557 106.038C56.1116 105.734 55.7529 106.435 54.9639 106.225C54.2143 106.026 53.8677 105.431 54.0461 103.675C54.2379 101.713 54.4085 99.8287 54.8004 97.7519C55.0464 96.6849 55.4234 96.0721 56.173 96.2713C56.8831 96.46 57.0719 97.0135 57.4649 98.3762C58.017 100.872 59.4885 104.66 63.9466 105.845C66.8661 106.621 68.5648 105.185 69.1406 103.367C69.9489 100.687 67.026 98.3588 64.1666 95.7954C60.4477 92.5003 57.3592 90.0019 58.6066 85.3844C59.7589 81.1191 64.7345 78.6667 70.5734 80.2186C72.5066 80.7323 73.9762 81.7101 74.8836 81.9512C75.8699 82.2134 76.2546 81.7284 77.0437 81.9381C77.7538 82.1269 78.0821 82.6335 77.9826 84.4105C77.9282 85.864 77.8104 87.5523 77.5031 89.316C77.2965 90.3935 76.8801 90.9958 76.0516 90.7756C75.4204 90.6079 75.0844 89.9733 74.6413 88.6393C73.8574 86.3759 72.393 83.3444 69.3157 82.5266C66.7907 81.8555 65.0293 82.8972 64.5007 84.8538C63.8242 87.3582 65.7453 89.1689 69.288 92.3334C73.212 95.8088 76.5477 98.331 75.4031 102.724C74.0655 107.989 68.1516 109.688 62.8255 108.273Z',
]

const IDLE_ROTATION = 4
const IDLE_DURATION = 0.2
const MAX_PUSH = 40

function startIdle(el: SVGPathElement, globalIdx: number, overwrite?: boolean | 'auto') {
  const dir = globalIdx % 2 === 0 ? -1 : 1
  const delay = (globalIdx % 4) * (IDLE_DURATION / 2)
  gsap.set(el, { rotation: dir * IDLE_ROTATION, transformOrigin: '50% 50%' })
  gsap.to(el, {
    rotation: -dir * IDLE_ROTATION,
    transformOrigin: '50% 50%',
    duration: IDLE_DURATION,
    repeat: -1,
    yoyo: true,
    ease: 'power2.inOut',
    delay,
    overwrite,
  })
}

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#000C31]/60 text-xs">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-0 min-w-0 flex-1 h-[3px] appearance-none rounded-full cursor-pointer
            bg-[#000C31]/15
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#000C31]"
        />
        <span className="text-[#000C31] text-xs w-8 text-right tabular-nums shrink-0">{display}</span>
      </div>
    </div>
  )
}

export default function PatternWiggle({ isPlaying }: ExperimentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const allShapesRef = useRef<SVGPathElement[]>([])
  const radiusRef = useRef(80)
  const [radius, setRadius] = useState(80)
  const rafRef = useRef<number | null>(null)
  const inRadiusRef = useRef<Set<number>>(new Set())

  useEffect(() => { radiusRef.current = radius }, [radius])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setCanvasSize({ w: el.clientWidth, h: el.clientHeight })
  }, [])

  const cells = useMemo(() => {
    if (!canvasSize.w) return []
    const result: { i: number; j: number; x: number; y: number }[] = []
    for (let i = -5; i <= 20; i++) {
      for (let j = -5; j <= 20; j++) {
        const x = i * (-24) + j * 68
        const y = i * 32 + j * 56
        if ((x > canvasSize.w + 200 || x < -200) && (y > canvasSize.h + 200 || y < -200)) continue
        result.push({ i, j, x, y })
      }
    }
    return result
  }, [canvasSize])

  useEffect(() => {
    if (!svgRef.current || !cells.length) return
    const shapes = Array.from(svgRef.current.querySelectorAll<SVGPathElement>('[data-pattern-shape]'))
    allShapesRef.current = shapes
    shapes.forEach((el, idx) => startIdle(el, idx))

    const container = containerRef.current
    if (!container) return

    const onMouseMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const allShapes = allShapesRef.current
        const r = radiusRef.current
        const nowInRadius = new Set<number>()

        allShapes.forEach((shape, i) => {
          const rect = shape.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = cx - e.clientX
          const dy = cy - e.clientY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < r) {
            nowInRadius.add(i)
            const repelStrength = (1 - dist / r) * MAX_PUSH
            const len = dist || 1
            gsap.to(shape, {
              x: (dx / len) * repelStrength,
              y: (dy / len) * repelStrength,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            })
            // Only start wiggle on entry, not every frame
            if (!inRadiusRef.current.has(i)) {
              gsap.to(shape, {
                rotation: 25,
                transformOrigin: '50% 50%',
                duration: 0.06,
                repeat: -1,
                yoyo: true,
                ease: 'power2.inOut',
                overwrite: 'auto',
              })
            }
          }
        })

        inRadiusRef.current.forEach(i => {
          if (!nowInRadius.has(i)) {
            const shape = allShapes[i]
            gsap.to(shape, { x: 0, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
            startIdle(shape, i, true)
          }
        })
        inRadiusRef.current = nowInRadius
      })
    }

    const onMouseLeave = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      const allShapes = allShapesRef.current
      gsap.to(allShapes, { x: 0, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
      allShapes.forEach((el, idx) => startIdle(el, idx))
      inRadiusRef.current = new Set()
    }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    return () => {
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      gsap.killTweensOf(shapes)
    }
  }, [cells])

  useEffect(() => {
    const shapes = allShapesRef.current
    if (!shapes.length) return
    if (isPlaying) {
      shapes.forEach((el, idx) => startIdle(el, idx))
    } else {
      gsap.killTweensOf(shapes)
    }
  }, [isPlaying])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden" style={{ background: '#FFFAEF' }}>
      {canvasSize.w > 0 && (
        <svg ref={svgRef} width={canvasSize.w} height={canvasSize.h} style={{ display: 'block' }}>
          {cells.map(({ i, j, x, y }) => (
            <g key={`${i}-${j}`} transform={`translate(${x}, ${y})`}>
              {BASE_PATHS.map((d, si) => (
                <path
                  key={`${i}-${j}-${si}`}
                  data-pattern-shape=""
                  fill="#1C42FF"
                  d={d}
                  style={{ transformOrigin: '50% 50%' }}
                />
              ))}
            </g>
          ))}
        </svg>
      )}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-44 overflow-hidden bg-[#FFFAEF] border border-[#000C31]/12 rounded-2xl px-5 py-4 shadow-sm">
        <Slider label="Radius" value={radius} min={40} max={300} step={10} display={`${radius}px`} onChange={setRadius} />
      </div>
    </div>
  )
}
