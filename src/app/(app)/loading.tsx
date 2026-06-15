import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 px-6 py-8 max-w-5xl">
      <Skeleton height="28px" width="200px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
