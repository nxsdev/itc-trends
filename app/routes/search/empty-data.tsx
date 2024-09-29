import { FileQuestion, Lightbulb } from "lucide-react"

export function EmptyData() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4">
        <FileQuestion className="size-14 text-foreground-light" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground-light text-lg">
        該当する企業情報が見つかりません
      </h3>
      <p className="mb-4 text-foreground-lighter text-sm">検索条件を変更して、再度お試しください</p>
      <div className="flex max-w-80 items-start gap-2 rounded-md bg-surface-200 p-3 text-foreground-lighter text-xs">
        <Lightbulb className="size-4 shrink-0" />
        <p className="text-left">
          <span className="mr-1 font-semibold">Tip:</span>
          企業名の一部で検索すると、結果が得られる可能性があります。
          また、法人番号を使用すると、特定の企業を正確に検索できます。
        </p>
      </div>
    </div>
  )
}
