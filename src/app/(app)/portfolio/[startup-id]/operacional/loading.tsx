import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

export default function OperacionalLoading() {
  return (
    <div className="flex flex-col gap-0">
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton width="48px" height="48px" />
          <div className="flex flex-col gap-2">
            <Skeleton height="20px" width="180px" />
            <Skeleton height="14px" width="280px" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10 px-6 pb-12 pt-8 max-w-5xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton height="16px" width="160px" />
            <SkeletonText lines={4} />
          </div>
        ))}
      </div>
    </div>
  )
}
