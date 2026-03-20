function toMermaidInkUrl(mmdContent: string): string | null {
  try {
    const encoded = btoa(unescape(encodeURIComponent(mmdContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return `https://mermaid.ink/svg/${encoded}`
  } catch {
    return null
  }
}

/**
 * Fetches a rendered SVG from mermaid.ink for download/export.
 */
export async function fetchMermaidSvg(mmdContent: string): Promise<Blob | null> {
  const url = toMermaidInkUrl(mmdContent)
  if (!url) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    return res.blob()
  } catch {
    return null
  }
}
