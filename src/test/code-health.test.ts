import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_DIR = resolve(fileURLToPath(import.meta.url), '..')
const SRC_DIR = resolve(THIS_DIR, '..')
const CLI_DIR = resolve(THIS_DIR, '../../cli')
const ROOT = resolve(THIS_DIR, '../..')

function getSourceFiles(dir: string, ext: string[]): string[] {
  const files: string[] = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'test' && entry.name !== 'node_modules') {
      files.push(...getSourceFiles(fullPath, ext))
    } else if (entry.isFile() && ext.some((e) => entry.name.endsWith(e))) {
      files.push(fullPath)
    }
  }
  return files
}

function countLines(filePath: string): { total: number; code: number } {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const blank = lines.filter((l: string) => l.trim() === '').length
  return { total: lines.length, code: lines.length - blank }
}

function getFunctionBodies(content: string): Array<{ name: string; lines: number }> {
  const results: Array<{ name: string; lines: number }> = []
  const regex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)[^{]*\{/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const name = match[1]
    const start = match.index
    let depth = 0
    let end = start
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') depth++
      if (content[i] === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    const body = content.slice(start, end + 1)
    results.push({ name, lines: body.split('\n').length })
  }
  return results
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('Code Health: File Size', () => {
  const MAX_FILE_LINES = 400
  const MAX_CLI_FILE_LINES = 700
  const sourceFiles = [
    ...getSourceFiles(SRC_DIR, ['.ts', '.tsx']),
    ...getSourceFiles(CLI_DIR, ['.ts']),
  ]

  it('has source files to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(0)
  })

  for (const file of sourceFiles) {
    const rel = relative(ROOT, file)
    it(`${rel} ≤ file size limit`, () => {
      const { total } = countLines(file)
      const limit = file.includes('cli/') ? MAX_CLI_FILE_LINES : MAX_FILE_LINES
      expect(total).toBeLessThanOrEqual(limit)
    })
  }
})

describe('Code Health: Function Size', () => {
  // React components with JSX get more room; plain functions stay tight
  const MAX_COMPONENT_LINES = 150
  const MAX_FUNCTION_LINES = 80
  const sourceFiles = getSourceFiles(SRC_DIR, ['.ts', '.tsx'])

  for (const file of sourceFiles) {
    const rel = relative(ROOT, file)
    const content = readFileSync(file, 'utf-8')
    const functions = getFunctionBodies(content)

    for (const fn of functions) {
      it(`${rel} → ${fn.name}() ≤ function size limit`, () => {
        const isComponent =
          (file.endsWith('.tsx') && fn.name[0] === fn.name[0].toUpperCase()) ||
          fn.name.startsWith('use')
        const limit = isComponent ? MAX_COMPONENT_LINES : MAX_FUNCTION_LINES
        expect(fn.lines).toBeLessThanOrEqual(limit)
      })
    }
  }
})

describe('Code Health: No console.log in source', () => {
  const sourceFiles = getSourceFiles(SRC_DIR, ['.ts', '.tsx'])

  for (const file of sourceFiles) {
    const rel = relative(ROOT, file)
    const content = readFileSync(file, 'utf-8')
    const count = (content.match(/console\.log\(/g) || []).length

    it(`${rel} has no console.log`, () => {
      expect(count).toBe(0)
    })
  }
})

describe('Code Health: Total Project Size', () => {
  it('total source lines < 5000', () => {
    const sourceFiles = [
      ...getSourceFiles(SRC_DIR, ['.ts', '.tsx']),
      ...getSourceFiles(CLI_DIR, ['.ts']),
    ]
    let total = 0
    for (const file of sourceFiles) {
      total += countLines(file).total
    }
    expect(total).toBeLessThan(6000)
  })
})
