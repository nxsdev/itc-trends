import { Link } from "@remix-run/react"
import { Facebook, Instagram, Linkedin, X, Youtube } from "lucide-react"
import React from "react"
import { Theme } from "remix-themes"
import { XIcon } from "~/components/icons/x-icon"
import { BrandLogo } from "../brand-logo"

const Footer = ({ theme }: { theme: Theme }) => {
  return (
    <footer className=" py-8">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
          <div className="flex flex-col items-start space-y-4">
            <div className="flex items-center gap-2">
              <BrandLogo width={128} theme={theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK} />
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-foreground-lighter transition-colors hover:text-foreground"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-foreground-lighter transition-colors hover:text-foreground"
              >
                <XIcon className="size-[20px] p-[1.4px]" />
              </a>
              <a
                href="#"
                className="text-foreground-lighter transition-colors hover:text-foreground"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-foreground-lighter transition-colors hover:text-foreground"
              >
                <Youtube size={20} />
              </a>
            </div>
            <p className="text-foreground-lighter text-xs">
              © {new Date().getFullYear()} ITC Trends, Inc.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex lg:space-x-12">
            <div>
              <h4 className="mb-4 font-semibold text-[15px]">Link</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-foreground-lighter text-sm hover:text-foreground">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    ITC Trendsについて
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/pricing"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    料金プラン
                  </Link>
                </li> */}
                <li>
                  <Link
                    to="/contact"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-[15px]">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/terms"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/cookies"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    Cookieポリシー
                  </Link>
                </li> */}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-[15px]">Other</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-foreground-lighter text-sm hover:text-foreground">
                    よくある質問
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/blog"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-foreground-lighter text-sm hover:text-foreground"
                  >
                    サポート
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
