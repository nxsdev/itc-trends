import { Form, Link } from "@remix-run/react"
import type * as React from "react"
import { RiGithubLine, RiGoogleLine, RiTwitterXLine } from "react-icons/ri"
import { Theme, useTheme } from "remix-themes"
import { Button } from "~/components/ui/button"
import { Dialog, DialogHeader, DialogRoot } from "~/components/ui/dialog"
import { AUTH_PROVIDERS } from "~/types/auth"
import { BrandLogo } from "./brand-logo"

interface SignInModalProps {
  triggerButton: React.ReactNode
  description: string
}

export const SignInModal: React.FC<SignInModalProps> = ({ triggerButton, description }) => {
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
          <Form method="post" action={`/auth/${AUTH_PROVIDERS.GITHUB}`}>
            <Button type="submit" prefix={<RiGithubLine />} className="h-10 w-full">
              GitHubでサインイン・新規登録
            </Button>
          </Form>
          <Form method="post" action={`/auth/${AUTH_PROVIDERS.GOOGLE}`}>
            <Button type="submit" prefix={<RiGoogleLine />} className="h-10 w-full">
              Googleでサインイン・新規登録
            </Button>
          </Form>
          <Form method="post" action={`/auth/${AUTH_PROVIDERS.TWITTER}`}>
            <Button type="submit" prefix={<RiTwitterXLine />} className="h-10 w-full">
              X(Twitter)でサインイン・新規登録
            </Button>
          </Form>
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
