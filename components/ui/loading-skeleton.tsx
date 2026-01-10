import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-6">
            <LoadingSkeleton className="h-4 w-24" />
            <LoadingSkeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <LoadingSkeleton className="h-6 w-32" />
        {[...Array(3)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

export function MemberListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-10 w-32" />
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
            <LoadingSkeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-32" />
              <LoadingSkeleton className="h-3 w-48" />
            </div>
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
