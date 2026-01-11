"use client"

import { memo } from "react"
import { EdgeProps, getStraightPath } from "reactflow"

// Custom edge component for spouse connections (horizontal marriage line)
function CoupleEdgeComponent({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) {
  // Get straight path for horizontal connection between spouses
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  // Calculate exact midpoint for the heart icon
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  // Heart icon size
  const heartSize = 10

  return (
    <g>
      {/* Main marriage line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#f472b6"
        strokeWidth={2}
        strokeDasharray="6,4"
      />

      {/* White circle background */}
      <circle
        cx={midX}
        cy={midY}
        r={heartSize + 2}
        fill="white"
        stroke="#f472b6"
        strokeWidth="1.5"
      />

      {/* Heart icon - centered using SVG transform-origin */}
      <svg
        x={midX - heartSize}
        y={midY - heartSize}
        width={heartSize * 2}
        height={heartSize * 2}
        viewBox="0 0 24 24"
        fill="#f472b6"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </g>
  )
}

// Memoize to prevent unnecessary re-renders
export const CoupleEdge = memo(CoupleEdgeComponent)
