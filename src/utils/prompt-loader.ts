const REPO_BASE = 'https://raw.githubusercontent.com/jdeworks/think-tank/dev/prompts'

const cache = new Map<string, string>()

async function fetchPrompt(path: string): Promise<string> {
  const cached = cache.get(path)
  if (cached) return cached

  try {
    const res = await fetch(`${REPO_BASE}/${path}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const text = await res.text()
      cache.set(path, text)
      return text
    }
  } catch {
    // Offline or fetch failed — fall through to empty
  }
  return ''
}

export async function loadSectionGuide(
  sectionNumber: number,
  sectionName: string,
): Promise<string> {
  const num = String(sectionNumber).padStart(2, '0')
  return fetchPrompt(`sections/${num}-${sectionName}.md`)
}
