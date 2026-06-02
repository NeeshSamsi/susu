import { useState, useEffect } from "react"
import { BrowserRouter, useSearchParams } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Canvas from "./components/Canvas"
import type { ExperimentProps } from "./types"
import LogoWiggle from "./experiments/logo-wiggle"
import LogoExplode from "./experiments/logo-explode"

const experiments: Record<
  string,
  { title: string; component: React.ComponentType<ExperimentProps> }
> = {
  "logo-wiggle": { title: "Wiggle", component: LogoWiggle },
  "logo-explode": { title: "Explode", component: LogoExplode },
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebar") !== "closed"
  })
  const [params] = useSearchParams()
  const activeId = params.get("experiment") ?? Object.keys(experiments)[0]
  const ActiveComponent = experiments[activeId]?.component ?? LogoWiggle

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
          className="text-white/50 hover:text-white transition-colors text-lg leading-none"
          title="Toggle sidebar ["
        >
          ☰
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
        <Canvas key={activeId}>
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
