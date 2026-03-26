import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Instagram, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react'

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-purple-100 italic-none">
      {/* Simple Header */}
      <header className="h-20 flex items-center justify-between px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl instagram-gradient flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight bg-clip-text instagram-gradient">
            Schedlify
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/signin" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">サインイン</Link>
          <Link href="/signup" className="px-6 py-2.5 instagram-gradient text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all">
            无料で始める
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-8 border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">プライベートベータ公開中</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          インスタグラム成長を <br />
          <span className="bg-clip-text instagram-gradient">自動化しよう</span>
        </h1>

        <p className="text-xl text-gray-500 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          モダンなコンテンツチームのためのプレミアム自動化プラットフォーム。投稿の予約、詳細なアナリティクスの確認、ワークフロー管理を簡単に。
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
          <Link href="/signup" className="group px-8 py-4 instagram-gradient text-white rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            無料で始める
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/signin" className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
            デモを見る
          </Link>
        </div>

        {/* Trust Badges / Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-left w-full animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">即時スケジューリング</h3>
            <p className="text-gray-500 text-sm leading-relaxed">オーディエンスが最もアクティブな時間に、単一投稿・カルーセル・リールを正確に公開できます。</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">詳細なアナリティクス</h3>
            <p className="text-gray-500 text-sm leading-relaxed">「いいね」だけではありません。リーチ・保存数・コンバージョン率を詳細レポートで追跡。</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">エンタープライズセキュリティ</h3>
            <p className="text-gray-500 text-sm leading-relaxed">公式Meta API連携により、アカウントの安全性と規約遵守を保証します。</p>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-gray-100 text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© 2026 Schedlify</p>
      </footer>
    </div>
  )
}
