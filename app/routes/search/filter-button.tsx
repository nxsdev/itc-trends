import { useFetcher, useNavigate, useSearchParams } from "@remix-run/react"
import { redirect } from "@remix-run/react"
import { Filter } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Dialog, DialogFooter, DialogHeader, DialogRoot } from "~/components/ui/dialog"
import { Item } from "~/components/ui/list-box"
import { NumberField } from "~/components/ui/number-field"
import { Select } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { useMediaQuery } from "~/hooks/use-media-query"
import { MAX_PRESETS, MIN_PRESETS } from "./constants"
import { sortSearchParams } from "./utils"

type LocalFilters = {
  excludeInactive: boolean
  minCount: number | undefined
  maxCount: number | undefined
  region: string
  pref: string[]
}

export function FilterButton() {
  const [searchParams, _setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isMobile = useMediaQuery("(max-width: 640px)")

  const initialFilters: LocalFilters = {
    excludeInactive: searchParams.get("exclude_inactive") === "on",
    minCount: searchParams.get("min_count") ? Number(searchParams.get("min_count")) : undefined,
    maxCount: searchParams.get("max_count") ? Number(searchParams.get("max_count")) : undefined,
    region: searchParams.get("region") || "",
    pref: searchParams.get("pref")?.split(",") || [],
  }

  const isFiltered = () => {
    return (
      initialFilters.excludeInactive ||
      initialFilters.minCount !== undefined ||
      initialFilters.maxCount !== undefined ||
      initialFilters.region !== "" ||
      initialFilters.pref.length > 0
    )
  }

  const [minCount, setMinCount] = useState<number | undefined>(initialFilters.minCount)
  const [maxCount, setMaxCount] = useState<number | undefined>(initialFilters.maxCount)
  const [excludeInactive, setExcludeInactive] = useState(initialFilters.excludeInactive)

  const handleCountChange = (field: "min" | "max") => (value: number | undefined) => {
    if (field === "min") setMinCount(value)
    else setMaxCount(value)
  }

  const handlePresetClick = (field: "min" | "max", value: number) => {
    if (field === "min") setMinCount(value)
    else setMaxCount(value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("minCount", minCount)
    console.log("maxCount", maxCount)
    console.log("excludeInactive", excludeInactive)
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newParams = new URLSearchParams(searchParams)
    console.log("newParams", newParams)
    if (excludeInactive) {
      newParams.set("exclude_inactive", "on")
    } else {
      newParams.delete("exclude_inactive")
    }

    if (minCount && !Number.isNaN(minCount)) {
      newParams.set("min_count", minCount.toString())
    } else {
      newParams.delete("min_count")
    }

    if (maxCount && !Number.isNaN(maxCount)) {
      newParams.set("max_count", maxCount.toString())
    } else {
      newParams.delete("max_count")
    }

    // ページを1にリセット
    const currentPage = searchParams.get("page")
    if (currentPage && currentPage !== "1") {
      newParams.set("page", "1")
      toast.info("ページがリセットされました", {
        description: "フィルターが変更されたため、1ページ目に戻ります。",
      })
    }
    console.log("newParams", newParams)

    // パラメーターを並べ替え
    const sortedParams = sortSearchParams(newParams)
    console.log("sortedParams", sortedParams.toString())
    _setSearchParams(newParams)
    setIsOpen(false)
  }

  return (
    <DialogRoot isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant={isFiltered() ? "outline" : "dashed"}
        shape="square"
        className="min-w-9 text-foreground-muted"
        onPress={() => setIsOpen(true)}
      >
        <Filter />
      </Button>
      <Dialog mobileType="drawer">
        <DialogHeader className="-mt-1 text-center sm:text-left">
          <div className="font-bold text-sm ">企業検索フィルター</div>
        </DialogHeader>
        {!isMobile && (
          <>
            <div className="-mx-5 pb-4">
              <Separator className="border-overlay" />
            </div>

            <div className="text-foreground-light text-xs">
              従業員数とエリアで企業を絞り込むことができます。
              <br />
              条件を設定して、探している企業を効率的に見つけ出せます。
            </div>
          </>
        )}
        <fetcher.Form method="get" action="/search" onSubmit={handleSubmit}>
          <div className=" space-y-2 py-4 sm:mx-0 sm:space-y-4">
            <div className="flex items-center justify-between">
              <Switch
                id="exclude_inactive"
                name="exclude_inactive"
                aria-label="全喪企業を除外"
                isSelected={excludeInactive}
                onChange={setExcludeInactive}
                className="text-foreground-light text-sm"
              >
                全喪企業を除外
              </Switch>
            </div>

            <div>
              <label htmlFor="count" className="text-foreground-light text-sm">
                従業員規模
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <NumberField
                  id="min_count"
                  name="min_count"
                  aria-label="最小"
                  placeholder="最小"
                  minValue={0}
                  value={minCount ?? 0}
                  onChange={handleCountChange("min")}
                  className="w-1/2"
                />
                <span className="text-foreground-light text-xs">〜</span>
                <NumberField
                  id="max_count"
                  name="max_count"
                  aria-label="最大"
                  placeholder="最大"
                  minValue={0}
                  value={maxCount ?? 0}
                  onChange={handleCountChange("max")}
                  className="w-1/2"
                />
                <span className="text-foreground-light text-xs">人</span>
              </div>

              <div className="mt-2 flex space-x-2">
                <div className="w-1/2">
                  {MIN_PRESETS.map((preset) => (
                    <Button
                      key={`min-${preset}`}
                      type="button"
                      size="xs"
                      variant="default"
                      onPress={() => handlePresetClick("min", preset)}
                      className="mr-1 mb-1 w-10 text-xs"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <div className="w-1/2">
                  {MAX_PRESETS.map((preset) => (
                    <Button
                      key={`max-${preset}`}
                      type="button"
                      size="xs"
                      variant="default"
                      onPress={() => handlePresetClick("max", preset)}
                      className="mr-1 mb-1 w-10 text-xs"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="region" className="font-medium text-foreground-light text-sm">
                本社エリア (TODO)
              </label>
              <Select
                id="region"
                name="region"
                aria-label="本社エリア"
                defaultSelectedKey={initialFilters.region}
                className="mt-1"
                isDisabled
              >
                <Item id="kanto">関東</Item>
                <Item id="kansai">関西</Item>
                {/* 他のエリアオプション */}
              </Select>
            </div>
          </div>
          {!isMobile && (
            <div className="-mx-5">
              <Separator className="border-overlay" />
            </div>
          )}
          <DialogFooter className="pb-5 sm:pb-0">
            <Button type="button" variant="default" onPress={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <Button variant="primary" type="submit">
              フィルターを適用
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </Dialog>
    </DialogRoot>
  )
}
