import { useRef } from 'react'
import { Button } from '@/components/common/Button'
import { importFromJSON } from '@/utils/export'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { createEmptyPlan, type PlanSectionKey } from '@/schema/project-plan'

export function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useProjectStore
  const setView = useUIStore((s) => s.setView)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const plan = await importFromJSON(file)
      const state = store.getState()
      state.startNewProject('Imported from file')
      state.setName(plan.overview?.name || file.name.replace('.json', ''))

      const empty = createEmptyPlan()
      for (const key of Object.keys(plan) as (keyof typeof plan)[]) {
        if (key === 'meta') continue
        const data = plan[key]
        if (data && JSON.stringify(data) !== JSON.stringify(empty[key as PlanSectionKey])) {
          state.updatePlanSection(key as PlanSectionKey, data as Record<string, unknown>)
        }
      }

      setView('plan')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to import file')
    }

    // Reset input so same file can be imported again
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
        Import JSON
      </Button>
    </>
  )
}
