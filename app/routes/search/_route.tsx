"use client"

import { CaretSortIcon } from "@radix-ui/react-icons"
import { type ActionFunctionArgs, type LoaderFunctionArgs, defer } from "@remix-run/cloudflare"
import {
  Await,
  type ShouldRevalidateFunction,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { ArrowDownWideNarrow, SearchIcon } from "lucide-react"
import { Suspense } from "react"
import type { Key } from "react-aria"
import { Button } from "~/components/ui/button"
import { Form } from "~/components/ui/form"
import { Item, ListBox } from "~/components/ui/list-box"
import { Overlay } from "~/components/ui/overlay"
import { SearchField } from "~/components/ui/search-field"
import { SelectRoot, SelectValue } from "~/components/ui/select"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"
import { useMediaQuery } from "~/hooks/use-media-query"
import { handleError } from "~/lib/utils/error-handler"
import { BadRequestError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { CompanyList, ErrorBoundary, LoadingSkeleton } from "./components/company-list"
import { FilterButton } from "./components/filter-button"
import { ACTIONS } from "./constants"
import { parseURLParams } from "./schema"
import { handleFavorite, handleScrape } from "./servers/actions.server"
import { getCompanies } from "./servers/queries.server"
import { SortOption, type SortOptionValue } from "./types"

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const params = parseURLParams(request)
  const authenticator = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const companiesPromise = getCompanies(context, params, user)

  return {
    key: Math.random(),
    companies: companiesPromise,
    sortOrder: params.sort,
    limit: params.limit,
  }
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  try {
    switch (intent) {
      case ACTIONS.FAVORITE:
        return await handleFavorite(request, context)
      case ACTIONS.SCRAPE:
        return await handleScrape(request, context)
      default:
        throw new BadRequestError("Invalid intent")
    }
  } catch (error) {
    return handleError(error)
  }
}

/** お気に入り更新の時は再レンダリングしない */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formData,
  defaultShouldRevalidate,
}) => {
  if (formData?.get("intent") === "favorite") {
    console.log("formData", formData)
    return false
  }
  return defaultShouldRevalidate
}

const sortOptions = [
  { id: SortOption.Favorite, label: "お気に入り登録数順" },
  { id: SortOption.InsuredCount, label: "被保険者数順" },
  { id: SortOption.IncreaseRate, label: "全期間増加率順" },
  { id: SortOption.IncreaseCount, label: "全期間増加数順" },
] as const

export default function Search() {
  const { companies, sortOrder, limit, key } = useLoaderData<typeof loader>()

  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useMediaQuery("(max-width: 640px)")

  const handleSortChange = (selectedKey: Key) => {
    const parsedSelectedKey = selectedKey as SortOptionValue
    setSearchParams(
      (prev) => {
        prev.set("sort", parsedSelectedKey)
        prev.set("page", "1")
        return prev
      },
      { replace: true }
    )
  }

  return (
    <main className="container relative max-w-screen-2xl py-6">
      {/* <Card>
        <CardContent className="py-6"> */}
      <Form className="">
        <div className="flex items-center space-x-2">
          <SearchField
            name="q"
            className="w-full"
            defaultValue={searchParams.get("q") || ""}
            placeholder="企業名または法人番号"
            aria-label="企業検索"
            maxLength={50}
          />
          <FilterButton />
          <Button
            type="submit"
            variant="primary"
            className=" font-bold text-xs"
            prefix={<SearchIcon className="text-foreground" />}
            aria-label="検索"
          >
            検索
          </Button>
        </div>
      </Form>
      <div className="flex items-center justify-between pt-4">
        <Tabs className="" defaultSelectedKey="all">
          <TabList aria-label="期間選択">
            <Tab
              id="6month"
              className="h-[26px] w-[80px] text-xs line-through"
              aria-label="6か月"
              isDisabled
            >
              6 か月
            </Tab>
            <Tab
              id="1year"
              className="mx-1 h-[26px] w-[80px] text-xs line-through"
              aria-label="1年"
              isDisabled
            >
              1 年
            </Tab>
            <Tab id="all" className="h-[26px] w-[80px] text-xs" aria-label="全期間">
              全期間
            </Tab>
          </TabList>
        </Tabs>
        <SelectRoot
          aria-label="ソート順"
          onSelectionChange={handleSortChange}
          defaultSelectedKey={SortOption.Favorite}
        >
          {isMobile ? (
            <Button variant="dashed" shape="square" aria-label="ソート">
              <ArrowDownWideNarrow className="text-foreground-light" />
            </Button>
          ) : (
            <Button
              variant="default"
              prefix={<ArrowDownWideNarrow className="text-foreground-lighter" />}
              suffix={<CaretSortIcon className="text-foreground-lighter" />}
              className="bg-foreground/[.026] dark:bg-background-muted"
            >
              <SelectValue className="bg-transparent text-foreground-light text-xs" />
            </Button>
          )}

          <Overlay type="popover">
            <ListBox>
              {sortOptions.map((option) => (
                <Item key={option.id} id={option.id} className="text-xs">
                  {option.label}
                </Item>
              ))}
            </ListBox>
          </Overlay>
        </SelectRoot>
      </div>

      <Suspense fallback={<LoadingSkeleton />} key={key}>
        <CompanyList companiesPromise={companies} />
      </Suspense>
      {/* <Outlet context={{ isModalOpen, onCloseModal: handleCloseModal }} /> */}
    </main>
  )
}
