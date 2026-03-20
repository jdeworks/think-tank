import { useEffect, useState, useSyncExternalStore } from 'react'
import { listProjects, deleteProject, type StoredProject } from '@/storage/project-db'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/common/Button'

// Track a version counter to trigger re-fetches
let projectListVersion = 0
const listeners = new Set<() => void>()
function bumpVersion() {
  projectListVersion++
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function getSnapshot() {
  return projectListVersion
}

export function ProjectList() {
  const [projects, setProjects] = useState<StoredProject[]>([])
  const [loading, setLoading] = useState(true)
  const loadFromStored = useProjectStore((s) => s.loadFromStored)
  const setView = useUIStore((s) => s.setView)

  const version = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    let cancelled = false
    listProjects().then((list) => {
      if (!cancelled) {
        setProjects(list)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [version])

  const handleOpen = (project: StoredProject) => {
    loadFromStored(project)
    setView('chat')
  }

  const handleDelete = async (id: string) => {
    await deleteProject(id)
    bumpVersion()
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading...</div>
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-slate-400 dark:text-slate-500 py-8">
        <p className="text-lg mb-1">No projects yet</p>
        <p className="text-sm">Start by describing your idea above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Your Projects
      </h3>
      {projects.map((project) => (
        <div
          key={project.id}
          className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
        >
          <button onClick={() => handleOpen(project)} className="flex-1 text-left">
            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.name || 'Untitled'}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {project.idea}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(project.id)
            }}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-3"
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}
