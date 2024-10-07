import { Link, useFetcher } from "@remix-run/react"
import { History, Home, LogOut, MenuIcon, Search } from "lucide-react"
import { Theme, useTheme } from "remix-themes"
import { SignInModal } from "~/components/sign-in-modal"
import { Button, buttonStyles } from "~/components/ui/button"
import { Menu, MenuItem, MenuRoot } from "~/components/ui/menu"
import { useMediaQuery } from "~/hooks/use-media-query"
import { useUser, useUserFull } from "~/hooks/use-user"
import type { AuthProvider } from "~/lib/supabase/auth.supabase.server"
import { cn } from "~/lib/utils"
import { BrandLogo } from "../brand-logo"
import { SuccessIcon } from "../icons/success-icon"
import { RequestModal } from "../request-modal"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Section, SectionRoot, SectionTitle } from "../ui/section"
import { Separator } from "../ui/separator"

export function Header() {
  const user = useUser()
  const [theme, setTheme, { definedBy }] = useTheme()
  const fetcher = useFetcher()

  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleThemeChange = (newTheme: Theme | null) => {
    setTheme(newTheme)
  }

  const isSystemTheme = definedBy === "SYSTEM"

  const handleSignIn = (provider: AuthProvider) => {
    fetcher.submit({ intent: "sign-in", provider }, { method: "post", action: "/search" })
  }

  const handleSignOut = async () => {
    fetcher.submit({ intent: "sign-out" }, { method: "post", action: "/search" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-border-strong/40 border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background-200/100 dark:supports-[backdrop-filter]:bg-background-200/60">
      <div className="container flex h-12 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="block">
              <BrandLogo
                width={115}
                theme={!isSystemTheme && theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK}
              />
            </span>
          </Link>
        </div>
        <nav className="ml-4 hidden items-center gap-4 text-sm md:flex lg:gap-6">
          <Link to="/search">検索</Link>
          <Link to="/about">ITC Trendsについて</Link>
          <RequestModal
            triggerButton={
              <Button variant="ghost" className="h-10 bg-transparent text-md hover:bg-transparent">
                リクエスト
              </Button>
            }
          />
          {/* <Link to="/pricing">料金</Link> */}
          <Link to="/contact">お問い合わせ</Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 sm:justify-end">
          {!user && (
            <SignInModal
              triggerButton={
                <Button variant="primary" className="h-8 text-xs">
                  サインイン
                </Button>
              }
              description="ITC Trendsへようこそ！アカウントを作成またはサインインして、リクエスト、お気に入り登録など、より多くの機能にアクセスできます。"
              onSignIn={handleSignIn}
            />
          )}
          <MenuRoot>
            <Button
              variant="default"
              size="sm"
              shape="square"
              className="h-8 data-[pressed]:border-border-stronger"
            >
              <MenuIcon className="text-foreground-light" />
            </Button>
            <Menu
              placement="bottom"
              className="sm:-right-4 sm:absolute sm:min-w-56 sm:max-w-80 sm:border"
            >
              {user && (
                <>
                  <MenuItem className=" cursor-default bg-transparent hover:bg-transparent focus:bg-transparent">
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarImage
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata.full_name}
                          loading="eager"
                        />
                        <AvatarFallback>
                          {user.user_metadata.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 pl-2">
                        <p className="font-medium text-sm leading-none">
                          {user.user_metadata.full_name}
                        </p>
                        <p className="text-foreground-light text-xs leading-none">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="default" size="sm" className="h-[22px]">
                        <span className="font-medium text-xs">フリープラン</span>
                      </Badge>
                      <Link
                        to="/billing"
                        className={cn(
                          buttonStyles({ variant: "primary" }),
                          "h-[22px] font-medium text-xs"
                        )}
                      >
                        <span className="font-medium text-xs">アップグレード</span>
                      </Link>
                    </div>
                  </MenuItem>

                  <Separator />
                </>
              )}
              {isMobile && (
                <>
                  <MenuItem href="/">
                    <div className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>ホーム</span>
                    </div>
                  </MenuItem>
                  <MenuItem href="/search">
                    <div className="flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      <span>検索</span>
                    </div>
                  </MenuItem>
                  <MenuItem href="/about">
                    <div className="flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      <span>更新履歴</span>
                    </div>
                  </MenuItem>
                  <Separator />
                </>
              )}
              {/* <Separator /> */}
              <SectionRoot>
                {!isMobile && (
                  <SectionTitle className="text-foreground-light text-xs">テーマ</SectionTitle>
                )}
                <MenuItem onAction={() => handleThemeChange(null)}>
                  <div className="flex items-center">
                    <span className="w-3">{isSystemTheme && <SuccessIcon />}</span>
                    <span className="ml-2">システム</span>
                  </div>
                </MenuItem>
                <MenuItem onAction={() => handleThemeChange(Theme.LIGHT)}>
                  <div className="flex items-center">
                    <span className="w-3">
                      {!isSystemTheme && theme === Theme.LIGHT && <SuccessIcon />}
                    </span>
                    <span className="ml-2">ライト</span>
                  </div>
                </MenuItem>
                <MenuItem onAction={() => handleThemeChange(Theme.DARK)}>
                  <div className="flex items-center">
                    <span className="w-3">
                      {!isSystemTheme && theme === Theme.DARK && <SuccessIcon />}
                    </span>
                    <span className="ml-2">ダーク</span>
                  </div>
                </MenuItem>
              </SectionRoot>
              {user && (
                <>
                  <Separator />
                  <Section>
                    <MenuItem onAction={handleSignOut}>
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>サインアウト</span>
                      </div>
                    </MenuItem>
                  </Section>
                </>
              )}
            </Menu>
          </MenuRoot>
        </div>
      </div>
    </header>
  )
}
