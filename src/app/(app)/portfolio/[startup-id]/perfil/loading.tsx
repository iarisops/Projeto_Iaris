import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

export default function PerfilLoading() {
  return (
    <div className="px-6 py-8 max-w-3xl flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Skeleton width="64px" height="64px" />
        <div className="flex flex-col gap-2">
          <Skeleton height="22px" width="200px" />
          <Skeleton height="14px" width="140px" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton height="16px" width="140px" />
          <SkeletonText lines={3} />
        </div>
      ))}
    </div>
  )
}
