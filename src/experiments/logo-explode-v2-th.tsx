import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import type { ExperimentProps } from '../types'

import v1 from '../assets/logo-variations-th/variation-1.svg?raw'
import v2 from '../assets/logo-variations-th/variation-2.svg?raw'
import v3 from '../assets/logo-variations-th/variation-3.svg?raw'
import v4 from '../assets/logo-variations-th/variation-4.svg?raw'
import v5 from '../assets/logo-variations-th/variation-5.svg?raw'
import v6 from '../assets/logo-variations-th/variation-6.svg?raw'
import v7 from '../assets/logo-variations-th/variation-7.svg?raw'
import v8 from '../assets/logo-variations-th/variation-8.svg?raw'
import v9 from '../assets/logo-variations-th/variation-9.svg?raw'
import v10 from '../assets/logo-variations-th/variation-10.svg?raw'
import v11 from '../assets/logo-variations-th/variation-11.svg?raw'
import v12 from '../assets/logo-variations-th/variation-12.svg?raw'
import v13 from '../assets/logo-variations-th/variation-13.svg?raw'
import v14 from '../assets/logo-variations-th/variation-14.svg?raw'
import v15 from '../assets/logo-variations-th/variation-15.svg?raw'

function extractPaths(raw: string): string[] {
  const paths: string[] = []
  const re = /d="([^"]+)"/g
  let m
  while ((m = re.exec(raw)) !== null) paths.push(m[1])
  return paths
}

const VARIATIONS: string[][] = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15].map(extractPaths)

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

export default function LogoExplodeV2TH({ isPlaying: _isPlaying }: ExperimentProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const hitRef = useRef<SVGRectElement>(null)
  const [outMs, setOutMs] = useState(400)
  const [inMs, setInMs] = useState(400)
  const [currentVariationIdx, setCurrentVariationIdx] = useState(0)

  const outMsRef = useRef(400)
  const inMsRef = useRef(400)
  useEffect(() => { outMsRef.current = outMs }, [outMs])
  useEffect(() => { inMsRef.current = inMs }, [inMs])

  useEffect(() => {
    const svg = svgRef.current
    const hit = hitRef.current
    if (!svg || !hit) return

    const shapes = Array.from(svg.querySelectorAll<SVGPathElement>('[data-shape]'))

    const destinations = [
      { x: 80,  y: 0   },  // right
      { x: 40,  y: -70 },  // upper-right
      { x: -40, y: -70 },  // upper-left
      { x: -80, y: 0   },  // left
      { x: -40, y: 70  },  // lower-left
      { x: 40,  y: 70  },  // lower-right
    ]

    let returnTweens: gsap.core.Tween[] = []
    let currentIdx = 0

    const onEnter = () => {
      returnTweens.forEach(t => t.kill())
      const newRotations = shapes.map(() => Math.round(gsap.utils.random(-50, 50)))
      const tl = gsap.timeline()
      shapes.forEach((shape, i) => {
        tl.to(shape, {
          x: destinations[i].x,
          y: destinations[i].y,
          rotation: newRotations[i],
          transformOrigin: '50% 50%',
          duration: outMsRef.current / 1000,
          ease: 'elastic.out(1, 0.5)',
        }, 0)
      })
      tlRef.current = tl

      const others = VARIATIONS.map((_, i) => i).filter(i => i !== currentIdx)
      currentIdx = others[Math.floor(Math.random() * others.length)]
    }

    const onLeave = () => {
      tlRef.current?.pause()
      const nextPaths = VARIATIONS[currentIdx]
      returnTweens = shapes.map((shape, i) => {
        shape.setAttribute('d', nextPaths[i])
        return gsap.to(shape, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: inMsRef.current / 1000,
          ease: 'elastic.out(1, 0.75)',
        })
      })
      setCurrentVariationIdx(currentIdx)
    }

    hit.addEventListener('mouseenter', onEnter)
    hit.addEventListener('mouseleave', onLeave)

    return () => {
      hit.removeEventListener('mouseenter', onEnter)
      hit.removeEventListener('mouseleave', onLeave)
      tlRef.current?.kill()
    }
  }, [])

  return (
    <>
      <svg
        ref={svgRef}
        viewBox="-50 -50 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[400px] h-[400px]"
        overflow="visible"
      >
        {VARIATIONS[currentVariationIdx].map((d, i) => (
          <path
            key={i}
            data-shape
            fill="#000C31"
            d={d}
          />
        ))}
        {/* Invisible hit rect — must be LAST so it's on top */}
        <rect
          ref={hitRef}
          x="0"
          y="0"
          width="100"
          height="100"
          fill="transparent"
          style={{ pointerEvents: 'all', cursor: 'default' }}
        />
      </svg>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-44 overflow-hidden flex flex-col gap-2.5 bg-[#FFFAEF] border border-[#000C31]/12 rounded-2xl px-5 py-4 shadow-sm">
        <Slider label="Explode out" value={outMs} min={50} max={1000} step={50} display={`${outMs}ms`} onChange={setOutMs} />
        <Slider label="Explode in" value={inMs} min={50} max={1000} step={50} display={`${inMs}ms`} onChange={setInMs} />
        <div className="mt-2 pt-2 border-t border-[#000C31]/10 text-[10px] text-[#000C31]/40 text-center">
          Variation {currentVariationIdx + 1} of {VARIATIONS.length}
        </div>
      </div>
    </>
  )
}
