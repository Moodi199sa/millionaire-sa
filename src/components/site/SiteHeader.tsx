'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Rocket, Sparkles } from 'lucide-react'

const NAV = [
  { href: '/', label: 'الرئيسية' },
  { href: '/calculator', label: 'الحاسبة التفاعلية' },
  { href: '/result', label: 'خارطة الثروة' },
  { href: '/blog', label: 'مدونة الثراء' },
  { href: '/checkout', label: 'التقرير الشامل' },
]

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="متى تصير مليونير؟ — الرئيسية">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: 'linear-gradient(135deg,#FFC542,#F59E0B)' }}>💰</span>
      <span className="leading-tight">
        <span className="block font-extrabold text-white text-[15px]">متى تصير <span className="text-amber-400">مليونير؟</span></span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />محاكي الثروة الذكي
        </span>
      </span>
    </Link>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => (href === '/' ? pathname === '/' || pathname === '/landing' : pathname?.startsWith(href))

  return (
    <header className="sticky top-0 z-40 bg-ink-900/85 backdrop-blur-md border-b border-white/[0.06] no-print">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 bg-ink-850 border border-white/[0.06] rounded-2xl p-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                isActive(n.href) ? 'bg-ink-700 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden xl:inline-flex chip bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
            <Sparkles size={13} /> مجاني بالكامل
          </span>
          <Link href="/calculator" className="btn-primary hidden sm:inline-flex px-5 py-2.5 text-sm">
            ابدأ الحساب مجاناً <Rocket size={16} />
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="القائمة" aria-expanded={open}
            className="lg:hidden w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-gray-200">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-ink-900 px-4 pb-4 pt-2">
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className={`py-3 px-3 rounded-xl text-base font-bold ${isActive(n.href) ? 'bg-ink-700 text-white' : 'text-gray-300'}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/calculator" onClick={() => setOpen(false)} className="btn-primary w-full mt-3 py-3.5">
            ابدأ الحساب مجاناً <Rocket size={18} />
          </Link>
        </div>
      )}
    </header>
  )
}
