import localforage from 'localforage'
import type { ProjectPlan } from '@/schema/project-plan'
import type { Message } from '@/schema/conversation'

const store = localforage.createInstance({
  name: 'think-tank',
  storeName: 'projects',
})

export interface StoredProject {
  id: string
  name: string
  idea: string
  plan: ProjectPlan
  messages: Message[]
  personality: string
  createdAt: string
  updatedAt: string
}

export async function saveProject(project: StoredProject): Promise<void> {
  project.updatedAt = new Date().toISOString()
  await store.setItem(project.id, project)
}

export async function listProjects(): Promise<StoredProject[]> {
  const projects: StoredProject[] = []
  await store.iterate<StoredProject, void>((value) => {
    projects.push(value)
  })
  return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function deleteProject(id: string): Promise<void> {
  await store.removeItem(id)
}
