import { useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { useSettingsStore } from '@/stores/settings-store'
import {
  PROVIDER_PRESETS,
  PERSONALITY_INFO,
  type Personality,
  type ProviderConfig,
} from '@/schema/settings'
import { createProvider } from '@/providers/registry'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { provider, personality, voiceEnabled, setProvider, setPersonality, setVoiceEnabled } =
    useSettingsStore()
  const [providerType, setProviderType] = useState(provider?.type || 'openai')
  const [apiKey, setApiKey] = useState(provider?.apiKey || '')
  const [model, setModel] = useState(provider?.model || '')
  const [baseUrl, setBaseUrl] = useState(provider?.baseUrl || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const selectedPreset = PROVIDER_PRESETS.find((p) => p.type === providerType)

  const handleSave = () => {
    const config: ProviderConfig = {
      id: providerType,
      type: providerType,
      name: selectedPreset?.name || providerType,
      apiKey,
      model: model || selectedPreset?.models[0] || '',
      baseUrl:
        providerType === 'openai-compatible'
          ? baseUrl || 'http://localhost:11434/v1'
          : selectedPreset?.baseUrl,
    }
    setProvider(config)
    onClose()
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const config: ProviderConfig = {
        id: providerType,
        type: providerType,
        name: '',
        apiKey,
        model: model || selectedPreset?.models[0] || '',
        baseUrl:
          providerType === 'openai-compatible'
            ? baseUrl || 'http://localhost:11434/v1'
            : selectedPreset?.baseUrl,
      }
      const p = createProvider(config)
      const ok = await p.validateKey()
      setTestResult(ok ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-5">
        <ProviderFields
          providerType={providerType}
          apiKey={apiKey}
          baseUrl={baseUrl}
          model={model}
          selectedPreset={selectedPreset}
          testing={testing}
          testResult={testResult}
          onProviderTypeChange={(type) => {
            setProviderType(type)
            const preset = PROVIDER_PRESETS.find((p) => p.type === type)
            setBaseUrl(preset?.baseUrl || '')
            setModel(preset?.models[0] || '')
            setTestResult(null)
          }}
          onApiKeyChange={(val) => {
            setApiKey(val)
            setTestResult(null)
          }}
          onBaseUrlChange={setBaseUrl}
          onModelChange={setModel}
          onTest={handleTest}
        />

        <hr className="border-slate-200 dark:border-slate-700" />

        <PersonalitySelector personality={personality} onSelect={setPersonality} />

        <hr className="border-slate-200 dark:border-slate-700" />

        <VoiceToggle enabled={voiceEnabled} onToggle={setVoiceEnabled} />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface ProviderFieldsProps {
  providerType: string
  apiKey: string
  baseUrl: string
  model: string
  selectedPreset: (typeof PROVIDER_PRESETS)[number] | undefined
  testing: boolean
  testResult: 'success' | 'error' | null
  onProviderTypeChange: (type: ProviderConfig['type']) => void
  onApiKeyChange: (value: string) => void
  onBaseUrlChange: (value: string) => void
  onModelChange: (value: string) => void
  onTest: () => void
}

function ProviderFields({
  providerType,
  apiKey,
  baseUrl,
  model,
  selectedPreset,
  testing,
  testResult,
  onProviderTypeChange,
  onApiKeyChange,
  onBaseUrlChange,
  onModelChange,
  onTest,
}: ProviderFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Provider
        </label>
        <select
          value={providerType}
          onChange={(e) => onProviderTypeChange(e.target.value as ProviderConfig['type'])}
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {PROVIDER_PRESETS.map((p) => (
            <option key={p.type} value={p.type}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Stored locally in your browser. Never sent anywhere except your chosen provider.
        </p>
      </div>

      {providerType === 'openai-compatible' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Endpoint URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder="http://localhost:11434/v1"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Model
        </label>
        {selectedPreset?.models.length ? (
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {selectedPreset.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="llama3, mistral, etc."
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={onTest} disabled={!apiKey || testing}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        {testResult === 'success' && (
          <span className="text-sm text-green-600">Connected successfully!</span>
        )}
        {testResult === 'error' && (
          <span className="text-sm text-red-600">
            Connection failed. Check your key and settings.
          </span>
        )}
      </div>
    </>
  )
}

interface PersonalitySelectorProps {
  personality: Personality
  onSelect: (personality: Personality) => void
}

function VoiceToggle({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Voice Mode
          </label>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Speak your answers and listen to AI responses
          </p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          role="switch"
          aria-checked={enabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${enabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
      {enabled && (
        <p className="text-xs text-slate-500 mt-2">
          Uses your browser&apos;s built-in speech recognition (Chrome/Edge) and text-to-speech.
          Free, no API key needed.
        </p>
      )}
    </div>
  )
}

function PersonalitySelector({ personality, onSelect }: PersonalitySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        AI Personality
      </label>
      <div className="grid grid-cols-1 gap-2">
        {(
          Object.entries(PERSONALITY_INFO) as [
            Personality,
            (typeof PERSONALITY_INFO)[Personality],
          ][]
        ).map(([key, info]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
              personality === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">{info.emoji}</span>
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{info.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{info.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
