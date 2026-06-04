import { useState, useEffect } from "react"
import { BrowserRouter, useSearchParams } from "react-router-dom"
import { Menu } from "lucide-react"
import Sidebar, { type ExperimentGroup } from "./components/Sidebar"
import Canvas from "./components/Canvas"
import type { ExperimentProps } from "./types"

import LogoWiggle from "./experiments/logo-wiggle"
import LogoWiggleTH from "./experiments/logo-wiggle-th"
import PatternWiggle from "./experiments/pattern-wiggle"
import PatternWiggleTH from "./experiments/pattern-wiggle-th"
import LogoExplode from "./experiments/logo-explode"
import LogoExplodeTH from "./experiments/logo-explode-th"
import LogoExplodeV2 from "./experiments/logo-explode-v2"
import LogoExplodeV2TH from "./experiments/logo-explode-v2-th"
import VerticalDance from "./experiments/vertical-dance"
import LogoWave from "./experiments/logo-wave"
import CameraWiggle from "./experiments/camera-wiggle"
import CameraWiggleTH from "./experiments/camera-wiggle-th"
import CameraWiggleV2 from "./experiments/camera-wiggle-v2"
import CameraWiggleV2TH from "./experiments/camera-wiggle-v2-th"
import CameraWiggleV3 from "./experiments/camera-wiggle-v3"
import CameraWiggleV3TH from "./experiments/camera-wiggle-v3-th"

const experiments: Record<
  string,
  { title: string; component: React.ComponentType<ExperimentProps>; hideToggle?: boolean; hideReset?: boolean }
> = {
  "logo-wiggle":         { title: "Wiggle",         component: LogoWiggle,       hideReset: true },
  "logo-wiggle-th":      { title: "Wiggle TH",      component: LogoWiggleTH,     hideReset: true },
  "pattern-wiggle":      { title: "Pattern Wiggle", component: PatternWiggle,    hideReset: true },
  "pattern-wiggle-th":   { title: "Pattern Wiggle TH", component: PatternWiggleTH, hideReset: true },
  "logo-explode":        { title: "Explode",        component: LogoExplode,      hideToggle: true, hideReset: true },
  "logo-explode-th":     { title: "Explode TH",     component: LogoExplodeTH,    hideToggle: true, hideReset: true },
  "logo-explode-v2":     { title: "Explode v2",     component: LogoExplodeV2,    hideToggle: true, hideReset: true },
  "logo-explode-v2-th":  { title: "Explode v2 TH",  component: LogoExplodeV2TH,  hideToggle: true, hideReset: true },
  "vertical-dance":      { title: "Vertical Dance", component: VerticalDance,    hideReset: true },
  "logo-wave":           { title: "Wave",           component: LogoWave },
  "camera-wiggle":       { title: "Camera Explode",    component: CameraWiggle,     hideToggle: true, hideReset: true },
  "camera-wiggle-th":    { title: "Camera Explode TH", component: CameraWiggleTH,   hideToggle: true, hideReset: true },
  "camera-wiggle-v2":    { title: "Camera Explode v2",    component: CameraWiggleV2,   hideToggle: true, hideReset: true },
  "camera-wiggle-v2-th": { title: "Camera Explode v2 TH", component: CameraWiggleV2TH, hideToggle: true, hideReset: true },
  "camera-wiggle-v3":    { title: "Camera Spin",    component: CameraWiggleV3,   hideToggle: true, hideReset: true },
  "camera-wiggle-v3-th": { title: "Camera Spin TH", component: CameraWiggleV3TH, hideToggle: true, hideReset: true },
}

const EXPERIMENT_GROUPS: ExperimentGroup[] = [
  { label: "Wiggle",         items: [{ id: "logo-wiggle",        label: "EN" }, { id: "logo-wiggle-th",        label: "TH" }] },
  { label: "Pattern Wiggle", items: [{ id: "pattern-wiggle",     label: "EN" }, { id: "pattern-wiggle-th",     label: "TH" }] },
  { label: "Explode",        items: [{ id: "logo-explode",       label: "EN" }, { id: "logo-explode-th",       label: "TH" }] },
  { label: "Explode v2",     items: [{ id: "logo-explode-v2",    label: "EN" }, { id: "logo-explode-v2-th",    label: "TH" }] },
  { label: "Vertical Dance", items: [{ id: "vertical-dance",     label: "EN" }] },
  { label: "Wave",           items: [{ id: "logo-wave",          label: "EN" }] },
  { label: "Camera Explode",    items: [{ id: "camera-wiggle",      label: "EN" }, { id: "camera-wiggle-th",      label: "TH" }] },
  { label: "Camera Explode v2", items: [{ id: "camera-wiggle-v2",   label: "EN" }, { id: "camera-wiggle-v2-th",   label: "TH" }] },
  { label: "Camera Spin",       items: [{ id: "camera-wiggle-v3",   label: "EN" }, { id: "camera-wiggle-v3-th", label: "TH" }] },
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebar") !== "closed"
  })
  const [params] = useSearchParams()
  const activeId = params.get("experiment") ?? EXPERIMENT_GROUPS[0].items[0].id
  const experiment = experiments[activeId] ?? experiments["logo-wiggle"]
  const ActiveComponent = experiment.component

  useEffect(() => {
    localStorage.setItem("sidebar", sidebarOpen ? "open" : "closed")
  }, [sidebarOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "[") setSidebarOpen((o) => !o)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <header className="h-10 flex items-center gap-3 px-4 border-b border-white/10 shrink-0 z-50">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="text-white/50 hover:text-white transition-colors flex items-center justify-center"
          title="Toggle sidebar ["
        >
          <Menu size={18} />
        </button>
        <span className="text-white/70 text-sm font-medium tracking-wide">
          SuSu Experiments
        </span>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} groups={EXPERIMENT_GROUPS} onClose={() => setSidebarOpen(false)} />
        <Canvas key={activeId} hideToggle={experiment.hideToggle} hideReset={experiment.hideReset}>
          {(props) => <ActiveComponent {...props} />}
        </Canvas>
      </div>
    </div>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
