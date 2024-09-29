import { useNavigate, useNavigation, useSearchParams } from "@remix-run/react"
import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "~/components/ui/pagination"
import { useEarlyScroll } from "~/hooks/use-early-scroll"
import { sortSearchParams } from "./utils"
interface SearchPaginationProps {
  limit: number
  totalCount: number
}

export function SearchPagination({ limit = 12, totalCount }: SearchPaginationProps) {
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(() =>
    Number.parseInt(searchParams.get("page") || "1", 10)
  )
  const totalPages = Math.ceil(totalCount / limit)
  const { scrollToTop } = useEarlyScroll()

  useEffect(() => {
    const urlPage = Number.parseInt(searchParams.get("page") || "1", 10)
    setCurrentPage(urlPage)
  }, [searchParams])

  const createPageUrl = useCallback(
    (page: number) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set("page", page.toString())
      return `/search?${sortSearchParams(newSearchParams).toString()}`
    },
    [searchParams]
  )

  const getJumpPage = (direction: "forward" | "backward") => {
    const jumpSize = 5
    return direction === "forward"
      ? Math.min(currentPage + jumpSize, totalPages)
      : Math.max(currentPage - jumpSize, 1)
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const showEllipsisStart = currentPage > 4
    const showEllipsisEnd = currentPage < totalPages - 3

    pageNumbers.push(
      <PaginationItem key={1}>
        <PaginationLink
          to={createPageUrl(1)}
          onClick={() => handlePageClick()}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )

    let rangeStart: number
    let rangeEnd: number

    if (currentPage <= 4) {
      rangeStart = 2
      rangeEnd = Math.min(5, totalPages - 1)
    } else if (currentPage >= totalPages - 3) {
      rangeStart = Math.max(totalPages - 4, 2)
      rangeEnd = totalPages - 1
    } else {
      rangeStart = currentPage - 1
      rangeEnd = currentPage + 1
    }

    if (showEllipsisStart) {
      pageNumbers.push(
        <PaginationItem key="startEllipsis">
          <PaginationEllipsis
            direction="left"
            to={createPageUrl(getJumpPage("backward"))}
            onClick={() => handlePageClick()}
          />
        </PaginationItem>
      )
    } else if (rangeStart > 2) {
      pageNumbers.push(
        <PaginationItem key={2}>
          <PaginationLink
            to={createPageUrl(2)}
            onClick={() => handlePageClick()}
            isActive={currentPage === 2}
          >
            2
          </PaginationLink>
        </PaginationItem>
      )
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink
              to={createPageUrl(i)}
              onClick={() => handlePageClick()}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    if (showEllipsisEnd) {
      pageNumbers.push(
        <PaginationItem key="endEllipsis">
          <PaginationEllipsis
            direction="right"
            to={createPageUrl(getJumpPage("forward"))}
            onClick={() => handlePageClick()}
          />
        </PaginationItem>
      )
    }

    if (totalPages > 1) {
      pageNumbers.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            to={createPageUrl(totalPages)}
            onClick={() => handlePageClick()}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return pageNumbers
  }

  const handlePageClick = () => {
    scrollToTop()
  }

  return (
    <PaginationContent className="flex justify-center pt-6">
      {renderPageNumbers()}
    </PaginationContent>
  )
}
