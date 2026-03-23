// Load prompt files bundled at build time via Vite's import.meta.glob.
// This eliminates runtime fetches to raw.githubusercontent.com and works
// offline, on any branch, and on GitHub Pages without 404s.

const promptModules = import.meta.glob('/prompts/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export async function loadSectionGuide(
  sectionNumber: number,
  sectionName: string,
): Promise<string> {
  const num = String(sectionNumber).padStart(2, '0')
  const key = `/prompts/sections/${num}-${sectionName}.md`
  return promptModules[key] || ''
}
