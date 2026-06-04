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
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) paths.push(m[1])
  return paths
}

const VARIATIONS: string[][] = [v1,v2,v3,v4,v5,v6,v7,v8,v9,v10,v11,v12,v13,v14,v15].map(extractPaths)

type Phase = 'wiggling' | 'tension' | 'exploding' | 'reforming'
type CameraState = 'idle' | 'requesting' | 'granted' | 'error_permission' | 'error_no_camera'

const BASE_DURATION = 0.5 / 3
const IDLE_CONFIGS = [
  { startRot: -3, targetRot:  3, delay: 0 },
  { startRot:  3, targetRot: -3, delay: 0 },
  { startRot: -3, targetRot:  3, delay: BASE_DURATION / 3 },
  { startRot:  3, targetRot: -3, delay: BASE_DURATION / 3 },
  { startRot: -3, targetRot:  3, delay: (2 * BASE_DURATION) / 3 },
  { startRot:  3, targetRot: -3, delay: (2 * BASE_DURATION) / 3 },
]

const FILL_RATE = 3.0

const TENSION_START = 90
const EXPLOSION_THRESHOLD = 105

const DESTINATIONS = [
  { x: 80,  y: 0   },
  { x: 40,  y: -70 },
  { x: -40, y: -70 },
  { x: -80, y: 0   },
  { x: -40, y: 70  },
  { x: 40,  y: 70  },
]

const PALETTE = ['#114DFF', '#7F3DE2', '#E146D4', '#E14646', '#EBB330']

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

export default function CameraWiggleV2TH(_props: ExperimentProps) {
  const [phase, setPhase] = useState<Phase>('wiggling')
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [progress, setProgress] = useState(0)
  const [sensitivity, setSensitivity] = useState(20)

  const [bgColor, setBgColor] = useState(PALETTE[0])
  const [nextColor, setNextColor] = useState(PALETTE[1])
  const circleRef = useRef<HTMLDivElement>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shapesRef = useRef<SVGPathElement[]>([])
  const idleTweensRef = useRef<gsap.core.Tween[]>([])
  const prevGrayRef = useRef<number[]>(new Array(256).fill(128))
  const sensitivityRef = useRef(20)
  useEffect(() => { sensitivityRef.current = sensitivity }, [sensitivity])
  const [drainRate, setDrainRate] = useState(0.5)
  const drainRateRef = useRef(0.5)
  useEffect(() => { drainRateRef.current = drainRate }, [drainRate])
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const variationIndexRef = useRef(0)
  const explodingRef = useRef(false)
  const progressRef = useRef(0)
  const isBracedRef = useRef(false)
  const phaseRef = useRef<Phase>('wiggling')

  function startAllIdleTweens() {
    gsap.killTweensOf(shapesRef.current)
    idleTweensRef.current = shapesRef.current.map((shape, i) => {
      const { startRot, targetRot, delay } = IDLE_CONFIGS[i]
      gsap.set(shape, { rotation: startRot, transformOrigin: '50% 50%' })
      return gsap.to(shape, {
        rotation: targetRot,
        transformOrigin: '50% 50%',
        duration: BASE_DURATION,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay,
      })
    })
  }

  function startTensionShake() {
    gsap.to(svgRef.current, {
      x: 'random(-3, 3)', y: 'random(-2, 2)',
      duration: 0.05, repeat: -1, yoyo: true,
      ease: 'none', id: 'tension-shake',
    })
  }

  function stopTensionShake() {
    gsap.getById('tension-shake')?.kill()
    gsap.set(svgRef.current, { x: 0, y: 0 })
  }

  function startReform() {
    phaseRef.current = 'reforming'
    setPhase('reforming')

    variationIndexRef.current = (variationIndexRef.current + 1) % 15
    const newPaths = VARIATIONS[variationIndexRef.current]
    shapesRef.current.forEach((shape, i) => {
      shape.setAttribute('d', newPaths[i] ?? '')
    })

    gsap.to(shapesRef.current, {
      x: 0, y: 0, rotation: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)',
      onComplete: () => {
        explodingRef.current = false
        progressRef.current = 0
        setProgress(0)
        phaseRef.current = 'wiggling'
        setPhase('wiggling')
        startAllIdleTweens()
      },
    })
  }

  function triggerExplosion() {
    if (explodingRef.current) return
    explodingRef.current = true
    isBracedRef.current = false
    phaseRef.current = 'exploding'
    setPhase('exploding')
    stopTensionShake()
    gsap.set(svgRef.current, { scale: 1, transformOrigin: '50% 50%' })
    gsap.killTweensOf(shapesRef.current)

    // Trigger expanding background circle
    const currentBg = bgColor
    const availableColors = PALETTE.filter(c => c !== currentBg)
    const newColor = availableColors[Math.floor(Math.random() * availableColors.length)]

    setNextColor(newColor)

    if (circleRef.current) {
      gsap.fromTo(circleRef.current,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => {
            setBgColor(newColor)
            gsap.set(circleRef.current, { scale: 0 })
          }
        }
      )
    }

    const rotations = shapesRef.current.map(() => Math.round((Math.random() * 100) - 50))
    const tl = gsap.timeline({ onComplete: startReform })
    shapesRef.current.forEach((shape, i) => {
      tl.to(shape, {
        x: DESTINATIONS[i].x,
        y: DESTINATIONS[i].y,
        rotation: rotations[i],
        transformOrigin: '50% 50%',
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      }, 0)
    })
  }

  function updateProgress(movementScore: number) {
    if (phaseRef.current === 'exploding' || phaseRef.current === 'reforming') return

    const delta = FILL_RATE * movementScore - drainRateRef.current * (1 - movementScore)
    const next = Math.max(0, Math.min(105, progressRef.current + delta))
    progressRef.current = next
    setProgress(next)

    if (next >= TENSION_START && phaseRef.current === 'wiggling') {
      phaseRef.current = 'tension'
      setPhase('tension')
      startTensionShake()
    }
    if (next < TENSION_START && phaseRef.current === 'tension') {
      phaseRef.current = 'wiggling'
      setPhase('wiggling')
      stopTensionShake()
    }
    if (next >= EXPLOSION_THRESHOLD && phaseRef.current === 'tension') {
      triggerExplosion()
      return
    }

    const t = Math.min(progressRef.current / 100, 1)
    const tCurved = 1 - Math.pow(1 - t, 2) // ease-out: rises fast early, flattens toward end
    const currentSpeed = 3 + tCurved * 9  // 3 → 12
    idleTweensRef.current.forEach(tween => tween.timeScale(currentSpeed / 3))

    // Scale compression & inward brace: 90-105% progress
    const p = progressRef.current
    if (p >= 90) {
      isBracedRef.current = true
      const tensionT = Math.min((p - 90) / 15, 1) // 0→1 over 90-105%
      const scale = 1 - tensionT * 0.2            // 1.0 → 0.8
      gsap.to(svgRef.current, {
        scale,
        transformOrigin: '50% 50%',
        duration: 0.1, // fast response to track ticks smoothly
        ease: 'none',
        overwrite: 'auto',
      })

      // Pull shapes slightly towards center to brace for explosion
      const BRACE_DESTINATIONS = [
        { x: -12, y: 0   },
        { x: -6,  y: 12  },
        { x: 6,   y: 12  },
        { x: 12,  y: 0   },
        { x: 6,   y: -12 },
        { x: -6,  y: -12 },
      ]
      shapesRef.current.forEach((shape, i) => {
        gsap.to(shape, {
          x: BRACE_DESTINATIONS[i].x * tensionT,
          y: BRACE_DESTINATIONS[i].y * tensionT,
          duration: 0.1,
          ease: 'none',
          overwrite: 'auto',
        })
      })
    } else if (isBracedRef.current) {
      isBracedRef.current = false
      gsap.to(svgRef.current, {
        scale: 1,
        transformOrigin: '50% 50%',
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      })
      shapesRef.current.forEach((shape) => {
        gsap.to(shape, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
    }
  }

  function tick() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, 16, 16)
    const data = ctx.getImageData(0, 0, 16, 16).data

    const gray: number[] = []
    for (let i = 0; i < 256; i++) {
      gray.push(0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2])
    }

    const MAD = gray.reduce((sum, v, i) => sum + Math.abs(v - prevGrayRef.current[i]), 0) / 256
    prevGrayRef.current = gray

    const movementScore = Math.min(MAD / sensitivityRef.current, 1)
    updateProgress(movementScore)
  }

  async function startCamera() {
    setCameraState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraState('granted')
      prevGrayRef.current = new Array(256).fill(128)
      tickRef.current = setInterval(tick, 100)
    } catch (err: unknown) {
      const name = (err as Error).name
      setCameraState(name === 'NotFoundError' ? 'error_no_camera' : 'error_permission')
    }
  }

  // When camera state becomes 'granted' after React re-render, ensure srcObject is set
  useEffect(() => {
    if (cameraState !== 'granted' || !videoRef.current || !streamRef.current) return
    if (!videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraState])

  // Mount: gather shapes, start idle tweens, cleanup on unmount
  useEffect(() => {
    if (!svgRef.current) return
    const shapes = Array.from(svgRef.current.querySelectorAll<SVGPathElement>('[data-shape]'))
    shapesRef.current = shapes
    startAllIdleTweens()

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      gsap.killTweensOf(shapes)
      gsap.killTweensOf(svgRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initialPaths = VARIATIONS[0]

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Expanding circle background */}
      <div
        ref={circleRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '200vmax',
          height: '200vmax',
          backgroundColor: nextColor,
          transform: 'scale(0)'
        }}
      />

      {/* Progress bar */}
      <div className="hidden absolute top-0 left-0 right-0 h-1.5 bg-[#FFFAEF]/10 z-10 pointer-events-none">
        <div
          className="h-full bg-[#FFFAEF] transition-none"
          style={{ width: `${Math.min((progress / 100) * 100, 100)}%` }}
        />
        {phase === 'tension' && (
          <div className="absolute right-0 top-0 h-full w-3 bg-[#FFFAEF] animate-pulse rounded-r-full" />
        )}
      </div>

      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-80 h-96 pointer-events-auto"
          overflow="visible"
        >
          {initialPaths.map((d, i) => (
            <path key={i} data-shape={i} fill="#FFFAEF" d={d} />
          ))}
        </svg>
      </div>

      {/* Camera preview */}
      <div
        className="absolute bottom-4 right-4 rounded-xl overflow-hidden shadow-md border border-[#FFFAEF]/20 bg-[#000000]/10 cursor-pointer z-20 backdrop-blur-sm"
        style={{ width: 160, height: 120 }}
        onClick={cameraState === 'idle' || cameraState.startsWith('error') ? startCamera : undefined}
      >
        <canvas ref={canvasRef} width={16} height={16} className="hidden" />
        {/* Video always in DOM so ref is available before 'granted' render */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', transform: 'scaleX(-1)',
            display: cameraState === 'granted' ? 'block' : 'none',
          }}
        />
        {cameraState === 'idle' && (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#FFFAEF]/70 font-medium">
            Tap to enable camera
          </div>
        )}
        {cameraState === 'requesting' && (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#FFFAEF]/60 font-medium">
            Requesting…
          </div>
        )}
        {cameraState === 'error_permission' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
            <span className="text-[10px] text-[#FFFAEF]/70 text-center font-medium">Camera access denied</span>
            <span className="text-[10px] text-[#FFFAEF]/50">Tap to retry</span>
          </div>
        )}
        {cameraState === 'error_no_camera' && (
          <div className="w-full h-full flex items-center justify-center p-2">
            <span className="text-[10px] text-[#FFFAEF]/70 text-center font-medium">No camera found</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="hidden absolute right-4 top-1/2 -translate-y-1/2 w-44 overflow-hidden
        bg-[#FFFAEF] border border-[#000C31]/12 rounded-2xl px-5 py-4 shadow-sm">
        <Slider
          label="Movement"
          value={sensitivity}
          min={5} max={80} step={5}
          display={String(sensitivity)}
          onChange={v => { setSensitivity(v); sensitivityRef.current = v }}
        />
        <Slider
          label="Decay"
          value={drainRate}
          min={0.5} max={5.0} step={0.5}
          display={drainRate.toFixed(1)}
          onChange={v => { setDrainRate(v); drainRateRef.current = v }}
        />
      </div>
    </div>
  )
}
