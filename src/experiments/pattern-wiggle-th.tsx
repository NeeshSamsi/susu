import { useRef, useEffect, useMemo, useState } from 'react'
import gsap from 'gsap'
import type { ExperimentProps } from '../types'

const BASE_PATHS = [
  'M94.4337 115.593L93.8135 115.992L92.5173 120.829C92.3975 121.276 92.0946 121.64 91.6088 121.921C91.091 122.192 90.5841 122.296 90.088 122.232C88.0951 122.006 86.1792 121.492 84.3402 120.692C83.3293 120.25 82.8372 119.468 82.8641 118.345L83.6984 115.232C83.7668 114.977 83.7383 114.764 83.6129 114.593C83.4555 114.414 83.3577 114.268 83.3195 114.155C83.2494 114.034 83.3007 113.842 83.4736 113.58C83.6464 113.319 83.9095 113.167 84.2631 113.124C85.9498 112.96 87.1444 112.972 87.8469 113.161C88.5175 113.34 88.7758 113.718 88.6218 114.292L87.3255 119.13C87.1886 119.641 87.2798 119.939 87.5991 120.025C87.9185 120.11 88.1466 119.898 88.2835 119.387L89.6439 114.31C89.6696 114.214 89.7591 114.135 89.9125 114.074C90.0254 114.035 90.1297 114.029 90.2255 114.055C91.4988 114.156 92.7601 114.494 94.0095 115.069C94.1372 115.103 94.268 115.189 94.402 115.328C94.5041 115.458 94.5146 115.546 94.4337 115.593Z',
  'M88.8763 87.3173C88.8763 87.3173 90.883 87.3173 94.8963 87.3173C95.1639 87.3173 95.398 87.4162 95.5987 87.6142C95.7993 87.8121 95.8997 88.043 95.8997 88.307C95.8997 89.9234 95.6321 91.276 95.097 92.3647C94.5953 93.4204 93.9766 94.0307 93.2408 94.1956C93.8763 95.2843 94.2609 96.0925 94.3947 96.6204C94.6957 98.4018 94.8629 100.249 94.8963 102.163L94.9465 107.804C94.9465 108.563 95.2141 109.156 95.7492 109.585C95.9164 109.717 96 109.882 96 110.08C96 110.278 95.8829 110.493 95.6488 110.723C95.4482 110.954 95.2141 111.07 94.9465 111.07C92.5719 111.334 90.3813 111.334 88.3747 111.07C87.3713 110.938 86.8697 110.278 86.8697 109.091V102.113C86.8697 101.882 86.9031 101.387 86.97 100.629C85.8998 100.86 84.8965 101.255 83.96 101.816C83.0236 102.344 82.5553 103.02 82.5553 103.845V104.736C82.5553 105.594 82.6557 106.22 82.8563 106.616C83.0905 106.979 83.358 107.161 83.659 107.161C83.96 107.128 84.2777 107.029 84.6122 106.864C84.9466 106.666 85.2309 106.682 85.465 106.913C85.9332 107.375 86.0336 107.952 85.766 108.645C85.1306 110.427 83.3915 111.317 80.5487 111.317C78.8096 111.284 77.4551 110.954 76.4852 110.328C75.5487 109.701 74.8464 108.81 74.3782 107.655C73.91 106.501 73.8765 105.247 74.2778 103.895C74.7126 102.542 75.3481 101.519 76.1842 100.827C77.0203 100.101 78.1741 99.5894 79.6457 99.2925C81.1172 98.9626 82.4717 98.8307 83.7092 98.8966C84.9466 98.9296 86.0503 98.9791 87.0202 99.0451C87.0536 97.1317 86.4182 95.6307 85.1138 94.542C84.5787 94.0801 84.0269 93.8657 83.4583 93.8987C82.8898 93.9317 82.3881 94.1626 81.9533 94.5915C81.552 95.0204 81.1172 95.5812 80.649 96.274C80.2142 96.9667 79.9132 97.4121 79.746 97.61C79.5788 97.775 79.3948 97.9894 79.1942 98.2533C78.9935 98.4843 78.7928 98.6327 78.5922 98.6987C77.2544 99.2595 76.134 99.2595 75.231 98.6987C74.8631 98.4678 74.5788 98.1049 74.3782 97.61C74.1775 97.0822 74.1273 96.6039 74.2277 96.175C74.4618 95.0863 75.0638 94.1131 76.0337 93.2554C77.037 92.3977 78.1407 91.7379 79.3447 91.276C82.0871 90.2533 84.8797 90.0389 87.7225 90.6327C87.8228 89.9399 87.873 89.3131 87.873 88.7523C87.873 87.7956 88.2074 87.3173 88.8763 87.3173Z',
  'M80.239 80.0031C81.9525 79.3729 83.8684 78.8595 85.9868 78.463C86.2508 78.4265 86.5042 78.4784 86.7472 78.6186C86.9901 78.7589 87.1287 78.8929 87.1629 79.0206C87.1886 79.1164 87.5456 80.3212 88.2341 82.6351C89.0683 82.172 89.7288 81.6357 90.2158 81.0261C90.6941 80.3845 91.185 79.5343 91.6884 78.4753C91.9051 78.0066 92.3572 77.7143 93.0449 77.5985C93.7326 77.4827 94.345 77.6608 94.8822 78.1329C95.4109 78.5731 95.619 79.0307 95.5067 79.5057C95.0849 81.1246 94.3529 82.4159 93.3106 83.3797C92.932 83.7549 92.2714 84.2913 91.3289 84.9888C89.141 86.0199 87.0997 86.7038 85.2049 87.0404C84.4619 87.2052 83.9455 87.258 83.6559 87.1988C83.3342 87.148 83.1649 87.0907 83.1478 87.0269C83.1221 86.9311 83.0183 86.4798 82.8363 85.6729C82.3845 83.6036 81.7754 82.6716 81.0091 82.877C80.6898 82.9625 80.3904 82.8032 80.1109 82.3989C79.791 81.9713 79.6307 81.5008 79.6301 80.9876C79.5976 80.483 79.8005 80.1548 80.239 80.0031Z',
  'M123.293 117.412L122.955 118.067L124.252 122.905C124.371 123.352 124.291 123.818 124.011 124.304C123.698 124.798 123.311 125.142 122.849 125.334C121.01 126.135 119.094 126.648 117.101 126.874C116.005 126.997 115.188 126.565 114.65 125.58L113.816 122.467C113.747 122.211 113.616 122.041 113.422 121.956C113.196 121.88 113.039 121.802 112.949 121.724C112.828 121.653 112.776 121.462 112.795 121.149C112.814 120.836 112.966 120.573 113.251 120.359C114.63 119.374 115.67 118.787 116.373 118.599C117.043 118.419 117.456 118.617 117.61 119.191L118.906 124.029C119.043 124.54 119.271 124.753 119.59 124.667C119.909 124.582 120.001 124.283 119.864 123.772L118.503 118.695C118.478 118.599 118.516 118.487 118.618 118.357C118.697 118.267 118.784 118.209 118.88 118.184C120.033 117.635 121.295 117.297 122.664 117.17C122.791 117.136 122.948 117.145 123.133 117.198C123.287 117.26 123.34 117.331 123.293 117.412Z',
  'M119.428 90.5909C119.428 90.5909 121.344 91.1042 125.176 92.131C125.431 92.1994 125.629 92.3551 125.769 92.598C125.91 92.8409 125.946 93.0901 125.877 93.3456C125.458 94.9103 124.852 96.151 124.058 97.0679C123.306 97.9613 122.557 98.3938 121.811 98.3652C122.136 99.5815 122.293 100.462 122.284 101.007C122.109 102.809 121.79 104.64 121.326 106.5L119.91 111.974C119.714 112.708 119.815 113.351 120.215 113.903C120.34 114.074 120.377 114.255 120.326 114.446C120.275 114.638 120.107 114.816 119.824 114.979C119.572 115.151 119.319 115.203 119.063 115.135C116.728 114.783 114.636 114.222 112.789 113.453C111.865 113.069 111.557 112.302 111.865 111.153L113.675 104.399C113.735 104.175 113.895 103.705 114.156 102.988C113.074 102.937 112.013 103.064 110.974 103.367C109.943 103.639 109.32 104.173 109.106 104.972L108.875 105.834C108.653 106.664 108.586 107.296 108.675 107.731C108.805 108.142 109.013 108.386 109.3 108.463C109.596 108.508 109.925 108.494 110.287 108.42C110.658 108.314 110.925 108.402 111.089 108.686C111.416 109.253 111.362 109.837 110.927 110.439C109.858 112.001 107.967 112.418 105.253 111.691C103.601 111.214 102.393 110.548 101.63 109.693C100.898 108.847 100.458 107.805 100.311 106.568C100.163 105.33 100.457 104.108 101.19 102.902C101.956 101.704 102.828 100.877 103.806 100.42C104.793 99.9313 106.027 99.7315 107.509 99.8206C109 99.8778 110.327 100.097 111.492 100.477C112.664 100.826 113.705 101.156 114.614 101.468C115.142 99.6243 114.925 98.0088 113.962 96.6214C113.571 96.0374 113.1 95.6887 112.548 95.5752C111.997 95.4616 111.458 95.5568 110.932 95.8607C110.437 96.1732 109.877 96.6048 109.25 97.1555C108.655 97.7149 108.252 98.069 108.041 98.2178C107.839 98.3346 107.608 98.4951 107.348 98.6993C107.096 98.8715 106.866 98.9638 106.657 98.9763C105.235 99.1769 104.165 98.8903 103.448 98.1164C103.157 97.7988 102.979 97.3748 102.916 96.8445C102.862 96.2823 102.938 95.8064 103.145 95.417C103.651 94.4231 104.478 93.6351 105.626 93.053C106.807 92.4795 108.032 92.1232 109.301 91.9842C112.185 91.6959 114.906 92.2028 117.467 93.5048C117.742 92.8599 117.953 92.266 118.098 91.7232C118.346 90.7972 118.79 90.4197 119.428 90.5909Z',
  'M111.068 82.1198C112.895 81.9601 114.887 81.9601 117.046 82.1198C117.312 82.1518 117.544 82.2636 117.743 82.4554C117.943 82.6471 118.042 82.8069 118.042 82.9348C118.042 83.0306 118.076 84.245 118.142 86.5779C119.072 86.3542 119.852 86.0186 120.483 85.5712C121.114 85.0919 121.812 84.4208 122.576 83.5579C122.908 83.1744 123.422 83.0146 124.12 83.0786C124.817 83.1425 125.365 83.4621 125.764 84.0373C126.162 84.5806 126.245 85.0599 126.013 85.4754C125.183 86.8815 124.137 87.9041 122.874 88.5433C122.41 88.7989 121.629 89.1345 120.533 89.5499C118.142 89.9654 115.983 90.0932 114.057 89.9334C113.293 89.9015 112.778 89.8216 112.513 89.6937C112.214 89.5659 112.064 89.47 112.064 89.4061C112.064 89.3103 112.081 88.8628 112.114 88.0639C112.214 86.0186 111.865 84.996 111.068 84.996C110.736 84.996 110.487 84.7723 110.321 84.3249C110.121 83.8455 110.088 83.3662 110.221 82.8868C110.321 82.4075 110.603 82.1518 111.068 82.1198Z',
]

const IDLE_ROTATION = 4
const IDLE_DURATION = 0.2
const MAX_PUSH = 40

function startIdle(el: SVGPathElement, globalIdx: number, overwrite?: boolean | 'auto') {
  const dir = globalIdx % 2 === 0 ? -1 : 1
  const delay = (globalIdx % 6) * (IDLE_DURATION / 3)
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

export default function PatternWiggleTH({ isPlaying }: ExperimentProps) {
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
                  fill="#000C31"
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
