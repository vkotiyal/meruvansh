"use client"

import { useMemo } from "react"
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow"
import "reactflow/dist/style.css"
import { FamilyNode } from "./family-node"

interface TreeNode {
  id: string
  name: string
  nickname?: string | null
  email?: string | null
  profilePicture?: string | null
  parentId?: string | null
  birthDate?: Date | null
  gender?: string | null
}

interface TreeViewProps {
  nodes: TreeNode[]
}

const nodeTypes = {
  family: FamilyNode,
}

export function TreeView({ nodes }: TreeViewProps) {
  // Build tree structure and calculate positions
  const { flowNodes, flowEdges } = useMemo(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const roots = nodes.filter((n) => !n.parentId)

    // Calculate positions using a hierarchical tree layout
    const positions = new Map<string, { x: number; y: number }>()
    const levelWidth = new Map<number, number>()

    function calculatePositions(
      nodeId: string,
      level: number = 0,
      offset: number = 0
    ): number {
      const node = nodeMap.get(nodeId)
      if (!node) return 0

      const children = nodes.filter((n) => n.parentId === nodeId)
      const childCount = children.length

      if (childCount === 0) {
        // Leaf node
        const width = levelWidth.get(level) || 0
        levelWidth.set(level, width + 1)
        positions.set(nodeId, { x: (width + offset) * 300, y: level * 150 })
        return 1
      }

      // Calculate children positions first
      let currentOffset = offset
      children.forEach((child) => {
        const width = calculatePositions(child.id, level + 1, currentOffset)
        currentOffset += width
      })

      // Position parent in the middle of children
      const firstChild = children[0]
      const lastChild = children[children.length - 1]
      const firstPos = positions.get(firstChild.id)!
      const lastPos = positions.get(lastChild.id)!
      const parentX = (firstPos.x + lastPos.x) / 2

      positions.set(nodeId, { x: parentX, y: level * 150 })

      return currentOffset - offset
    }

    // Calculate positions for each root
    let globalOffset = 0
    roots.forEach((root) => {
      const width = calculatePositions(root.id, 0, globalOffset)
      globalOffset += width
    })

    // Convert to React Flow format
    const flowNodes: Node[] = nodes.map((node) => {
      const pos = positions.get(node.id) || { x: 0, y: 0 }
      return {
        id: node.id,
        type: "family",
        position: pos,
        data: node,
      }
    })

    const flowEdges: Edge[] = nodes
      .filter((node) => node.parentId)
      .map((node) => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId!,
        target: node.id,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      }))

    return { flowNodes, flowEdges }
  }, [nodes])

  const [nodesState, , onNodesChange] = useNodesState(flowNodes)
  const [edgesState, , onEdgesChange] = useEdgesState(flowEdges)

  return (
    <ReactFlow
      nodes={nodesState}
      edges={edgesState}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      maxZoom={1.5}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
    >
      <Background />
      <Controls />
      <MiniMap nodeColor="#94a3b8" />
    </ReactFlow>
  )
}
