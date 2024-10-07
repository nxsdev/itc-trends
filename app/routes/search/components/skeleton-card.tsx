import type React from "react"
import { ShimmerLoader } from "~/components/ui/shimmer-loader"
import { ShimmerSkeleton } from "~/components/ui/shimmer-skeleton"
import { cn } from "~/lib/utils"
import styles from "./skeleton-card.module.css"

export function SkeletonCard(): React.ReactElement {
  return (
    <div
      className={cn(
        // ベースのクラス
        "w-full overflow-hidden rounded-xl border border-border bg-surface-100 drop-shadow-md",
        // レスポンシブ aspect-ratio クラス
        "aspect-[370/351]", // base
        // "sm:aspect-[350/348]", // small screens (640px)
        // "md:aspect-[360/361]", // medium screens (768px)
        // "lg:aspect-[376/361]", // large screens (1024px)
        // "xl:aspect-[376/361]", // extra large screens (1280px)
        "max-h-[432px] min-h-[319px]"
      )}
    >
      <ShimmerLoader className="h-full">
        <div className="flex h-full flex-col p-3">
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-end space-x-2">
              <ShimmerSkeleton className="h-[22px] w-16" />
              <ShimmerSkeleton className="h-[22px] w-12" />
            </div>
            <div className="space-y-2.5 pt-2.5 pb-0.5">
              <ShimmerSkeleton className="h-6 w-2/3 bg-surface-400" />
              <ShimmerSkeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center space-x-2">
              <ShimmerSkeleton className="h-6 w-[210px]" />
              <ShimmerSkeleton className="size-6 rounded-full bg-surface-400" />
            </div>
          </div>
          <div className="relative grow">
            <ShimmerSkeleton className="absolute inset-0 rounded-lg" />
          </div>
        </div>
      </ShimmerLoader>
    </div>
  )
}
