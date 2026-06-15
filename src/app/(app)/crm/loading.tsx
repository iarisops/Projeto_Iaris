import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function CRMLoading() {
  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <Skeleton height="24px" width="180px" />
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="min-w-64" />
        ))}
      </div>
    </div>
  )
}
