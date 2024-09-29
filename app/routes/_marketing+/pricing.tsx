"use client"
import { useState } from "react"
import { cn } from "~/lib/utils"

import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/field"
import { Radio, RadioGroupRoot } from "~/components/ui/radio-group"
import { useUser } from "~/hooks/use-user"

export interface PricingTierFrequency {
  id: string
  value: string
  label: string
  priceSuffix: string
}

export interface PricingTier {
  name: string
  id: string
  href: string
  discountPrice: string | Record<string, string>
  price: string | Record<string, string>
  description: string | React.ReactNode
  features: string[]
  featured?: boolean
  highlighted?: boolean
  cta: string
  soldOut?: boolean
}

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-brand"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PricingPage() {
  const user = useUser()

  const frequencies: PricingTierFrequency[] = [
    { id: "1", value: "1", label: "月払い", priceSuffix: "/月" },
    { id: "2", value: "2", label: "買い切り", priceSuffix: "" },
  ]

  const [frequency, setFrequency] = useState(frequencies[0])

  const tiers: PricingTier[] = [
    {
      name: "Pro",
      id: "0",
      href: "/subscribe",
      price: { "1": "￥190", "2": "￥780" },
      discountPrice: { "1": "", "2": "" },
      description: `月払い、買い切りからお選びいただけます。機能に違いはありません。`,
      features: ["300件のお気に入り登録", "アクセス制限なし", "広告非表示"],
      featured: false,
      highlighted: false,
      soldOut: false,
      cta: `Sign up`,
    },
  ]

  const tier = tiers[0]

  return (
    <div className={cn("flex w-full flex-col items-center")}>
      <p className="pt-12 text-foreground-light text-md">
        現在無料でご利用いただけます。有料機能につきましては準備中です。
      </p>
      {/* <div className="mb-24 flex w-full flex-col items-center">
        <div className="mx-auto max-w-7xl px-6 xl:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h1 className="text-foreground text-4xl font-semibold max-w-xs sm:max-w-none md:text-4xl !leading-tight">
              シンプルで柔軟な料金プラン
            </h1>
            <p className="mt-6 text-lg text-foreground-muted">
              無料で始めて、必要に応じてアップグレード。あなたのペースで成長できます。
            </p>
          </div>

          {frequencies.length > 1 ? (
            <div className="mt-16 flex justify-center">
              <RadioGroupRoot
                defaultValue={frequency.value}
                onChange={(value: string) => {
                  setFrequency(frequencies.find((f) => f.value === value)!)
                }}
                className="grid gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-border-strong"
                style={{
                  gridTemplateColumns: `repeat(${frequencies.length}, minmax(0, 1fr))`,
                }}
              >
                <Label className="sr-only">Payment frequency</Label>
                {frequencies.map((option) => (
                  <div key={option.value} className="relative">
                    <Radio
                      value={option.value}
                      id={option.value}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <Label
                      htmlFor={option.value}
                      className={cn(
                        "cursor-pointer rounded-full px-2.5 py-2 transition-all block w-full",
                        frequency.value === option.value
                          ? "bg-brand-500 text-foreground"
                          : "bg-transparent text-foreground-muted hover:bg-brand-500"
                      )}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroupRoot>
            </div>
          ) : (
            <div className="mt-12" aria-hidden="true"></div>
          )}

          <div className="flex flex-wrap xl:flex-nowrap items-center backdrop-blur-md mx-auto mt-4 max-w-2xl rounded-3xl ring-1 ring-gray-300/70 dark:ring-gray-700 xl:mx-0 xl:flex xl:max-w-none">
            <div className="p-8 sm:p-10 xl:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight">{tier.name}</h3>
              <p className="mt-6 leading-7 text-foreground-light text-sm">{tier.description}</p>
              <div className="mt-12 flex items-center gap-x-4">
                <h4 className="flex-none font-semibold text-sm leading-6">ご利用いただける機能</h4>
                <div className="h-px flex-auto bg-gray-100 dark:bg-gray-700" />
              </div>

              <ul className="mt-10 grid grid-cols-1 gap-4 text-sm leading-6 ">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="h-6 w-6 flex-none text-brand-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mt-2 p-2 xl:pr-8 xl:mt-0 w-full xl:max-w-md xl:flex-shrink-0">
              <div
                className={cn(
                  "rounded-2xl py-10 text-center ring-1 ring-inset ring-gray-300/50 dark:ring-gray-800/50 xl:flex xl:flex-col xl:justify-center xl:py-16"
                )}
              >
                <div className="mx-auto max-w-xs px-8">
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span
                      className={cn(
                        "text-5xl font-bold tracking-tight",
                        tier.discountPrice &&
                          tier.discountPrice[frequency.value as keyof typeof tier.discountPrice]
                          ? "line-through"
                          : ""
                      )}
                    >
                      {typeof tier.price === "string" ? tier.price : tier.price[frequency.value]}
                    </span>

                    <span>
                      {typeof tier.discountPrice === "string"
                        ? tier.discountPrice
                        : tier.discountPrice[frequency.value]}
                    </span>

                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-700 dark:text-gray-400">
                      {frequency.priceSuffix}
                    </span>
                  </p>
                  {user ? (
                    <>
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center mt-8 flex-shrink-0"
                      >
                        <Button size="lg">アップグレード</Button>
                      </a>
                      <p className="mt-2 text-xs leading-5 text-foreground-lighter">
                        今すぐ機能をお試しいただけます
                      </p>
                    </>
                  ) : (
                    <>
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center mt-8 flex-shrink-0"
                      >
                        <Button size="lg">{tier.cta}</Button>
                      </a>
                      <p className="mt-2 text-xs leading-5 text-foreground-lighter">
                        Sign up in seconds, no credit card required.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}
