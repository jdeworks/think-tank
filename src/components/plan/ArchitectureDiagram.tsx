import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'

interface Component {
  name: string
  description: string
  connections?: string[]
}

interface ArchitectureDiagramProps {
  components: Component[]
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 80

function layoutNodes(components: Component[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 })

  const nodes: Node[] = []
  const edges: Edge[] = []

  for (const comp of components) {
    g.setNode(comp.name, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const comp of components) {
    if (comp.connections) {
      for (const target of comp.connections) {
        if (components.some((c) => c.name === target)) {
          g.setEdge(comp.name, target)
          edges.push({
            id: `${comp.name}-${target}`,
            source: comp.name,
            target,
            animated: true,
            style: { stroke: 'var(--text-secondary)' },
          })
        }
      }
    }
  }

  dagre.layout(g)

  for (const comp of components) {
    const node = g.node(comp.name)
    nodes.push({
      id: comp.name,
      position: { x: node.x - NODE_WIDTH / 2, y: node.y - NODE_HEIGHT / 2 },
      data: { label: comp.name, description: comp.description },
      type: 'default',
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: 'var(--bg-alt)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    })
  }

  return { nodes, edges }
}

export function ArchitectureDiagram({ components }: ArchitectureDiagramProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => layoutNodes(components),
    [components],
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  if (components.length === 0) return null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
