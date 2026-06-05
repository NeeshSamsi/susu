import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import type { ExperimentProps } from '../types'

import v1 from '../assets/logo-variations/variation-1.svg?raw'
import v2 from '../assets/logo-variations/variation-2.svg?raw'
import v3 from '../assets/logo-variations/variation-3.svg?raw'
import v4 from '../assets/logo-variations/variation-4.svg?raw'
import v5 from '../assets/logo-variations/variation-5.svg?raw'
import v6 from '../assets/logo-variations/variation-6.svg?raw'
import v7 from '../assets/logo-variations/variation-7.svg?raw'

function extractPaths(raw: string): string[] {
  const paths: string[] = []
  const re = /d="([^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) paths.push(m[1])
  return paths
}

const VARIATIONS: string[][] = [v1, v2, v3, v4, v5, v6, v7].map(extractPaths)

type Phase = 'wiggling' | 'tension' | 'transitioning'
type CameraState = 'idle' | 'requesting' | 'granted' | 'error_permission' | 'error_no_camera'

const BASE_DURATION = 0.5 / 3
const IDLE_CONFIGS = [
  { startRot: -3, targetRot:  3, delay: 0 },
  { startRot:  3, targetRot: -3, delay: 0 },
  { startRot: -3, targetRot:  3, delay: BASE_DURATION / 2 },
  { startRot:  3, targetRot: -3, delay: BASE_DURATION / 2 },
]

const FILL_RATE = 3.0
const TENSION_START = 90
// One-shot spin thresholds — gaps shrink as tension builds: 30 / 18 / 12
const SPIN_T1 = 20
const SPIN_T2 = 50
const SPIN_T3 = 68
const SPIN_T4 = 80
// All-shapes spin → transition to next composition
const TRANSITION_THRESHOLD = 100

const INITIAL = { bg: '#FFFAEF', logo: '#1C42FF' }
const COMBINATIONS = [
  { bg: '#FF0066', logo: '#E0FE00' },
  { bg: '#37FFB9', logo: '#1C42FF' },
  { bg: '#E0FE00', logo: '#FF0066' },
  { bg: '#1C42FF', logo: '#37FFB9' },
  { bg: '#E0FE00', logo: '#FF0066' },
]

const BRACE_DESTINATIONS = [
  { x: -12, y: 12 },
  { x: -12, y: -12 },
  { x: 12, y: 12 },
  { x: 12, y: -12 },
]

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

export default function CameraWiggleV3(_props: ExperimentProps) {
  const [_phase, setPhase] = useState<Phase>('wiggling')
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [_progress, setProgress] = useState(0)
  const [sensitivity, setSensitivity] = useState(20)
  const [simProgress, setSimProgress] = useState(0)
  const [simPlaying, setSimPlaying] = useState(false)
  const simRafRef = useRef<number | null>(null)
  const simStartTimeRef = useRef<number | null>(null)
  const simStartValRef = useRef(0)

  const [bgColor, setBgColor] = useState(INITIAL.bg)
  const [logoColor, setLogoColor] = useState(INITIAL.logo)
  const [circleColor, setCircleColor] = useState(COMBINATIONS[0].bg)
  const comboIdxRef = useRef(0)
  const circleRef = useRef<HTMLDivElement>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shapesRef = useRef<SVGPathElement[]>([])
  const idleTweensRef = useRef<(gsap.core.Tween | null)[]>([null, null, null, null])
  // spinTierRef tracks which one-shot threshold has been crossed this cycle
  const spinTierRef = useRef(0)
  // shapes that have already spun in this cycle — cleared on transition reset
  const usedSpinIndicesRef = useRef<Set<number>>(new Set())
  // tracks when the last queued spin will finish so new spins can queue after it
  const lastSpinEndTimeRef = useRef(0)
  const prevGrayRef = useRef<number[]>(new Array(256).fill(128))
  const sensitivityRef = useRef(20)
  useEffect(() => { sensitivityRef.current = sensitivity }, [sensitivity])
  const [drainRate, setDrainRate] = useState(0.5)
  const drainRateRef = useRef(0.5)
  useEffect(() => { drainRateRef.current = drainRate }, [drainRate])
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const variationIndexRef = useRef(0)
  const transitioningRef = useRef(false)
  const progressRef = useRef(0)
  const isBracedRef = useRef(false)
  const phaseRef = useRef<Phase>('wiggling')

  function restoreWiggle(idx: number) {
    const shape = shapesRef.current[idx]
    if (!shape) return
    const { startRot, targetRot, delay } = IDLE_CONFIGS[idx]
    gsap.set(shape, { rotation: startRot, transformOrigin: '50% 50%' })
    idleTweensRef.current[idx] = gsap.to(shape, {
      rotation: targetRot,
      transformOrigin: '50% 50%',
      duration: BASE_DURATION,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      delay,
    })
  }

  function spinOnce(idx: number, onDone?: () => void) {
    const shape = shapesRef.current[idx]
    if (!shape) return
    idleTweensRef.current[idx]?.kill()
    idleTweensRef.current[idx] = null
    const SPIN_DURATION = 0.5
    const now = gsap.ticker.time
    const delay = Math.max(0, lastSpinEndTimeRef.current - now)
    lastSpinEndTimeRef.current = now + delay + SPIN_DURATION
    gsap.to(shape, {
      rotation: '+=360',
      transformOrigin: '50% 50%',
      duration: SPIN_DURATION,
      ease: 'power2.inOut',
      delay,
      overwrite: 'auto',
      onComplete: () => {
        onDone?.()
        if (phaseRef.current !== 'transitioning') {
          restoreWiggle(idx)
        }
      },
    })
  }

  function startAllIdleTweens() {
    gsap.killTweensOf(shapesRef.current)
    idleTweensRef.current = shapesRef.current.map((shape, i) => {
      const { startRot, targetRot, delay } = IDLE_CONFIGS[i]
      gsap.set(shape, { x: 0, y: 0, rotation: startRot, transformOrigin: '50% 50%' })
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
    spinTierRef.current = 0
    usedSpinIndicesRef.current.clear()
    lastSpinEndTimeRef.current = 0
  }


  // Called when a tier threshold is first crossed upward — spins a random unused shape
  function updateSpin(newTier: number) {
    const oldTier = spinTierRef.current
    if (newTier <= oldTier) return  // only fire on ascent
    spinTierRef.current = newTier
    const available = shapesRef.current
      .map((_, i) => i)
      .filter(i => !usedSpinIndicesRef.current.has(i))
    if (available.length === 0) return
    const randomIdx = available[Math.floor(Math.random() * available.length)]
    usedSpinIndicesRef.current.add(randomIdx)
    spinOnce(randomIdx)
    // Tier 3 (all-shapes) is handled by triggerSpinTransition — not here
  }

  // Reset spin tier when progress drops back below a threshold
  function syncSpinTierDown(p: number) {
    const currentTier = spinTierRef.current
    const expectedTier = p >= SPIN_T3 ? 3 : p >= SPIN_T2 ? 2 : p >= SPIN_T1 ? 1 : 0
    if (expectedTier < currentTier) {
      spinTierRef.current = expectedTier
    }
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

  function triggerSpinTransition() {
    if (transitioningRef.current) return
    transitioningRef.current = true
    isBracedRef.current = false
    phaseRef.current = 'transitioning'
    setPhase('transitioning')
    stopTensionShake()

    // Reset brace scale
    gsap.to(svgRef.current, { scale: 1, transformOrigin: '50% 50%', duration: 0.1, ease: 'none' })
    // Kill all current shape tweens and reset any brace x/y offsets
    gsap.killTweensOf(shapesRef.current)
    shapesRef.current.forEach(shape => gsap.set(shape, { x: 0, y: 0 }))
    spinTierRef.current = 0
    idleTweensRef.current = [null, null, null, null]

    // Expand background colour
    const combo = COMBINATIONS[comboIdxRef.current]
    comboIdxRef.current = (comboIdxRef.current + 1) % COMBINATIONS.length
    setCircleColor(combo.bg)
    if (circleRef.current) {
      gsap.fromTo(circleRef.current,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          onComplete: () => {
            setBgColor(combo.bg)
            setLogoColor(combo.logo)
            gsap.set(circleRef.current, { scale: 0 })
          },
        }
      )
    }

    // Advance variation — swap paths before spin starts (invisible while rotating)
    variationIndexRef.current = (variationIndexRef.current + 1) % 7
    const newPaths = VARIATIONS[variationIndexRef.current]
    shapesRef.current.forEach((shape, i) => {
      shape.setAttribute('d', newPaths[i] ?? '')
    })

    const SPIN_DURATION = 0.45
    const SPIN_STAGGER = 0.07
    const lastIdx = shapesRef.current.length - 1

    shapesRef.current.forEach((shape, i) => {
      gsap.to(shape, {
        rotation: '+=360',
        transformOrigin: '50% 50%',
        duration: SPIN_DURATION,
        ease: 'power2.inOut',
        delay: i * SPIN_STAGGER,
        overwrite: 'auto',
        onComplete: i === lastIdx ? () => {
          transitioningRef.current = false
          progressRef.current = 0
          setProgress(0)
          setSimProgress(0)
          stopSimPlay()
          phaseRef.current = 'wiggling'
          setPhase('wiggling')
          startAllIdleTweens()
        } : undefined,
      })
    })
  }

  function applyEffects(p: number) {
    // Phase transitions
    if (p >= TENSION_START && phaseRef.current === 'wiggling') {
      phaseRef.current = 'tension'; setPhase('tension'); startTensionShake()
    }
    if (p < TENSION_START && phaseRef.current === 'tension') {
      phaseRef.current = 'wiggling'; setPhase('wiggling'); stopTensionShake()
    }

    // Wiggle speed scaling
    const t = Math.min(p / 100, 1)
    const tCurved = 1 - Math.pow(1 - t, 2)
    const currentSpeed = 3 + tCurved * 9
    idleTweensRef.current.forEach(tween => tween?.timeScale(currentSpeed / 3))

    // One-shot spins on threshold crossing (ascent only)
    const newTier = p >= SPIN_T4 ? 4 : p >= SPIN_T3 ? 3 : p >= SPIN_T2 ? 2 : p >= SPIN_T1 ? 1 : 0
    updateSpin(newTier)
    syncSpinTierDown(p)

    // Scale compression & inward brace at 90–100%
    if (p >= 90) {
      isBracedRef.current = true
      const tensionT = Math.min((p - 90) / 10, 1)
      gsap.to(svgRef.current, {
        scale: 1 - tensionT * 0.2,
        transformOrigin: '50% 50%',
        duration: 0.1,
        ease: 'none',
        overwrite: 'auto',
      })
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
      gsap.to(svgRef.current, { scale: 1, transformOrigin: '50% 50%', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      shapesRef.current.forEach(shape => {
        gsap.to(shape, { x: 0, y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      })
    }
  }

  function updateProgress(movementScore: number) {
    if (phaseRef.current === 'transitioning') return

    const delta = FILL_RATE * movementScore - drainRateRef.current * (1 - movementScore)
    const next = Math.max(0, Math.min(105, progressRef.current + delta))
    progressRef.current = next
    setProgress(next)

    if (next >= TRANSITION_THRESHOLD && (phaseRef.current === 'wiggling' || phaseRef.current === 'tension')) {
      triggerSpinTransition()
      return
    }
    applyEffects(next)
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

  useEffect(() => {
    if (cameraState !== 'granted' || !videoRef.current || !streamRef.current) return
    if (!videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraState])

  useEffect(() => {
    if (!svgRef.current) return
    const shapes = Array.from(svgRef.current.querySelectorAll<SVGPathElement>('[data-shape]'))
    shapesRef.current = shapes
    startAllIdleTweens()

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      if (simRafRef.current !== null) cancelAnimationFrame(simRafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      gsap.killTweensOf(shapes)
      gsap.killTweensOf(svgRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startSimPlay() {
    if (simRafRef.current !== null) return
    simStartValRef.current = simProgress
    simStartTimeRef.current = null
    setSimPlaying(true)

    function frame(ts: number) {
      if (simStartTimeRef.current === null) simStartTimeRef.current = ts
      const elapsed = ts - simStartTimeRef.current
      const SIM_DURATION = 5000
      const remaining = 110 - simStartValRef.current
      const val = Math.min(simStartValRef.current + (remaining * elapsed) / SIM_DURATION, 110)
      const rounded = Math.round(val)
      setSimProgress(rounded)

      if (phaseRef.current !== 'transitioning') {
        progressRef.current = rounded
        setProgress(rounded)
        if (rounded >= TRANSITION_THRESHOLD) {
          triggerSpinTransition()
          stopSimPlay()
          return
        }
        applyEffects(rounded)
      }

      if (val < 110) {
        simRafRef.current = requestAnimationFrame(frame)
      } else {
        stopSimPlay()
      }
    }
    simRafRef.current = requestAnimationFrame(frame)
  }

  function stopSimPlay() {
    if (simRafRef.current !== null) {
      cancelAnimationFrame(simRafRef.current)
      simRafRef.current = null
    }
    setSimPlaying(false)
    simStartTimeRef.current = null
  }

  const initialPaths = VARIATIONS[0]

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Expanding circle background */}
      <div
        ref={circleRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: '200vmax', height: '200vmax', backgroundColor: circleColor, transform: 'scale(0)' }}
      />

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
            <path key={i} data-shape={i} fill={logoColor} d={d} />
          ))}
        </svg>
      </div>

      {/* Sim progress slider */}
      <div className="hidden absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
        <span className="text-[#FFFAEF]/50 text-[10px] uppercase tracking-widest shrink-0">Sim</span>
        <button
          onClick={() => simPlaying ? stopSimPlay() : startSimPlay()}
          className="text-[#FFFAEF]/60 hover:text-[#FFFAEF] transition-colors shrink-0 text-[11px] leading-none"
          title={simPlaying ? 'Stop' : 'Play 5s'}
        >
          {simPlaying ? '■' : '▶'}
        </button>
        <input
          type="range"
          min={0} max={110} step={1}
          value={simProgress}
          onChange={e => {
            const val = Number(e.target.value)
            setSimProgress(val)
            if (phaseRef.current === 'transitioning') return
            progressRef.current = val
            setProgress(val)
            if (val >= TRANSITION_THRESHOLD) {
              triggerSpinTransition()
            } else {
              applyEffects(val)
            }
          }}
          className="w-36 h-[3px] appearance-none rounded-full cursor-pointer
            bg-[#FFFAEF]/20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#FFFAEF]"
        />
        <span className="text-[#FFFAEF]/60 text-[10px] tabular-nums w-7 shrink-0">{simProgress}%</span>
      </div>

      {/* Camera preview */}
      <div
        className="absolute bottom-4 right-4 rounded-xl overflow-hidden shadow-md border border-[#FFFAEF]/20 bg-[#000000]/10 cursor-pointer z-20 backdrop-blur-sm"
        style={{ width: 160, height: 120 }}
        onClick={cameraState === 'idle' || cameraState.startsWith('error') ? startCamera : undefined}
      >
        <canvas ref={canvasRef} width={16} height={16} className="hidden" />
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
