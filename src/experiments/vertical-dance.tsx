import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import type { ExperimentProps } from '../types'
import staticPresets from '../data/presets.json'

const PATHS = [
  "M89.5384 49.7005L90.9423 54.9125L92.7754 61.5192C93.5445 64.291 95.6563 63.0934 95.9618 64.1945C96.1093 64.7261 95.832 65.2455 95.0934 65.925C94.0825 66.8377 92.0809 68.1288 90.98 68.4137C89.8792 68.6986 89.2388 68.2132 88.7177 66.6388L88.3939 65.6238C87.3614 68.1292 85.1611 69.9195 83.038 70.4689C78.7918 71.5676 75.6244 69.4165 74.2759 64.5564L72.8959 59.5823C72.169 56.9624 70.3555 57.7166 70.0394 56.5775C69.9025 56.0839 70.104 55.7469 70.9317 55.085C72.3723 53.8983 74.9503 52.2545 75.5794 52.0918C76.2084 51.929 76.5785 52.1995 76.7997 52.9968L78.2036 58.2089L79.51 62.9171C80.3106 65.8028 81.642 67.4117 83.9904 66.7633C86.0637 66.1861 87.6362 63.5002 86.7407 60.2728L85.6345 56.286C84.9076 53.6661 83.0942 54.4202 82.7781 53.2811C82.6412 52.7875 82.8426 52.4505 83.6704 51.7887C85.111 50.602 87.6889 48.9582 88.318 48.7954C88.9471 48.6326 89.3171 48.9031 89.5384 49.7005Z",
  "M57.1932 70.2564C54.111 69.4429 52.5009 68.237 51.3913 67.9442C50.1996 67.6296 49.8259 68.3553 49.004 68.1384C48.2232 67.9323 47.8622 67.3164 48.048 65.4998C48.2478 63.47 48.4256 61.5211 48.8338 59.3727C49.09 58.2689 49.4827 57.6349 50.2635 57.841C51.0033 58.0363 51.1999 58.6088 51.6093 60.0185C52.1844 62.5999 53.7171 66.5188 58.361 67.7445C61.4021 68.5472 63.1717 67.0618 63.7714 65.1809C64.6134 62.4094 61.5688 60.0005 58.5902 57.3487C54.7163 53.94 51.4992 51.3554 52.7986 46.5787C53.9989 42.1663 59.1817 39.6294 65.264 41.2347C67.2777 41.7662 68.8085 42.7777 69.7537 43.0271C70.7811 43.2983 71.1819 42.7966 72.0038 43.0136C72.7435 43.2088 73.0855 43.7329 72.9818 45.5712C72.9252 47.0748 72.8025 48.8213 72.4824 50.6458C72.2672 51.7605 71.8335 52.3836 70.9704 52.1558C70.3129 51.9823 69.9629 51.3259 69.5014 49.9458C68.6848 47.6043 67.1593 44.4683 63.9538 43.6223C61.3237 42.9281 59.4889 44.0058 58.9383 46.0298C58.2335 48.6206 60.2347 50.4937 63.925 53.7673C68.0124 57.3625 71.4871 59.9717 70.2949 64.5164C68.9015 69.9625 62.7412 71.7208 57.1932 70.2564Z",
  "M45.5383 37.7005L46.9423 42.9125L48.7754 49.5192C49.5444 52.291 51.6563 51.0934 51.9618 52.1945C52.1093 52.7261 51.832 53.2455 51.0934 53.925C50.0825 54.8377 48.0809 56.1288 46.98 56.4137C45.8792 56.6986 45.2388 56.2132 44.7177 54.6388L44.3939 53.6238C43.3614 56.1292 41.1611 57.9195 39.038 58.4689C34.7918 59.5676 31.6244 57.4165 30.2759 52.5564L28.8959 47.5823C28.169 44.9624 26.3555 45.7166 26.0394 44.5775C25.9025 44.0839 26.104 43.7469 26.9317 43.085C28.3723 41.8983 30.9503 40.2545 31.5793 40.0918C32.2084 39.929 32.5784 40.1995 32.7997 40.9968L34.2036 46.2089L35.51 50.9171C36.3106 53.8028 37.642 55.4117 39.9904 54.7633C42.0637 54.1861 43.6362 51.5002 42.7407 48.2728L41.6345 44.286C40.9076 41.6661 39.0942 42.4202 38.7781 41.2811C38.6412 40.7875 38.8426 40.4505 39.6704 39.7887C41.111 38.602 43.6889 36.9582 44.318 36.7954C44.9471 36.6326 45.3171 36.9031 45.5383 37.7005Z",
  "M12.8255 58.2729C9.86654 57.4865 8.32091 56.3208 7.25569 56.0377C6.11157 55.7336 5.75291 56.4352 4.96386 56.2255C4.21426 56.0263 3.86769 55.4309 4.04608 53.6748C4.23788 51.7126 4.40854 49.8287 4.80044 47.7519C5.04641 46.6849 5.42338 46.0721 6.17298 46.2713C6.88313 46.4601 7.07189 47.0135 7.4649 48.3762C8.01703 50.8716 9.48845 54.6599 13.9466 55.8447C16.8661 56.6206 18.5648 55.1847 19.1406 53.3665C19.9489 50.6874 17.026 48.3588 14.1666 45.7954C10.4477 42.5003 7.35924 40.0019 8.60665 35.3844C9.75891 31.1191 14.7345 28.6668 20.5734 30.2186C22.5066 30.7323 23.9762 31.7101 24.8836 31.9512C25.8699 32.2134 26.2546 31.7284 27.0437 31.9381C27.7538 32.1269 28.0821 32.6335 27.9826 34.4105C27.9282 35.864 27.8104 37.5523 27.5031 39.316C27.2965 40.3935 26.8801 40.9958 26.0516 40.7756C25.4204 40.6079 25.0844 39.9733 24.6413 38.6393C23.8574 36.3759 22.393 33.3444 19.3157 32.5266C16.7907 31.8555 15.0293 32.8972 14.5007 34.8538C13.8242 37.3582 15.7453 39.1689 19.288 42.3334C23.212 45.8088 26.5477 48.331 25.4031 52.7242C24.0655 57.9887 18.1516 59.6884 12.8255 58.2729Z",
]

const SHAPE_ORDER = [3, 2, 1, 0] // slider index → path index

type Preset = {
  id: string
  name: string
  tops: number[]
  bottoms: number[]
  duration: number
}

const STORAGE_KEY = 'vertical-dance-presets'

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

export default function VerticalDance({ isPlaying }: ExperimentProps) {
  const [tops, setTops] = useState([30, 30, 30, 30])
  const topsRef = useRef([30, 30, 30, 30])
  const [bottoms, setBottoms] = useState([30, 30, 30, 30])
  const bottomsRef = useRef([30, 30, 30, 30])
  useEffect(() => { topsRef.current = tops }, [tops])
  useEffect(() => { bottomsRef.current = bottoms }, [bottoms])

  const [duration, setDuration] = useState(0.6)
  const durationRef = useRef(0.6)
  useEffect(() => { durationRef.current = duration }, [duration])

  const [tab, setTab] = useState<'custom' | 'presets'>('custom')
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const stored: Preset[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      // Merge static presets with local storage, avoiding duplicates by ID
      const all = [...(staticPresets as Preset[])]
      stored.forEach(p => {
        if (!all.some(ap => ap.id === p.id)) all.push(p)
      })
      return all
    } catch {
      return staticPresets as Preset[]
    }
  })
  const [newPresetName, setNewPresetName] = useState('')

  const tlsRef = useRef<(gsap.core.Timeline | null)[]>([null, null, null, null])
  const shapesRef = useRef<SVGPathElement[]>([])

  function startLetter(shape: SVGPathElement, sliderIdx: number, top: number, bottom: number, dur: number): gsap.core.Timeline {
    const isEven = sliderIdx % 2 === 0
    const startY = isEven ? bottom : -top
    const endY   = isEven ? -top   : bottom
    gsap.set(shape, { y: startY, transformOrigin: '50% 50%' })
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(shape, { y: endY,   duration: dur, ease: 'elastic.out(1, 0.5)' })
    tl.to(shape, { y: startY, duration: dur, ease: 'elastic.out(1, 0.5)' })
    return tl
  }

  // Mount: start all letters
  useEffect(() => {
    SHAPE_ORDER.forEach((shapeIdx, sliderIdx) => {
      const shape = shapesRef.current[shapeIdx]
      if (!shape) return
      tlsRef.current[sliderIdx] = startLetter(shape, sliderIdx, topsRef.current[sliderIdx], bottomsRef.current[sliderIdx], durationRef.current)
    })
    return () => { tlsRef.current.forEach(tl => tl?.kill()) }
  }, [])

  // Duration change: kill all, restart all
  useEffect(() => {
    const shapes = shapesRef.current
    if (!shapes[SHAPE_ORDER[0]]) return
    tlsRef.current.forEach(tl => tl?.kill())
    SHAPE_ORDER.forEach((shapeIdx, sliderIdx) => {
      const shape = shapes[shapeIdx]
      if (!shape) return
      tlsRef.current[sliderIdx] = startLetter(shape, sliderIdx, topsRef.current[sliderIdx], bottomsRef.current[sliderIdx], duration)
    })
  }, [duration])

  // Tops change: restart affected letters
  useEffect(() => {
    SHAPE_ORDER.forEach((shapeIdx, sliderIdx) => {
      const shape = shapesRef.current[shapeIdx]
      if (!shape) return
      tlsRef.current[sliderIdx]?.kill()
      tlsRef.current[sliderIdx] = startLetter(shape, sliderIdx, tops[sliderIdx], bottomsRef.current[sliderIdx], durationRef.current)
    })
  }, [tops])

  // Bottoms change: restart affected letters
  useEffect(() => {
    SHAPE_ORDER.forEach((shapeIdx, sliderIdx) => {
      const shape = shapesRef.current[shapeIdx]
      if (!shape) return
      tlsRef.current[sliderIdx]?.kill()
      tlsRef.current[sliderIdx] = startLetter(shape, sliderIdx, topsRef.current[sliderIdx], bottoms[sliderIdx], durationRef.current)
    })
  }, [bottoms])

  const savePreset = () => {
    if (!newPresetName.trim()) return
    const preset: Preset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      tops: [...tops],
      bottoms: [...bottoms],
      duration,
    }
    const updated = [...presets, preset]
    setPresets(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.filter(p => !staticPresets.some(sp => sp.id === p.id))))
    setNewPresetName('')
    
    console.log('--- NEW PRESET CREATED ---')
    console.log('Copy this JSON to src/data/presets.json for permanent saving:')
    console.log(JSON.stringify(preset, null, 2))
    console.log('-------------------------')
  }

  const loadPreset = (p: Preset) => {
    setTops([...p.tops])
    setBottoms([...p.bottoms])
    setDuration(p.duration)
  }

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id)
    setPresets(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Play/pause
  useEffect(() => {
    tlsRef.current.forEach(tl => {
      if (!tl) return
      isPlaying ? tl.resume() : tl.pause()
    })
  }, [isPlaying])

  return (
    <>
      <svg viewBox="0 0 100 100" className="w-80 h-96" overflow="visible" fill="none">
        {PATHS.map((d, i) => (
          <path
            key={i}
            ref={el => { if (el) shapesRef.current[i] = el }}
            fill="#000C31"
            d={d}
          />
        ))}
      </svg>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-44 overflow-hidden flex flex-col bg-[#FFFAEF] border border-[#000C31]/12 rounded-2xl shadow-sm">
        {/* Tab header */}
        <div className="flex border-b border-[#000C31]/10">
          {(['custom', 'presets'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs capitalize transition-colors ${tab === t ? 'text-[#000C31] font-medium' : 'text-[#000C31]/35 hover:text-[#000C31]/60'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Custom tab */}
        {tab === 'custom' && (
          <div className="flex flex-col gap-2.5 px-5 py-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="text-[#000C31]/40 text-[10px] uppercase tracking-widest">Letter {i + 1}</span>
                <Slider label="Up" value={tops[i]} min={0} max={80} step={5} display={`${tops[i]}px`}
                  onChange={v => setTops(prev => prev.map((val, j) => j === i ? v : val))} />
                <Slider label="Down" value={bottoms[i]} min={0} max={80} step={5} display={`${bottoms[i]}px`}
                  onChange={v => setBottoms(prev => prev.map((val, j) => j === i ? v : val))} />
              </div>
            ))}
            <div className="w-full h-px bg-[#000C31]/10 my-0.5" />
            <Slider label="Duration" value={duration} min={0.2} max={2.0} step={0.1}
              display={`${duration.toFixed(1)}s`} onChange={setDuration} />
          </div>
        )}

        {/* Presets tab */}
        {tab === 'presets' && (
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && savePreset()}
                placeholder="Preset name"
                className="text-xs border border-[#000C31]/15 rounded-lg px-2 py-1.5 bg-transparent text-[#000C31] placeholder:text-[#000C31]/25 outline-none focus:border-[#000C31]/30"
              />
              <button
                onClick={savePreset}
                disabled={!newPresetName.trim()}
                className="text-xs bg-[#000C31] text-[#FFFAEF] rounded-lg py-1.5 disabled:opacity-25 transition-opacity"
              >
                Save current
              </button>
            </div>
            {presets.length === 0 ? (
              <p className="text-[#000C31]/25 text-xs text-center py-1">No presets yet</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {presets.map(p => (
                  <div key={p.id} className="flex items-center gap-1">
                    <span className="flex-1 text-xs text-[#000C31] truncate">{p.name}</span>
                    <button onClick={() => loadPreset(p)} className="text-[10px] text-[#000C31]/50 hover:text-[#000C31] transition-colors px-1">Load</button>
                    <button onClick={() => deletePreset(p.id)} className="text-[10px] text-[#000C31]/30 hover:text-[#000C31]/70 transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
