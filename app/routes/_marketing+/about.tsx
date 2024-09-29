import { Briefcase, CheckCircle, Heart, PieChart, Search, Shield, TrendingUp } from "lucide-react"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto space-y-20 px-4 py-12">
      <section className="space-y-6 text-center">
        {/* <h1 className="mb-4 font-bold text-2xl text-foreground-default">ITC Trendsについて</h1> */}

        <div className=" flex flex-col items-center space-y-6 md:flex-row md:space-x-6 md:space-y-0">
          <div className="flex-1">
            <p className=" font-bold text-5xl ">信頼できるデータでIT企業の"今"を見える化</p>
            <p className="mt-4 flex-1 text-foreground-lighter text-md">
              ITC
              Trendsは、日本年金機構のデータを活用し、主にIT企業の社員数の増減をグラフで可視化するWebアプリケーションです。気になる企業を検索し、お気に入りに追加することで、最新の情報をいつでも手軽に確認できます。
            </p>
          </div>
          <div className="flex-1">
            <img
              src="/office-workers-analyzing.webp"
              alt="オフィスで分析する従業員"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="mb-8 text-center font-semibold text-2xl text-foreground-default">特長</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground-default text-xl">
                <TrendingUp className="mr-2 text-brand-500" />
                社員数の推移を一目で確認
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
                各企業の被保険者数（社員数）を過去から現在までグラフで表示。企業の成長や変化を直感的に把握できます。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground-default text-xl">
                <Shield className="mr-2 text-brand-500" />
                信頼性の高いデータソース
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
                日本年金機構の公的なデータを使用。信頼のおける情報で、正確な社員数を確認できます。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground-default text-xl">
                <Heart className="mr-2 text-brand-500" />
                お気に入り機能で最新情報をキャッチ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
                興味のある企業をお気に入りに追加すれば、最新の社員数や推移をすぐにチェック可能。転職活動や市場調査に役立ちます。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="mb-8 text-center font-semibold text-2xl text-foreground-default">
          ITC Trendsを作った背景
        </h2>
        <div className="grid gap-12 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="mb-4 font-semibold text-foreground-light text-lg">
                現状の課題
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 text-destructive" />
                  <div>
                    <span className="mb-1 block font-semibold text-foreground-light">
                      過去データの閲覧制限
                    </span>
                    <span className="text-foreground-lighter text-sm">
                      日本年金機構ではその月の情報しか提供されず、過去のデータを参照できません。
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 text-destructive" />
                  <div>
                    <span className="mb-1 block font-semibold text-foreground-light">
                      情報の信頼性
                    </span>
                    <span className="text-foreground-lighter text-sm">
                      多くの企業情報サイトがありますが、データの出典や信頼性が明確でない場合があります。
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 text-destructive" />
                  <div>
                    <span className="mb-1 block font-semibold text-foreground-light">
                      事実に基づく判断の難しさ
                    </span>
                    <span className="text-foreground-lighter text-sm">
                      企業が公表する情報と実態が異なる場合、正確な判断が困難です。
                    </span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="mb-4 font-semibold text-foreground-light text-lg">
                私たちの想い
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 text-brand-500" />
                  <div>
                    <span className="mb-1 block font-semibold text-foreground-light">
                      事実に基づく情報提供
                    </span>
                    <span className="text-foreground-lighter text-sm">
                      信頼性の高いデータで、ユーザーが事実に基づいた判断を行えるようサポートします。
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 text-brand-500" />
                  <div>
                    <span className="mb-1 block font-semibold text-foreground-light">
                      透明性の向上
                    </span>
                    <span className="text-foreground-lighter text-sm">
                      社員数の推移を可視化することで、企業の実態を明らかにします。
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 text-brand-500" />
                  <div>
                    <span className="mb-1 block font-semibold text-foreground-light">
                      意思決定の支援
                    </span>
                    <span className="text-foreground-lighter text-sm">
                      転職や投資など、重要な場面での情報源として活用してほしいと考えています。
                    </span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="mb-8 text-center font-semibold text-2xl text-foreground-default">
          活用シーン
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground-default text-xl">
                <Search className="mr-2 text-brand-500" />
                転職活動での企業選びに
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
                企業の成長性や安定性を社員数の推移から客観的に判断。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground-default text-xl">
                <PieChart className="mr-2 text-brand-500" />
                市場調査や競合分析に
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
                同業他社の動向を把握し、ビジネス戦略の策定に活用。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground-default text-xl">
                <Briefcase className="mr-2 text-brand-500" />
                投資判断の参考に
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-light">
                企業の実態をデータで確認し、投資先選定の材料に。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 text-center">
        <h2 className="mb-4 text-center font-semibold text-2xl text-foreground-default">
          さあ、始めましょう
        </h2>
        <p className="mx-auto max-w-3xl text-foreground-light">
          ITC
          Trendsは、事実に基づく正確な情報提供を通じて、ユーザーの皆様の意思決定を支援します。信頼できるデータで企業の"今"を把握し、未来への一歩を踏み出すお手伝いをいたします。ぜひITC
          Trendsをご活用ください。
        </p>
      </section>
    </div>
  )
}
