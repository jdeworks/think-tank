import { useCallback } from 'react'
import { MermaidDiagram } from './MermaidDiagram'
import { fetchMermaidSvg } from '@/utils/mermaid-render'

interface DiagramSectionProps {
  title: string
  chart: string
  filename: string
  children?: React.ReactNode
}

export function DiagramSection({ title, chart, filename, children }: DiagramSectionProps) {
  const downloadSvg = useCallback(async () => {
    const blob = await fetchMermaidSvg(chart)
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [chart, filename])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <button
          onClick={downloadSvg}
          className="text-xs text-slate-400 hover:text-blue-500 transition-colors"
        >
          Download SVG
        </button>
      </div>
      {children || (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800">
          <MermaidDiagram chart={chart} />
        </div>
      )}
    </div>
  )
}
