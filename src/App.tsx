import { useState, useEffect } from "react"
import { BrowserRouter, useSearchParams } from "react-router-dom"
import { Menu } from "lucide-react"
import Sidebar from "./components/Sidebar"
import Canvas from "./components/Canvas"
import type { ExperimentProps } from "./types"
import LogoWiggle from "./experiments/logo-wiggle"
import LogoExplode from "./experiments/logo-explode"
import LogoExplodeV2 from "./experiments/logo-explode-v2"
import PatternWiggle from "./experiments/pattern-wiggle"
import VerticalDance from "./experiments/vertical-dance"

import LogoWave from "./experiments/logo-wave"
import CameraWiggle from "./experiments/camera-wiggle"
import CameraWiggleV2 from "./experiments/camera-wiggle-v2"

const experiments: Record<
  string,
  { title: string; component: React.ComponentType<ExperimentProps>; hideToggle?: boolean; hideReset?: boolean }
> = {
  "logo-wiggle": { title: "Wiggle", component: LogoWiggle, hideReset: true },
  "pattern-wiggle": { title: "Pattern Wiggle", component: PatternWiggle, hideReset: true },
  "logo-explode": { title: "Explode", component: LogoExplode, hideToggle: true, hideReset: true },
  "logo-explode-v2": { title: "Explode v2", component: LogoExplodeV2, hideToggle: true, hideReset: true },
  "vertical-dance": { title: "Vertical Dance", component: VerticalDance, hideReset: true },
  "logo-wave": { title: "Wave", component: LogoWave }, // toggle and reset visible
  "camera-wiggle": { title: "Camera", component: CameraWiggle, hideToggle: true, hideReset: true },
  "camera-wiggle-v2": { title: "Camera v2", component: CameraWiggleV2, hideToggle: true, hideReset: true },
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebar") !== "closed"
  })
  const [params] = useSearchParams()
  const activeId = params.get("experiment") ?? Object.keys(experiments)[0]
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
      <header className="h-10 flex items-center gap-3 px-4 border-b border-white/10 shrink-0 z-20">
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
        <Sidebar
          isOpen={sidebarOpen}
          experiments={Object.fromEntries(
            Object.entries(experiments).map(([id, { title }]) => [
              id,
              { title },
            ]),
          )}
        />
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
