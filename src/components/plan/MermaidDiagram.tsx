import { useEffect, useRef, useCallback } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  flowchart: { useMaxWidth: true, htmlLabels: false },
})

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const renderChart = useCallback(async () => {
    if (!containerRef.current || !chart.trim()) return
    const id = `mermaid-${Date.now()}`

    try {
      const { svg } = await mermaid.render(id, chart)
      if (containerRef.current) {
        containerRef.current.innerHTML = svg
      }
      if (errorRef.current) {
        errorRef.current.style.display = 'none'
      }
    } catch (err) {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      if (errorRef.current) {
        errorRef.current.textContent = `Diagram rendering error: ${err instanceof Error ? err.message : 'Failed to render diagram'}`
        errorRef.current.style.display = 'block'
      }
    }
  }, [chart])

  useEffect(() => {
    renderChart()
  }, [renderChart])

  if (!chart.trim()) return null

  return (
    <div>
      <div
        ref={errorRef}
        className="text-xs text-red-400 bg-red-50 p-3 rounded-lg"
        style={{ display: 'none' }}
      />
      <div ref={containerRef} className={`overflow-x-auto ${className}`} />
    </div>
  )
}
