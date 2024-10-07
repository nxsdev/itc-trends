import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { useAtom } from "jotai"
import { Building, Link, Share } from "lucide-react"
import type * as React from "react"
import { RiTwitterXLine } from "react-icons/ri"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { envAtom } from "~/atoms/env-atom"
import { TrendingBadge } from "~/components/charts/tranding-badge"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import { Menu, MenuItem, MenuRoot } from "~/components/ui/menu"
import { Separator } from "~/components/ui/separator"
import { Tooltip } from "~/components/ui/tooltip"
import { cn } from "~/lib/utils"
import type { CompanyChart } from "../types.js"
import { FavoriteButton } from "./favorite-button.js"

type InsuredCountChartProps = {
  company: CompanyChart
}

function getVariantFromPercentChange(percentChange: number): "up" | "down" | "flat" {
  if (percentChange > 0) return "up"
  if (percentChange < 0) return "down"
  return "flat"
}

function getChartColor(variant: "up" | "down" | "flat"): string {
  return "hsl(var(--brand-default))"
}

const chartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--brand-default))",
  },
}

export function InsuredCountChart({ company }: InsuredCountChartProps) {
  const { chartData, periodSummary, name, url, finalCount } = company
  const [env] = useAtom(envAtom)
  const shareUrl = `${env?.APP_URL}/search/?q=${company.corporateNumber}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("リンクがクリップボードにコピーされました")
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました", err)
      toast.error("リンクのコピーに失敗しました。しばらく時間をおいてお試しください")
    }
  }

  const variant = getVariantFromPercentChange(periodSummary.percentChange)
  const gradientId = `fillDesktop-${variant}`

  return (
    <Card className="rounded-xl">
      <CardHeader className="px-3 py-2.5">
        <div className="flex items-center justify-end space-x-2">
          <MenuRoot>
            <div className="mx-auto ml-0 flex justify-start text-left">
              <Badge variant="default" size="sm" className="h-6 text-foreground-light text-xs">
                <div className="flex items-center">
                  <Building className="mr-2 size-5 text-foreground-muted" />
                  {company.corporateNumber}
                </div>
              </Badge>
            </div>
            <Button
              variant="default"
              size="2xs"
              className="h-6 data-[pressed]:border-border-stronger"
            >
              <Share className="text-foreground-muted " />
              <span className="text-xs">シェア</span>
            </Button>
            <Menu>
              <MenuItem
                onAction={handleCopyLink}
                prefix={<Link className="mr-2 text-foreground-light" />}
              >
                リンクをコピー
              </MenuItem>
              <MenuItem
                href={`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                prefix={<RiTwitterXLine className="mr-2 text-foreground-light" />}
              >
                ポスト
              </MenuItem>
            </Menu>
          </MenuRoot>
          <FavoriteButton
            companyId={company.id}
            initialFavoriteCount={company.favoriteCount}
            isFavorite={company.isFavorite}
          />
        </div>
      </CardHeader>
      <Separator className="!h-[0.5px]" />

      <CardContent className="px-0 pt-4 pb-2">
        <div className="space-y-1.5 px-5 pb-4">
          <CardTitle className="text-sm">{name}</CardTitle>
          <div className="flex items-center gap-2 text-foreground-muted text-xs">
            <img
              src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=32`}
              alt={name}
              loading="lazy"
              width="16"
              height="16"
            />
            <a href={url ?? ""} target="_blank" rel="noreferrer">
              <span className="text-foreground-light">{url}</span>
            </a>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-medium text-lg">{finalCount}</span>
            <span className="font-medium">人</span>
            <TrendingBadge
              className="mx-1"
              variant={variant}
              percentage={Number(periodSummary.percentChange.toFixed(2))}
              value={periodSummary.countChange}
            />
            <span className="text-foreground-light text-xs">
              {chartData[chartData.length - 1].countDate}
            </span>
            <Tooltip
              className="w-64 text-xs"
              content={
                <>
                  日本年金機構に掲載された被保険者数のデータを掲載しています。
                  <br />
                  前月20日頃時点のデータを翌月第2営業日に更新します。
                  <br />
                  <br />
                  被保険者数は、従業員の入社・退職だけでなく、
                  <strong>
                    会社分割・事業譲渡・合併などの組織変更によっても大きく変動する可能性があります。
                  </strong>
                  <br />
                </>
              }
            >
              <Button variant="ghost" size="xs" shape="circle">
                <QuestionMarkCircledIcon className="size-4 text-foreground-light" />
              </Button>
            </Tooltip>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="pr-4 pl-3">
          <AreaChart accessibilityLayer data={chartData} margin={{ top: 4, left: 0, right: 8 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getChartColor(variant)} stopOpacity={0.4} />
                <stop offset="95%" stopColor={getChartColor(variant)} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={6} fontSize={10} />
            <YAxis
              tickFormatter={(value) =>
                value < 1000 ? Math.floor(value).toString() : `${(value / 1000).toFixed(1)}K`
              }
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={38}
              fontSize={10}
              domain={[(dataMin: number) => (dataMin < 10 ? 0 : Math.floor(dataMin * 0.9)), "auto"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  hideLabel
                  formatter={(value, _name, props) => {
                    const { payload, color } = props

                    return (
                      <>
                        <div className="grid grid-cols-1 gap-1">
                          <span className="text-xs">{payload.countDate}</span>
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                                "h-2.5 w-2.5"
                              )}
                              style={
                                {
                                  "--color-bg": color,
                                  "--color-border": color,
                                } as React.CSSProperties
                              }
                            />
                            <span className="ml-1 text-xs">被保険者数 {value}</span>
                          </div>
                        </div>
                      </>
                    )
                  }}
                />
              }
            />

            <Area
              dataKey="insuredCount"
              type="linear"
              fill={`url(#${gradientId})`}
              fillOpacity={0.2}
              stroke={getChartColor(variant)}
              strokeWidth={1.2}
              animationBegin={0}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
