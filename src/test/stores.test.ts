import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useUIStore } from '@/stores/ui-store'

describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      id: null,
      name: '',
      idea: '',
      plan: {
        meta: { version: '1.0', createdAt: '', lastModified: '' },
        overview: {},
        requirements: {},
        architecture: {},
        techStack: {},
        hosting: {},
        security: {},
        design: {},
        budget: {},
        timeline: {},
        risks: [],
        competitors: [],
      },
      messages: [],
      isLoading: false,
      error: null,
      totalTokens: 0,
    })
  })

  it('starts a new project', () => {
    const { startNewProject } = useProjectStore.getState()
    startNewProject('Build a todo app')

    const state = useProjectStore.getState()
    expect(state.id).toBeTruthy()
    expect(state.idea).toBe('Build a todo app')
    expect(state.messages).toEqual([])
    expect(state.plan.meta.version).toBe('1.0')
  })

  it('adds user messages', () => {
    const { startNewProject, addUserMessage } = useProjectStore.getState()
    startNewProject('idea')
    addUserMessage('Hello')

    const state = useProjectStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].role).toBe('user')
    expect(state.messages[0].content).toBe('Hello')
  })

  it('adds assistant messages', () => {
    const { startNewProject, addAssistantMessage } = useProjectStore.getState()
    startNewProject('idea')
    addAssistantMessage('Hi there')

    const state = useProjectStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].role).toBe('assistant')
  })

  it('updates plan sections (object merge)', () => {
    const { startNewProject, updatePlanSection } = useProjectStore.getState()
    startNewProject('idea')
    updatePlanSection('overview', { name: 'Test Project' })

    let state = useProjectStore.getState()
    expect(state.plan.overview.name).toBe('Test Project')

    updatePlanSection('overview', { description: 'A test' })
    state = useProjectStore.getState()
    expect(state.plan.overview.name).toBe('Test Project')
    expect(state.plan.overview.description).toBe('A test')
  })

  it('updates array sections', () => {
    const { startNewProject, updatePlanSection } = useProjectStore.getState()
    startNewProject('idea')

    // Direct array assignment
    updatePlanSection('risks', [
      {
        description: 'Risk 1',
        category: 'technical',
        impact: 'high',
        likelihood: 'high',
        mitigation: 'Fix',
      },
    ] as unknown as Record<string, unknown>)

    const state = useProjectStore.getState()
    expect(state.plan.risks).toHaveLength(1)
  })

  it('updates lastModified on plan change', async () => {
    const { startNewProject, updatePlanSection } = useProjectStore.getState()
    startNewProject('idea')

    const before = useProjectStore.getState().plan.meta.lastModified
    // Small delay to ensure timestamp changes
    await new Promise((r) => setTimeout(r, 5))
    updatePlanSection('overview', { name: 'Updated' })
    const after = useProjectStore.getState().plan.meta.lastModified

    expect(after).not.toBe(before)
  })

  it('sets loading state', () => {
    const { setLoading } = useProjectStore.getState()
    setLoading(true)
    expect(useProjectStore.getState().isLoading).toBe(true)
    setLoading(false)
    expect(useProjectStore.getState().isLoading).toBe(false)
  })

  it('sets error state', () => {
    const { setError } = useProjectStore.getState()
    setError('Something went wrong')
    expect(useProjectStore.getState().error).toBe('Something went wrong')
    setError(null)
    expect(useProjectStore.getState().error).toBeNull()
  })

  it('tracks token usage', () => {
    const { addTokens } = useProjectStore.getState()
    addTokens(100)
    addTokens(50)
    expect(useProjectStore.getState().totalTokens).toBe(150)
  })

  it('sets project name', () => {
    const { startNewProject, setName } = useProjectStore.getState()
    startNewProject('idea')
    setName('My Project')
    expect(useProjectStore.getState().name).toBe('My Project')
  })

  it('loads from stored project', () => {
    const { loadFromStored } = useProjectStore.getState()
    loadFromStored({
      id: 'stored-id',
      name: 'Stored Project',
      idea: 'stored idea',
      plan: {
        meta: { version: '1.0', createdAt: '2024-01-01', lastModified: '2024-01-01' },
        overview: { name: 'Stored' },
        requirements: {},
        architecture: {},
        techStack: {},
        hosting: {},
        security: {},
        design: {},
        budget: {},
        timeline: {},
        risks: [],
        competitors: [],
      },
      messages: [{ id: '1', role: 'user', content: 'Hello', timestamp: '2024-01-01' }],
      personality: 'friendly',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    })

    const state = useProjectStore.getState()
    expect(state.id).toBe('stored-id')
    expect(state.name).toBe('Stored Project')
    expect(state.messages).toHaveLength(1)
    expect(state.plan.overview.name).toBe('Stored')
  })
})

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      provider: null,
      personality: 'friendly',
    })
  })

  it('has default personality', () => {
    expect(useSettingsStore.getState().personality).toBe('friendly')
  })

  it('sets personality', () => {
    useSettingsStore.getState().setPersonality('critical')
    expect(useSettingsStore.getState().personality).toBe('critical')
  })

  it('sets provider', () => {
    useSettingsStore.getState().setProvider({
      id: 'openai',
      type: 'openai',
      name: 'OpenAI',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    })
    expect(useSettingsStore.getState().provider?.apiKey).toBe('sk-test')
  })

  it('clears provider', () => {
    useSettingsStore.getState().setProvider({
      id: 'openai',
      type: 'openai',
      name: 'OpenAI',
      apiKey: 'key',
      model: 'gpt-4o',
    })
    useSettingsStore.getState().clearProvider()
    expect(useSettingsStore.getState().provider).toBeNull()
  })
})

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      view: 'home',
      sidebarOpen: true,
      settingsOpen: false,
    })
  })

  it('starts at home view', () => {
    expect(useUIStore.getState().view).toBe('home')
  })

  it('changes view', () => {
    useUIStore.getState().setView('chat')
    expect(useUIStore.getState().view).toBe('chat')
  })

  it('toggles sidebar', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('sets settings open', () => {
    useUIStore.getState().setSettingsOpen(true)
    expect(useUIStore.getState().settingsOpen).toBe(true)
  })
})
