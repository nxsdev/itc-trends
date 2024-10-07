import { Link } from "@remix-run/react"
import type * as React from "react"
import { RiGithubLine, RiGoogleLine, RiTwitterXLine } from "react-icons/ri"
import { Theme, useTheme } from "remix-themes"
import { Button } from "~/components/ui/button"
import { Dialog, DialogHeader, DialogRoot } from "~/components/ui/dialog"
import type { AuthProvider } from "~/lib/supabase/auth.supabase.server"
import { BrandLogo } from "./brand-logo"

interface SignInModalProps {
  triggerButton: React.ReactNode
  description: string
  onSignIn: (provider: AuthProvider) => void
}

export const SignInModal: React.FC<SignInModalProps> = ({
  triggerButton,
  description,
  onSignIn,
}) => {
  const [theme] = useTheme()
  return (
    <DialogRoot>
      {triggerButton}
      <Dialog>
        <DialogHeader>
          <div className="flex items-center justify-center gap-2">
            <BrandLogo width={170} theme={theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK} />
          </div>
          <div className="flex flex-col gap-2 pt-6 pb-2">
            <span className="text-foreground-light text-xs">{description}</span>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button prefix={<RiGithubLine />} className="h-10" onPress={() => onSignIn("github")}>
            GitHubでサインイン・新規登録
          </Button>
          <Button prefix={<RiGoogleLine />} className="h-10" onPress={() => onSignIn("google")}>
            Googleでサインイン・新規登録
          </Button>
          <Button prefix={<RiTwitterXLine />} className="h-10" onPress={() => onSignIn("twitter")}>
            X(Twitter)でサインイン・新規登録
          </Button>
        </div>
        <p className="py-4 text-center text-foreground-light text-xs">
          続行すると、
          <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">
            利用規約
          </Link>
          と
          <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
            プライバシーポリシー
          </Link>
          に同意したものとします。
        </p>
      </Dialog>
    </DialogRoot>
  )
}
