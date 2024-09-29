import { Form, useFetcher, useNavigation } from "@remix-run/react"
import type * as React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Dialog, DialogHeader, DialogRoot } from "~/components/ui/dialog"
import { ErrorType } from "~/types/errors"
import { TextField } from "./ui/text-field"

interface RequestModalProps {
  triggerButton: React.ReactNode
}

interface ScrapedData {
  name: string
  address: string
  is_expanded_coverage: boolean
  is_active: boolean
  pension_office: string
  coverage_start_date: string
}

interface FetcherData {
  success: boolean
  data?: ScrapedData
  errors?: {
    _form?: string
    corporate_number?: string
    url?: string
  }
}

export const RequestModal: React.FC<RequestModalProps> = ({ triggerButton }) => {
  const [step, setStep] = useState<"input" | "confirm">("input")
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const navigation = useNavigation()
  const fetcher = useFetcher<FetcherData>()

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (fetcher.data.success) {
        if (fetcher.data.data) {
          setScrapedData(fetcher.data.data)
          setStep("confirm")
        } else {
          toast.success("企業情報が正常に送信されました。")
          setStep("input")
          setScrapedData(null)
        }
      } else if (fetcher.data.errors) {
        if (fetcher.data.errors._form) {
          toast.error(fetcher.data.errors._form)
        }
        // バリデーションエラーはフォームに表示されるので何もしない
      }
    }
  }, [fetcher.data, fetcher.state])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    if (step === "input") {
      formData.append("intent", "scrape")
    } else if (step === "confirm") {
      formData.append("intent", "submit")
    }

    fetcher.submit(formData, { method: "post", action: "/search" })
  }

  const renderContent = () => {
    switch (step) {
      case "input":
        return (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              name="corporate_number"
              label="法人番号 *"
              placeholder="1234567890123"
              description="日本年金機構に登録されている法人番号を入力してください。"
              isRequired
              inputMode="numeric"
              maxLength={13}
              minLength={13}
              className="w-full"
              isInvalid={!!fetcher.data?.errors?.corporate_number}
              errorMessage={fetcher.data?.errors?.corporate_number}
            />
            <TextField
              name="url"
              label="URL *"
              placeholder="https://example.com"
              description="企業の公式サイトのURLを入力してください。"
              isRequired
              type="url"
              className="w-full"
            />
            <Button type="submit" className="" isLoading={fetcher.state !== "idle"}>
              確認
            </Button>
          </Form>
        )
      case "confirm":
        return (
          <Form onSubmit={handleSubmit}>
            <h3>企業情報の確認</h3>
            <p className="mb-4 text-foreground-light text-sm">
              以下の内容で企業情報を登録してよろしいでしょうか？
            </p>
            {scrapedData && (
              <div className="mb-4 rounded-md bg-background-subtle p-4">
                <p>
                  <strong>企業名:</strong> {scrapedData.name}
                </p>
                <p>
                  <strong>住所:</strong> {scrapedData.address}
                </p>
                <p>
                  <strong>適用拡大:</strong> {scrapedData.is_expanded_coverage ? "はい" : "いいえ"}
                </p>
                <p>
                  <strong>現存:</strong> {scrapedData.is_active ? "はい" : "いいえ"}
                </p>
                <p>
                  <strong>年金事務所:</strong> {scrapedData.pension_office}
                </p>
                <p>
                  <strong>適用開始日:</strong> {scrapedData.coverage_start_date}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onPress={() => setStep("input")}>
                修正
              </Button>
              <Button type="submit" isLoading={fetcher.state !== "idle"}>
                登録
              </Button>
            </div>
          </Form>
        )
    }
  }

  return (
    <DialogRoot>
      {triggerButton}
      <Dialog>
        <DialogHeader>
          <div className="flex flex-col gap-2 pb-2">
            <h2 className="text-md">お探しの企業が見つかりませんか？</h2>
            <p className="text-foreground-light text-xs">
              こちらから企業情報の追加をリクエストできます。
              法人番号を入力いただくことで、最新の企業情報を取得し、データベースに追加いたします。
            </p>
          </div>
        </DialogHeader>
        {renderContent()}
      </Dialog>
    </DialogRoot>
  )
}
