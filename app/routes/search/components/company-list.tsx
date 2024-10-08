import { useAsyncError } from "@remix-run/react"
import { InsuredCountChart } from "./insured-count-chart"

import { use } from "react"
import type { CompanyChart } from "../types"
import { EmptyData } from "./empty-data"
import { SearchPagination } from "./search-pagination"
import { SkeletonCard } from "./skeleton-card"

type CompanyListProps = {
  companiesPromise: Promise<CompanyChart[]>
}

export function CompanyList({ companiesPromise }: CompanyListProps) {
  const companies = use(companiesPromise)
  // データの存在を確認
  if (!companies || !Array.isArray(companies)) {
    return <ErrorBoundary />
  }

  if (companies.length === 0) {
    return <EmptyData />
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <InsuredCountChart key={company.id} company={company} />
        ))}
      </div>
      <SearchPagination limit={12} totalCount={companies[0]?.totalCount ?? 0} />
    </>
  )
}

export function LoadingSkeleton() {
  const skeletonKeys = Array.from({ length: 12 }, () => crypto.randomUUID())

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skeletonKeys.map((key) => (
        <SkeletonCard key={key} />
      ))}
    </div>
  )
}

export function ErrorBoundary() {
  const error = useAsyncError()
  console.error("Error loading companies:", error)
  return <p>Error loading companies. Please try again later.</p>
}
