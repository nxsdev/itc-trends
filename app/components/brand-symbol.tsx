import type * as React from "react"
import { Theme, useTheme } from "remix-themes"

interface BrandSymbolProps {
  width?: number
  className?: string
}

export const BrandSymbol: React.FC<BrandSymbolProps> = ({ width = 40, className }) => {
  // オリジナルのビューボックスサイズ
  const originalWidth = 200
  const originalHeight = 200

  // アスペクト比を維持しながら高さを計算
  const height = width * (originalHeight / originalWidth)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${originalWidth} ${originalHeight}`}
      className={`h-auto w-full ${className || ""}`}
      style={{
        maxWidth: `${width}px`,
        aspectRatio: `${originalWidth} / ${originalHeight}`,
      }}
    >
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#52C69F" />
          <stop offset="37.14%" stopColor="#51C7A8" />
          <stop offset="98.69%" stopColor="#4DC9C1" />
          <stop offset="100%" stopColor="#4CC9C2" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2C7F6B" />
          <stop offset="52.5%" stopColor="#1B514A" />
          <stop offset="100%" stopColor="#082426" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#52C69F" />
          <stop offset="45.83%" stopColor="#52C6A2" />
          <stop offset="72.98%" stopColor="#50C7AC" />
          <stop offset="94.4%" stopColor="#4DC9BC" />
          <stop offset="100%" stopColor="#4CC9C2" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 200) scale(1, -1)">
        <path
          d="M182.239 169.859C167.733 169.859 154.944 160.346 150.772 146.452L106.498 28.127H169.936L219.901 165.401C220.568 167.623 218.904 169.859 216.585 169.859Z"
          fill="url(#gradient1)"
        />
        <path d="M69.563 129.364L106.411 28.127H169.936L132.056 129.364Z" fill="url(#gradient2)" />
        <path
          d="M69.237 129.364L34.012 32.585C33.345 30.363 35.008 28.127 37.327 28.127H71.673C86.18 28.127 98.969 37.64 103.141 51.533L132.056 129.364Z"
          fill="url(#gradient3)"
        />
      </g>
    </svg>
  )
}
