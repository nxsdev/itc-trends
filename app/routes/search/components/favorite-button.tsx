import { useFetcher, useNavigate } from "@remix-run/react"
import { Star } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { SignInModal } from "~/components/sign-in-modal"
import { Button } from "~/components/ui/button"
import { useUser } from "~/hooks/use-user"
import { FavoriteAction, type FavoriteResult } from "../types"

type FavoriteButtonProps = {
  companyId: string
  initialFavoriteCount: number
  isFavorite: boolean
}

export function FavoriteButton({
  companyId,
  initialFavoriteCount,
  isFavorite: initialIsFavorite,
}: FavoriteButtonProps) {
  const user = useUser()
  const fetcher = useFetcher<FavoriteResult>()
  const navigate = useNavigate()

  // 楽観的UIの実装
  const optimisticFavoriteCount = fetcher.formData
    ? fetcher.formData.get("intent") === "favorite"
      ? initialIsFavorite
        ? initialFavoriteCount
        : initialFavoriteCount + 1
      : initialIsFavorite
        ? initialFavoriteCount - 1
        : initialFavoriteCount
    : initialFavoriteCount

  const optimisticIsFavorite = fetcher.formData
    ? fetcher.formData.get("intent") === "favorite"
      ? !initialIsFavorite
      : initialIsFavorite
    : initialIsFavorite

  // サーバーからの応答を反映
  const favoriteCount = fetcher.data?.favoriteCount ?? optimisticFavoriteCount
  const isFavorite = fetcher.data
    ? fetcher.data.action === FavoriteAction.Added
    : optimisticIsFavorite

  React.useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (
        fetcher.data.action === FavoriteAction.Added ||
        fetcher.data.action === FavoriteAction.Removed
      ) {
        toast.success(`${fetcher.data.message}`)
      } else {
        toast.error(fetcher.data.message, {
          action: {
            label: "アップグレード",
            onClick: () => navigate("/pricing"),
          },
        })
      }
    }
  }, [fetcher.data, fetcher.state])

  const handleFavorite = () => {
    if (user) {
      fetcher.submit({ intent: "favorite", companyId, favoriteCount }, { method: "post" })
    }
  }

  const starClassName = `transition-all duration-100 ease-out ${
    isFavorite ? "text-brand fill-brand" : "text-foreground-muted"
  }`
  if (!user) {
    return (
      <SignInModal
        triggerButton={
          <Button variant="default" size="2xs" className="h-6">
            <Star className={starClassName} />
            <span className="text-xs">{favoriteCount}</span>
          </Button>
        }
        description="お気に入りに追加して、最新の分析結果をいつでもチェック。アカウントにサインインして、あなただけのウォッチリストを作成しましょう。"
      />
    )
  }

  return (
    <Button
      variant="default"
      type="button"
      size="2xs"
      className="h-6"
      onPress={handleFavorite}
      isDisabled={fetcher.state === "submitting"}
    >
      <Star className={starClassName} />
      <span className="text-xs">{favoriteCount}</span>
    </Button>
  )
}
