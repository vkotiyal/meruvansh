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
  ConnectionLineType,
} from "reactflow"
import "reactflow/dist/style.css"
import { FamilyNode } from "./family-node"
import { CoupleEdge } from "./couple-edge"

// =============================================================================
// Types
// =============================================================================

interface TreeNode {
  id: string
  name: string
  nickname?: string | null
  email?: string | null
  profilePicture?: string | null
  parentId?: string | null
  birthDate?: Date | null
  gender?: string | null
  spouseId?: string | null
}

interface TreeViewProps {
  nodes: TreeNode[]
}

interface LayoutNode {
  id: string
  node: TreeNode
  spouse?: TreeNode
  children: LayoutNode[]
  level: number
  x: number
  y: number
  width: number // Width of this node (or couple)
  subtreeWidth: number // Width needed for entire subtree
}

// =============================================================================
// Layout Constants
// =============================================================================

const NODE_WIDTH = 200
const NODE_HEIGHT = 80
const COUPLE_GAP = 40 // Gap between spouses
const SIBLING_GAP = 60 // Gap between siblings/cousins
const GENERATION_GAP = 120 // Vertical gap between generations
const COUPLE_WIDTH = NODE_WIDTH * 2 + COUPLE_GAP

// =============================================================================
// Node & Edge Types
// =============================================================================

const nodeTypes = {
  family: FamilyNode,
}

const edgeTypes = {
  couple: CoupleEdge,
}

// =============================================================================
// Layout Algorithm
// =============================================================================

function buildLayoutTree(nodes: TreeNode[]): LayoutNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const processedIds = new Set<string>()

  // Find root nodes (nodes without parents, excluding secondary spouses)
  const roots: TreeNode[] = []

  for (const node of nodes) {
    if (node.parentId) continue // Has parent, not a root
    if (processedIds.has(node.id)) continue

    // Check if this node is a secondary spouse of another root
    if (node.spouseId) {
      const spouse = nodeMap.get(node.spouseId)
      if (spouse && !spouse.parentId && node.id > spouse.id) {
        // This is a secondary spouse, will be handled with primary
        continue
      }
    }

    roots.push(node)
    processedIds.add(node.id)
    if (node.spouseId) processedIds.add(node.spouseId)
  }

  // Build layout tree recursively
  function buildNode(node: TreeNode, level: number): LayoutNode {
    const spouse = node.spouseId ? nodeMap.get(node.spouseId) : undefined
    const hasSpouse = !!spouse
    const nodeWidth = hasSpouse ? COUPLE_WIDTH : NODE_WIDTH

    // Get children (from both spouses if applicable)
    const childIds = new Set<string>()
    for (const n of nodes) {
      if (n.parentId === node.id) childIds.add(n.id)
      if (spouse && n.parentId === spouse.id) childIds.add(n.id)
    }

    // Build children layout nodes (skip secondary spouses)
    const children: LayoutNode[] = []
    const childIdArray = Array.from(childIds)
    for (const childId of childIdArray) {
      const child = nodeMap.get(childId)
      if (!child) continue

      // Skip if this child is a secondary spouse (will be handled with primary)
      if (child.spouseId && child.id > child.spouseId) {
        const primarySpouse = nodeMap.get(child.spouseId)
        if (primarySpouse && childIds.has(primarySpouse.id)) {
          continue // Primary spouse is also a child, skip secondary
        }
      }

      children.push(buildNode(child, level + 1))
    }

    // Sort children by birth date (eldest first - oldest on left)
    children.sort((a, b) => {
      const aDate = a.node.birthDate ? new Date(a.node.birthDate).getTime() : Infinity
      const bDate = b.node.birthDate ? new Date(b.node.birthDate).getTime() : Infinity
      // If both have dates, sort by date (ascending = eldest first)
      if (aDate !== Infinity && bDate !== Infinity) {
        return aDate - bDate
      }
      // If only one has a date, put the one with date first
      if (aDate !== Infinity) return -1
      if (bDate !== Infinity) return 1
      // If neither has a date, sort by ID for consistency
      return a.node.id.localeCompare(b.node.id)
    })

    // Calculate subtree width
    let subtreeWidth = nodeWidth
    if (children.length > 0) {
      const childrenWidth =
        children.reduce((sum, c) => sum + c.subtreeWidth, 0) + (children.length - 1) * SIBLING_GAP
      subtreeWidth = Math.max(nodeWidth, childrenWidth)
    }

    return {
      id: node.id,
      node,
      spouse,
      children,
      level,
      x: 0,
      y: level * (NODE_HEIGHT + GENERATION_GAP),
      width: nodeWidth,
      subtreeWidth,
    }
  }

  return roots.map((root) => buildNode(root, 0))
}

function positionNodes(layoutNodes: LayoutNode[], startX: number = 0): void {
  let currentX = startX

  for (const layoutNode of layoutNodes) {
    // Position this node centered over its subtree
    const subtreeCenter = currentX + layoutNode.subtreeWidth / 2
    layoutNode.x = subtreeCenter - layoutNode.width / 2

    // Position children
    if (layoutNode.children.length > 0) {
      let childX = currentX

      // If subtree is wider than children, center children under parent
      const childrenTotalWidth =
        layoutNode.children.reduce((sum, c) => sum + c.subtreeWidth, 0) +
        (layoutNode.children.length - 1) * SIBLING_GAP

      if (childrenTotalWidth < layoutNode.subtreeWidth) {
        childX = currentX + (layoutNode.subtreeWidth - childrenTotalWidth) / 2
      }

      for (const child of layoutNode.children) {
        positionNodes([child], childX)
        childX += child.subtreeWidth + SIBLING_GAP
      }

      // Re-center parent over actual children positions
      const firstChild = layoutNode.children[0]
      const lastChild = layoutNode.children[layoutNode.children.length - 1]
      const childrenCenter =
        (firstChild.x + firstChild.width / 2 + lastChild.x + lastChild.width / 2) / 2
      layoutNode.x = childrenCenter - layoutNode.width / 2
    }

    currentX += layoutNode.subtreeWidth + SIBLING_GAP
  }
}

function flattenLayoutTree(layoutNodes: LayoutNode[]): LayoutNode[] {
  const result: LayoutNode[] = []

  function traverse(nodes: LayoutNode[]) {
    for (const node of nodes) {
      result.push(node)
      traverse(node.children)
    }
  }

  traverse(layoutNodes)
  return result
}

function createFlowNodes(layoutNodes: LayoutNode[]): Node[] {
  const flowNodes: Node[] = []

  for (const layoutNode of layoutNodes) {
    // Add primary node (left spouse in a couple)
    flowNodes.push({
      id: layoutNode.node.id,
      type: "family",
      position: { x: layoutNode.x, y: layoutNode.y },
      data: {
        ...layoutNode.node,
        spouseGender: layoutNode.spouse?.gender, // Spouse's gender for handle color
        isLeftSpouse: !!layoutNode.spouse, // Is left spouse if has a spouse
      },
    })

    // Add spouse node if exists (right spouse in a couple)
    if (layoutNode.spouse) {
      flowNodes.push({
        id: layoutNode.spouse.id,
        type: "family",
        position: {
          x: layoutNode.x + NODE_WIDTH + COUPLE_GAP,
          y: layoutNode.y,
        },
        data: {
          ...layoutNode.spouse,
          spouseGender: layoutNode.node.gender, // Primary node's gender for handle color
          isLeftSpouse: false, // Is right spouse
        },
      })
    }
  }

  return flowNodes
}

function createFlowEdges(layoutNodes: LayoutNode[]): Edge[] {
  const edges: Edge[] = []
  const addedEdges = new Set<string>()

  for (const layoutNode of layoutNodes) {
    // Add spouse edge (marriage line) - uses right handle of left spouse, left handle of right spouse
    if (layoutNode.spouse) {
      const edgeId = `spouse-${layoutNode.node.id}-${layoutNode.spouse.id}`
      if (!addedEdges.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: layoutNode.node.id,
          target: layoutNode.spouse.id,
          sourceHandle: "right",
          targetHandle: "left",
          type: "couple",
        })
        addedEdges.add(edgeId)
      }
    }

    // Add parent-child edges
    for (const child of layoutNode.children) {
      // Connect from the center of the couple (or single parent) to child
      const parentId = layoutNode.node.id
      const edgeId = `parent-${parentId}-${child.node.id}`

      if (!addedEdges.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: parentId,
          target: child.node.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          type: "smoothstep",
          animated: false,
          style: {
            stroke: "#64748b", // slate-500
            strokeWidth: 2,
          },
        })
        addedEdges.add(edgeId)
      }
    }
  }

  return edges
}

// =============================================================================
// Component
// =============================================================================

export function TreeView({ nodes }: TreeViewProps) {
  const { flowNodes, flowEdges } = useMemo(() => {
    if (nodes.length === 0) {
      return { flowNodes: [], flowEdges: [] }
    }

    // Build layout tree
    const layoutTree = buildLayoutTree(nodes)

    // Position all nodes
    positionNodes(layoutTree, 0)

    // Flatten for processing
    const flatLayout = flattenLayoutTree(layoutTree)

    // Convert to React Flow format
    const flowNodes = createFlowNodes(flatLayout)
    const flowEdges = createFlowEdges(flatLayout)

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
      edgeTypes={edgeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      fitViewOptions={{
        padding: 0.05,
        minZoom: 0.1,
        maxZoom: 1,
      }}
      minZoom={0.02}
      maxZoom={2}
    >
      <Background color="#e2e8f0" gap={20} />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const gender = node.data?.gender
          if (gender === "male") return "#93c5fd" // blue-300
          if (gender === "female") return "#f9a8d4" // pink-300
          if (gender === "other") return "#c4b5fd" // purple-300
          return "#cbd5e1" // slate-300
        }}
        maskColor="rgba(0, 0, 0, 0.1)"
        style={{
          backgroundColor: "#f8fafc",
        }}
      />
    </ReactFlow>
  )
}
