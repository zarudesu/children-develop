import { Skeleton } from './Skeleton'

export function GeneratorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
      {/* Icon and Title */}
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
        <div className="flex-1">
          <Skeleton className="mb-2" width="60%" height={24} />
          <Skeleton width="90%" />
          <Skeleton width="80%" />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2 mb-4">
        <Skeleton width="40%" />
        <div className="flex gap-2">
          <Skeleton width={80} height={28} className="rounded-full" />
          <Skeleton width={80} height={28} className="rounded-full" />
          <Skeleton width={80} height={28} className="rounded-full" />
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-2 mb-4">
        <Skeleton width="100%" height={16} />
        <Skeleton width="95%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="85%" height={16} />
      </div>

      {/* Button */}
      <Skeleton width="100%" height={48} className="rounded-xl" />
    </div>
  )
}

export function GeneratorGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <GeneratorCardSkeleton key={i} />
      ))}
    </div>
  )
}
