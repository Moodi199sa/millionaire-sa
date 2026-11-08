// الحقيبة التنفيذية — نسخة مطابقة لتصميم المرجع (الهيدر، الغلاف، الأقسام 1–6، الختام، الفوتر).
// النصوص كما في التصميم، والأرقام كلها محسوبة من أرقام المستخدم.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Printer, Download, ShieldCheck, CalendarDays, CircleCheck, Award, Hourglass, Rocket,
  PieChart, Target, Scissors, Sparkles, LineChart, Calculator, Zap, Table2, Wallet, Shield, Globe2, Building2,
  Landmark, Building, FileText, CheckCircle2, ChevronLeft, Lock, BookOpen, ExternalLink, Sheet, FolderOpen, Flag,
  Network, ShieldPlus, MessageSquare, Share2, Gavel, CirclePlay, LayoutGrid, Check, SearchCheck, Gem,
} from 'lucide-react'
import { formatNumber } from '@/lib/calculator'
import { NEVER, dur, yearsShort, BUCKETS, SIDE_INCOME, Scenario, YearRow, Leak, RecoveryItem } from '@/lib/reportModel'

const SAR = 'ر.س'
const mono = 'font-mono tabular-nums'

function Chip({ children, tone = 'gray', className = '' }: { children: React.ReactNode; tone?: 'amber' | 'green' | 'gray' | 'solid'; className?: string }) {
  const t = tone === 'amber' ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
    : tone === 'green' ? 'bg-emerald-400/[0.08] text-emerald-400 border-emerald-400/25'
    : tone === 'solid' ? 'bg-amber-400 text-ink-950 border-amber-400'
    : 'bg-white/[0.04] text-gray-300 border-white/10'
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${t} ${className}`}>{children}</span>
}

function Head({ icon: Icon, kicker, title, sub, side, tone = 'amber' }: {
  icon: React.ElementType; kicker: string; title: string; sub: string; side?: React.ReactNode; tone?: 'amber' | 'green'
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
      <div>
        <Chip tone={tone} className="mb-3"><Icon size={13} />{kicker}</Chip>
        <h2 className="text-2xl lg:text-[34px] font-extrabold leading-tight mb-1.5">{title}</h2>
        <p className="text-sm lg:text-base text-gray-400">{sub}</p>
      </div>
      {side && <div className="shrink-0 max-w-md">{side}</div>}
    </div>
  )
}

function Side({ icon: Icon, children, tone = 'green' }: { icon: React.ElementType; children: React.ReactNode; tone?: 'green' | 'amber' | 'gray' }) {
  const cls = tone === 'green' ? 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300'
    : tone === 'amber' ? 'border-amber-400/30 bg-amber-400/[0.06] text-amber-200' : 'border-white/10 bg-white/[0.03] text-gray-300'
  return <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs lg:text-sm font-bold ${cls}`}><Icon size={16} className="shrink-0" /><span>{children}</span></div>
}

// ─── الهيدر ─────────────────────────────────────────────────────────────
export const DOSSIER_NAV = [
  { id: 'budget', label: 'مصفوفة الميزانية' },
  { id: 'scenarios', label: 'المسار التراكمي' },
  { id: 'assets', label: 'توزيع الأصول السعودي' },
  { id: 'projects', label: 'مشاريع 2026' },
  { id: 'tools', label: 'صندوق الأدوات والمصادر' },
  { id: 'plan', label: 'خطة 90 يوماً' },
]

export function DossierHeader({ onPrint, onPdf, busy, progress }: { onPrint: () => void; onPdf: () => void; busy: boolean; progress: number }) {
  return (
    <header className="sticky top-0 z-40 bg-ink-950/90 backdrop-blur-md border-b border-white/[0.06] no-print">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 lg:gap-5 min-w-0">
          <Link href="/calculator" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-300 hover:text-white shrink-0"><ArrowRight size={18} /><span className="leading-tight">العودة<br className="hidden lg:block" /> للحاسبة</span></Link>
          <span className="hidden sm:block w-px h-9 bg-white/10" />
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-ink-950" style={{ background: 'linear-gradient(135deg,#FFC542,#F59E0B)' }}><BadgeCheck size={22} /></span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-extrabold text-[15px]"><span className="truncate">متى تصير <span className="text-amber-400">مليونير؟</span></span><span className="hidden md:inline rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-mono text-gray-300 tracking-wider">DOSSIER</span></p>
            <p className="hidden md:block text-[11px] text-gray-400 truncate">الملف الاستشاري التنفيذي لتسريع الثروة (نسخة العميل)</p>
          </div>
        </div>
        <nav className="hidden xl:flex items-center gap-5 text-[13px] font-bold text-gray-300">
          {DOSSIER_NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-white transition-colors">{n.label}</a>)}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onPrint} className="hidden sm:inline-flex btn-ghost px-3.5 py-2.5 text-xs"><Printer size={15} />طباعة الوثيقة</button>
          <button onClick={onPdf} disabled={busy} className="btn-primary px-4 py-2.5 text-xs"><Download size={15} />{busy ? `يتم التجهيز ${progress}٪` : <><span className="hidden sm:inline">تحميل الحقيبة التنفيذية</span> PDF</>}</button>
        </div>
      </div>
    </header>
  )
}

// ─── الغلاف ─────────────────────────────────────────────────────────────
export function DossierHero(p: {
  id: string; quarter: string; A: number; C: number; score: number; tier: { label: string; desc: string }
  S: number; E: number; M: number; expensePct: number; savingPct: number; cash: number; inv: number; inflationLossA: number
}) {
  const r = 70, c = 2 * Math.PI * r
  const ringColor = p.score >= 80 ? '#10B981' : p.score >= 60 ? '#F59E0B' : p.score >= 40 ? '#F97316' : '#EF4444'
  const headline = p.A >= NEVER && p.C < NEVER ? `من "لن تصل" إلى المليون الأول خلال ${yearsShort(p.C).replace(' سنة', ' سنوات')}`
    : p.C < p.A ? `تقليص زمن المليون الأول من ${yearsShort(p.A).replace(' سنة', ' سنة')} إلى ${yearsShort(p.C).replace(' سنة', ' سنوات')}`
    : p.A <= 0 ? 'لقد تجاوزت المليون الأول — حان وقت مضاعفته' : 'خارطة واضحة للوصول إلى المليون الأول'
  return (
    <section className="relative rounded-[28px] border border-amber-400/15 p-5 lg:p-10 overflow-hidden"
      style={{ background: 'radial-gradient(110% 80% at 0% 0%, rgba(245,158,11,0.10), transparent 55%), radial-gradient(80% 70% at 100% 100%, rgba(16,185,129,0.10), transparent 60%), #161C25' }}>
      <div className="flex flex-wrap items-center gap-2 pb-5 mb-7 border-b border-white/[0.06]">
        <Chip tone="amber"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />ملف استشاري تنفيذي</Chip>
        <Chip><ShieldCheck size={13} className="text-amber-400" />رقم الملف: <span className={mono}>{p.id}</span></Chip>
        <Chip><CalendarDays size={13} className="text-amber-400" />تاريخ التحديث: {p.quarter}</Chip>
        <Chip tone="green" className="lg:mr-auto"><CircleCheck size={13} />محسوب وفق نموذج العائد التراكمي المركب</Chip>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div>
          <p className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-3"><Award size={17} />خطة العمل المعتمدة للوصول إلى حاجز <span className={mono}>1,000,000</span> ريال سعودي</p>
          <h1 className="text-3xl lg:text-[52px] font-extrabold leading-[1.15] mb-2">تقرير تسريع الثروة التنفيذي المتكامل</h1>
          <p className="text-2xl lg:text-[38px] font-extrabold text-amber-grad leading-snug mb-5">{headline}</p>
          <p className="text-base lg:text-lg text-gray-200 leading-loose mb-7">
            تم بناء هذه الوثيقة خصيصاً كحقيبة عمل استشارية شاملة تعيد هيكلة تدفقاتك المالية الشهرية وتفعّل محركات الفائدة المركبة الثلاثة:{' '}
            <b className="text-amber-300">ضبط هدر السيولة</b>، <b className="text-emerald-400">توزيع الأصول الآلي</b>، و<b className="text-amber-300">إطلاق قناة دخل جانبي تدر +{formatNumber(SIDE_INCOME)} ر.س/شهر</b>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-ink-950/50 p-4 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-red-400/10 text-red-300 flex items-center justify-center shrink-0"><Hourglass size={22} /></span>
              <div>
                <p className="text-xs text-gray-400 mb-1">المسار التقليدي (ادخار راكد)</p>
                <p className="text-lg font-extrabold">{dur(p.A).replace('سنين', 'سنوات').replace('شهور', 'أشهر')} {p.inflationLossA > 0 && <span className="text-[11px] text-red-300 font-bold">(فقدان {formatNumber(Math.round(p.inflationLossA / 1000))}k للتضخم)</span>}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center shrink-0"><Rocket size={22} /></span>
              <div>
                <p className="text-xs text-emerald-300/80 mb-1">المسار المسرّع الموصى به</p>
                <p className="text-lg font-extrabold text-emerald-400">{dur(p.C).replace('سنين', 'سنوات').replace('شهور', 'أشهر')}{p.A < NEVER && p.C < p.A && <> فقط <span className="text-[11px] text-emerald-300/80 font-bold">(−{yearsShort(p.A - p.C).replace(' سنة', ' سنوات')})</span></>}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-ink-950/50 p-6 text-center">
          <p className="text-sm text-gray-300 font-bold mb-4">مؤشر الجاهزية المالية الحالية</p>
          <div className="relative w-fit mx-auto">
            <svg viewBox="0 0 180 180" className="w-44 h-44 lg:w-52 lg:h-52 -rotate-90">
              <circle cx="90" cy="90" r={r} fill="none" stroke="#2E3846" strokeWidth="14" />
              <circle cx="90" cy="90" r={r} fill="none" stroke={ringColor} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(p.score / 100) * c} ${c}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold tabular-nums" style={{ color: ringColor }}>{p.score}</span>
              <span className="text-xs text-gray-400">من 100</span>
            </div>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-extrabold border border-emerald-400/25 bg-emerald-400/10 text-emerald-400"><CircleCheck size={15} />تصنيف استثماري: {p.tier.label}</p>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">{p.tier.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-8 pt-7 border-t border-white/[0.06]">
        {[
          { l: 'الراتب الشهري الأساسي', v: p.S, cls: 'border-white/[0.08] bg-ink-950/40' },
          { l: 'المصروفات الشهرية الحالية', v: p.E, pct: p.expensePct, cls: 'border-white/[0.08] bg-ink-950/40' },
          { l: 'الادخار الصافي الحالي', v: Math.max(0, p.M), pct: p.savingPct, cls: 'border-emerald-400/25 bg-emerald-400/[0.07]', vc: 'text-emerald-400', lc: 'text-emerald-300' },
          { l: 'السيولة النقدية الحالية', v: p.cash, cls: 'border-white/[0.08] bg-ink-950/40' },
          { l: 'المحفظة المستثمرة البادئة', v: p.inv, cls: 'border-amber-400/30 bg-amber-400/[0.08]', vc: 'text-amber-300', lc: 'text-amber-300' },
        ].map((t, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${t.cls} ${i === 4 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <p className={`text-[11px] lg:text-xs mb-1.5 ${t.lc || 'text-gray-400'}`}>{t.l}</p>
            <p className={`text-lg lg:text-xl font-extrabold ${mono} ${t.vc || ''}`} dir="ltr"><span className="text-xs text-gray-500 font-bold">{SAR}</span> {formatNumber(t.v)} {t.pct !== undefined && <span className="text-xs text-gray-400">({t.pct}٪)</span>}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── القسم الأول ────────────────────────────────────────────────────────
export function DossierBudget({ S, E, M, expensePct, savingPct, recovery, items, target, leaks }: {
  S: number; E: number; M: number; expensePct: number; savingPct: number; recovery: number
  items: RecoveryItem[]; target: { needs: number; wants: number; save: number }; leaks: Leak[]
}) {
  const amt = (pct: number) => Math.round((S * pct) / 100 / 50) * 50
  const cutPct = E > 0 ? Math.round((recovery / E) * 100) : 0
  return (
    <section id="budget" data-pdf-break className="scroll-mt-24">
      <Head icon={PieChart} kicker="القسم الأول: الهندسة العكسية للميزانية"
        title="تشخيص التدفقات وقاعدة 50/30/20 المعدلة لمعيشة المملكة"
        sub={`مقارنة الوضع الحالي بالنموذج المثالي مع كشف 3 تسريبات خفية واسترداد ${formatNumber(recovery)} ريال فوراً`}
        side={<Side icon={Scissors}>الهدف: تحرير {formatNumber(Math.round(recovery * 0.8 / 50) * 50)} - {formatNumber(Math.round(recovery * 1.2 / 50) * 50)} ر.س شهرياً دون مساس بجودة المعيشة</Side>} />
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        <div className="card p-5 lg:p-7">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-lg lg:text-xl font-extrabold">مقارنة التدفق المالي: الحالي vs النموذج المعياري</h3>
            <span className="text-xs text-gray-400 shrink-0">الراتب الأساسي: <span className={mono}>{formatNumber(S)}</span> {SAR}</span>
          </div>
          <div className="flex justify-between text-xs mb-2"><span className="text-gray-300 font-bold">توزيع الراهن</span><span className="text-amber-300 font-bold">مصاريف {expensePct}٪ (<span className={mono}>{formatNumber(E)}</span> ر.س) | ادخار {Math.max(0, savingPct)}٪ (<span className={mono}>{formatNumber(Math.max(0, M))}</span>)</span></div>
          <div className="flex h-9 rounded-full overflow-hidden text-xs font-extrabold mb-6">
            <div className="bg-amber-500 text-ink-950 flex items-center justify-center" style={{ width: `${Math.max(expensePct, 12)}%` }}>نفقات تشغيلية ومظاهر {expensePct}٪</div>
            <div className="bg-emerald-500 text-ink-950 flex items-center justify-center" style={{ width: `${Math.max(100 - expensePct, 10)}%` }}>ادخار {Math.max(0, 100 - expensePct)}٪</div>
          </div>
          <div className="border-t border-white/[0.06] pt-5">
            <div className="flex justify-between text-xs mb-2"><span className="text-gray-300 font-bold">النموذج الذهبي الموصى به (قاعدة {target.needs} / {target.wants} / {target.save})</span><span className="text-emerald-400 font-bold">تحرير {formatNumber(recovery)} ر.س للاستثمار</span></div>
            <div className="flex h-9 rounded-full overflow-hidden text-[11px] lg:text-xs font-extrabold mb-3">
              <div className="bg-blue-500 text-white flex items-center justify-center" style={{ width: `${target.needs}%` }}>أساسيات {target.needs}٪ (<span className={mono}>{formatNumber(amt(target.needs))}</span>)</div>
              <div className="bg-amber-400 text-ink-950 flex items-center justify-center" style={{ width: `${Math.max(target.wants, 18)}%` }}>رغبات {target.wants}٪ (<span className={mono}>{formatNumber(amt(target.wants))}</span>)</div>
              <div className="bg-emerald-500 text-ink-950 flex items-center justify-center" style={{ width: `${target.save}%` }}>استثمار هجومي {target.save}٪ (<span className={mono}>{formatNumber(amt(target.save))}</span>)</div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">في السوق السعودي، غالبية الأفراد يخلطون بين "الرغبات الاستهلاكية" و"الاحتياجات الضرورية". خفض النفقات العشوائية بنسبة {cutPct}٪ يضخ {formatNumber(recovery)} ر.س إضافية فوراً دون أن تشعر بالحرمان.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-ink-950/50 p-4 lg:p-5">
            <p className="font-extrabold text-amber-300 mb-3 flex items-center gap-2"><Sparkles size={16} />معادلة استرداد الـ {formatNumber(recovery)} ر.س شهرياً خطوة بخطوة:</p>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {items.map((it, i) => (
                <div key={i} className="card-soft p-3.5">
                  <p className="text-xs text-gray-300 mb-1.5">{i + 1}. {it.title}</p>
                  <p className={`text-sm font-extrabold text-emerald-400 ${mono}`}>+{formatNumber(it.amount)} ر.س / شهرياً</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg lg:text-xl font-extrabold mb-1 flex items-center gap-2"><Scissors size={19} className="text-red-400" />تقرير تسريبات السيولة الخطيرة</h3>
          <p className="text-xs text-gray-400 mb-5">وفق فحص أرصدتك، هذه التسريبات الثلاث تستنزف ثروتك بهدوء دون أن تلاحظ:</p>
          <div className="space-y-3">
            {leaks.map((l, i) => {
              const col = l.tone === 'red' ? 'text-red-300' : l.tone === 'amber' ? 'text-amber-300' : 'text-emerald-300'
              const box = l.tone === 'red' ? 'border-red-400/20 bg-red-400/[0.04]' : l.tone === 'amber' ? 'border-amber-400/20 bg-amber-400/[0.04]' : 'border-white/[0.08] bg-ink-950/40'
              return (
                <div key={i} className={`rounded-2xl border p-4 ${box}`}>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className={`text-sm font-extrabold ${col}`}>{i + 1}. {l.title}</p>
                    <span className={`text-xs font-bold shrink-0 ${mono} ${col}`}>{l.cost}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{l.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── القسم الثاني ───────────────────────────────────────────────────────
export function DossierScenarios({ sc, table, best, split }: {
  sc: Scenario[]; table: YearRow[]; best: Scenario; split: { contributions: number; gains: number; gainsPct: number }
}) {
  const years = best.months < NEVER ? Math.ceil(best.months / 12) : 0
  return (
    <section id="scenarios" data-pdf-break className="scroll-mt-24">
      <Head icon={LineChart} tone="green" kicker="القسم الثاني: محاكاة التراكم المركب"
        title={`مصفوفة السيناريوهات التراكمية وجدول التدفق السنوي${years ? ` (${years} ${years <= 10 ? 'سنوات' : 'سنة'})` : ''}`}
        sub="مقارنة رياضية دقيقة مع جدول حركة رأس المال وتراكم الأرباح سنة بسنة حتى بلوغ المليون"
        side={<Side icon={Calculator} tone="gray">مبنية بنموذج الفائدة التراكمية المركبة شهرياً</Side>} />
      <div className="grid lg:grid-cols-3 gap-4 mb-5 pt-3">
        {sc.map((s) => {
          const gold = s.key === 'C'
          return (
            <div key={s.key} className={`relative rounded-3xl p-5 lg:p-6 flex flex-col ${gold ? 'border-2 border-amber-400/80' : s.key === 'B' ? 'border border-emerald-400/20 bg-ink-800' : 'card'}`}
              style={gold ? { background: 'linear-gradient(170deg, rgba(245,158,11,0.16), rgba(245,158,11,0.02) 55%), #1A212B' } : undefined}>
              {gold && <span className="absolute -top-3.5 right-1/2 translate-x-1/2 chip bg-amber-400 text-ink-950 whitespace-nowrap">الخيار الأسرع الموصى به</span>}
              <div className="flex items-center justify-between mb-4">
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-mono ${gold ? 'bg-amber-400/15 text-amber-200 border-amber-400/30' : s.key === 'B' ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-white/[0.04] text-gray-300 border-white/10'}`}>{s.tag}</span>
                <span className={`text-xs font-bold ${gold ? 'text-amber-300' : s.key === 'B' ? 'text-emerald-400' : 'text-red-300'}`}>{gold ? '⚡ خارق' : s.key === 'B' ? 'المسار النشط القياسي' : 'بطيء ومستهلك'}</span>
              </div>
              <h3 className={`text-lg lg:text-xl font-extrabold mb-2 ${gold ? 'text-amber-200' : ''}`}>{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5 pb-5 border-b border-white/[0.06]">{s.desc}</p>
              <div className={`mt-auto rounded-2xl p-5 text-center ${gold ? 'bg-amber-400/20' : 'bg-ink-950/70'}`}>
                <p className="text-xs text-gray-300 mb-1">الزمن للوصول:</p>
                <p className={`text-2xl lg:text-3xl font-extrabold ${gold ? 'text-amber-300' : s.key === 'B' ? 'text-emerald-400' : 'text-white'}`}>{dur(s.months).replace('سنين', 'سنوات').replace('شهور', 'أشهر')}</p>
              </div>
              {s.note && <p className={`text-xs font-bold text-center mt-3 ${s.key === 'A' ? 'text-red-300/90' : 'text-emerald-400'}`}>{s.note}</p>}
            </div>
          )
        })}
      </div>

      {table.length > 0 && (
        <div className="card p-4 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-lg lg:text-xl font-extrabold flex items-center gap-2"><Table2 size={19} className="text-amber-400" />جدول التدفق السنوي وتراكم الأصول للمسار المسرّع ({years} {years <= 10 ? 'سنوات' : 'سنة'})</h3>
            <span className="text-xs text-gray-500">أرقام تقديرية بالريال السعودي</span>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-gray-300 text-sm border-b border-white/[0.08]">
                  <th className="text-right font-bold py-3.5">المرحلة الزمنية</th>
                  <th className="text-right font-bold py-3.5">إجمالي المبالغ المودعة</th>
                  <th className="text-right font-bold py-3.5">عوائد الفائدة المركبة</th>
                  <th className="text-right font-bold py-3.5">إجمالي صافي الثروة</th>
                  <th className="text-center font-bold py-3.5">الإنجاز المحقق</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r, i) => (
                  <tr key={i} className={`border-b border-white/[0.05] ${r.final ? 'bg-amber-400/[0.09]' : ''}`}>
                    <td className={`py-3.5 font-extrabold ${r.final ? 'text-amber-300' : ''}`}>
                      <span className={`inline-block w-2 h-2 rounded-full ml-2 ${r.final ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      {r.final && r.monthLabel ? `بعد ${r.monthLabel.replace('سنين', 'سنوات').replace('شهور', 'أشهر')}` : `نهاية السنة ${r.year}`}
                    </td>
                    <td className={`py-3.5 text-gray-300 ${mono}`} dir="ltr"><span className="float-right">{SAR} {formatNumber(r.deposits)}</span></td>
                    <td className={`py-3.5 text-emerald-400 font-bold ${mono}`} dir="ltr"><span className="float-right">{SAR} +{formatNumber(r.gains)}</span></td>
                    <td className={`py-3.5 font-extrabold ${mono} ${r.final ? 'text-emerald-400 text-base' : ''}`} dir="ltr"><span className="float-right">{SAR} {formatNumber(r.total)}</span></td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full ${r.final ? 'bg-amber-400 text-ink-950' : r.tag === 'مرحلة البناء' || r.tag === 'تراكم مستمر' ? 'bg-white/[0.06] text-gray-300' : r.tag.includes('الأرباح') ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-400'}`}>{r.final ? '🏆 ' : ''}{r.tag}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {split.gains > 0 && (
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">* ملاحظة استشارية: لاحظ أن عوائد الاستثمار المركبة وحدها (<b className="text-emerald-400">+{formatNumber(split.gains)} ر.س</b>) تشكّل {split.gainsPct}٪ من مليونك، بينما إيداعاتك من الراتب <b className="text-white">{formatNumber(split.contributions)} ر.س</b>. وكلما تقدمت السنوات، تعمل العوائد أكثر منك — هذه هي القوة الحقيقية للفائدة المركبة.</p>
          )}
        </div>
      )}
    </section>
  )
}

// ─── القسم الثالث ───────────────────────────────────────────────────────
export function DossierAssets({ monthly, blended }: { monthly: number; blended: number }) {
  const r = 70, c = 2 * Math.PI * r
  let acc = 0
  const icons = [Globe2, Building2, Landmark, Building]
  return (
    <section id="assets" data-pdf-break className="scroll-mt-24">
      <Head icon={Wallet} kicker="القسم الثالث: توزيع الأصول ومنصات التنفيذ"
        title="استراتيجية توزيع الأصول للمستثمر في السوق السعودي 2026"
        sub="محفظة استثمارية متوازنة النمو، خاضعة بالكامل للضوابط الشرعية وموزعة على 4 فئات"
        side={<Side icon={Shield}>تحقق من ترخيص أي منصة لدى هيئة السوق المالية (CMA) قبل فتح الحساب</Side>} />
      <div className="grid lg:grid-cols-[1.45fr_1fr] gap-5">
        <div className="space-y-4">
          {BUCKETS.map((b, i) => {
            const Icon = icons[i]
            return (
              <div key={b.name} className="card p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-4">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.color + '22', color: b.color }}><Icon size={22} /></span>
                    <div>
                      <h3 className="font-extrabold text-base lg:text-lg">{i + 1}. {b.name} ({b.pct}٪)</h3>
                      <p className="text-xs text-gray-400 mt-1">الوزن في خطتك: <span className={mono}>{formatNumber(Math.round((monthly * b.pct) / 100))}</span> ر.س شهرياً</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${mono}`} style={{ background: b.color + '18', color: b.color }}>عائد تاريخي: {b.range}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{b.desc}</p>
                <p className="text-[11px] text-gray-500 mt-2">{b.examples}</p>
              </div>
            )
          })}
        </div>
        <div className="card p-6 lg:p-7">
          <h3 className="text-xl font-extrabold text-center mb-1">الوزن النسبي المثالي للمحفظة</h3>
          <p className="text-xs text-gray-400 text-center mb-6">عائد سنوي مركب تاريخي تقريبي {blended}٪</p>
          <div className="relative w-56 h-56 mx-auto">
            <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
              {BUCKETS.map((b) => {
                const len = (b.pct / 100) * c
                const el = <circle key={b.name} cx="90" cy="90" r={r} fill="none" stroke={b.color} strokeWidth="26" strokeDasharray={`${len - 2} ${c - len + 2}`} strokeDashoffset={-acc} />
                acc += len
                return el
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold text-amber-300 ${mono}`}>{blended}٪</span>
              <span className="text-[11px] text-gray-400">متوسط العائد السنوي</span>
            </div>
          </div>
          <div className="space-y-2 mt-7">
            {BUCKETS.map((b) => (
              <div key={b.name} className="flex items-center justify-between gap-2 card-soft px-3.5 py-2.5 text-xs">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm shrink-0" style={{ background: b.color }} />{b.name}</span>
                <b className={mono} style={{ color: b.color }}>{b.pct}٪</b>
              </div>
            ))}
          </div>
          <div className="mt-7 pt-6 border-t border-white/[0.06]">
            <p className="text-sm font-extrabold mb-3">أفضل المنصات في المملكة للتنفيذ:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                ['أبيان المالية', 'استثمار آلي'],
                ['الراجحي المالية', 'صناديق محلية وعالمية'],
                ['سهم / دراية', 'أسهم وتداول'],
                ['صكوك «صح»', 'عائد ثابت حكومي'],
              ].map(([n, d]) => (
                <div key={n} className="card-soft px-3 py-2.5 flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400 shrink-0" /><span><b>{n}</b> <span className="text-gray-400">({d})</span></span></div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">أمثلة للتوضيح وليست توصية. تحقق من الترخيص عبر موقع هيئة السوق المالية وقارن الرسوم.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── القسم الرابع ───────────────────────────────────────────────────────
const PROJECTS = [
  { badge: '🔥 الأعلى طلباً 2026', bc: 'bg-amber-400/15 text-amber-300', border: 'border-amber-400/25', cap: '0 - 200 ر.س',
    title: 'أتمتة الذكاء الاصطناعي للشركات (AAA)',
    desc: 'بناء روبوتات محادثة واتساب ذكية لخدمة العملاء وحجز المواعيد للعيادات والمطاعم والمتاجر باستخدام Make وVoiceflow بدون أكواد معقدة.',
    rows: [['الوقت المطلوب:', '5 ساعات / أسبوع'], ['العائد المتوقع:', '3,000 - 8,000 ر.س / عميل'], ['أهم الأدوات:', 'Make, Voiceflow, OpenAI']],
    steps: ['تعلّم أتمتة الردود في يومين مجاناً على يوتيوب.', 'صمم نموذجاً تجريبياً لعيادة أسنان أو صالون تجميل مجاناً.', 'اعرض الخدمة باشتراك صيانة شهري مستمر (1,500 ر.س/شهر).'] },
  { badge: '⚡ دخل سلبي متكرر', bc: 'bg-emerald-400/10 text-emerald-400', border: 'border-emerald-400/20', cap: '0 ر.س',
    title: 'المنتجات والقوالب الرقمية الجاهزة (Notion / Excel)',
    desc: 'تصميم وبيع قوالب إكسل لمحاسبة المشاريع الصغيرة، قوالب نوشن لتنظيم الحياة، أو حقائب عروض تقديمية عبر منصات سلة أو زد أو Gumroad.',
    rows: [['الوقت المطلوب:', '3 ساعات / أسبوع'], ['العائد المتوقع:', '2,000 - 5,500 ر.س / شهرياً'], ['أهم الأدوات:', 'Notion, Google Sheets, Canva']],
    steps: ['اختر مشكلة محاسبية أو تنظيمية تتقن حلها.', 'صمم قالباً عملياً واختبره مع صديقين.', 'سوّق له بفيديوهات تعليمية قصيرة ومفيدة على منصة X وتيك توك.'] },
  { badge: '📱 بدون شهرة أو متابعين', bc: 'bg-amber-400/15 text-amber-300', border: 'border-amber-400/25', cap: 'جوالك الحالي',
    title: 'صناعة محتوى UGC التسويقي للعلامات التجارية',
    desc: 'تصوير فيديوهات تسويقية عفوية لمنتجات المتاجر والبراندات ونشرها في إعلاناتهم، دون الحاجة لظهورك كمشهور أو امتلاك متابعين على حسابك.',
    rows: [['الوقت المطلوب:', '4 ساعات / عطلة الأسبوع'], ['العائد المتوقع:', '400 - 1,200 ر.س / فيديو'], ['أهم الأدوات:', 'iPhone/Android, CapCut, إضاءة']],
    steps: ['صوّر 3 فيديوهات مراجعة ممتازة لأغراضك المنزلية كمعرض أعمال.', 'راسل 15 متجراً نشطاً في إنستقرام وتيك توك مع عرض مقطع تجريبي.', 'تعاقد بحزم أسبوعية (4 فيديوهات شهرياً = +2,500 ر.س).'] },
]

export function DossierProjects() {
  return (
    <section id="projects" data-pdf-break className="scroll-mt-24">
      <Head icon={Rocket} kicker="القسم الرابع: محرك تسريع الدخل 2026"
        title="حقيبة المشاريع الجانبية الأكثر رواجاً مع دراسات جدوى مصغرة"
        sub="مشاريع عملية يمكن لموظف أو محترف إدارتها في 4 إلى 8 ساعات أسبوعياً برأس مال يبدأ من صفر ريال"
        side={<Side icon={Target}>الهدف المالي: توليد 2,000 - 6,000 ر.س إضافية لضخها في المحفظة</Side>} />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {PROJECTS.map((p) => (
          <div key={p.title} className={`rounded-3xl border ${p.border} bg-ink-800 p-5 lg:p-6 flex flex-col`}>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className={`chip ${p.bc}`}>{p.badge}</span>
              <span className={`text-xs text-gray-400 ${mono}`}>رأس المال: {p.cap}</span>
            </div>
            <h3 className="text-lg font-extrabold mb-2 leading-snug">{p.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{p.desc}</p>
            <div className="rounded-2xl bg-ink-950/70 border border-white/[0.06] p-4 mb-4 space-y-2 text-xs">
              {p.rows.map(([k, v], i) => (
                <div key={k} className="flex justify-between gap-3"><span className="text-gray-400 shrink-0">{k}</span><b className={i === 1 ? `text-emerald-400 ${mono}` : i === 2 ? `text-gray-200 ${mono}` : ''}>{v}</b></div>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-white/[0.06]">
              <p className="text-xs font-extrabold text-amber-300 mb-2">خطة الانطلاق في 3 خطوات:</p>
              <ol className="space-y-1.5 text-xs text-gray-300">{p.steps.map((s, j) => <li key={j} className="leading-relaxed">{j + 1}. {s}</li>)}</ol>
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_2fr] gap-4">
        <div className="card p-5 lg:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="chip bg-white/[0.06] text-gray-200">💼 صفقات أرباح عالية B2B</span>
            <span className={`text-xs text-gray-400 ${mono}`}>رأس المال: 0 ر.س</span>
          </div>
          <h3 className="text-lg font-extrabold mb-2">وساطة الخدمات الرقمية للشركات (Drop Servicing)</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">الاتفاق مع مكاتب محلية تحتاج خدمات (تصميم هوية، كتابة محتوى، ترجمة، مواقع ويب) والاستعانة بمحترفين مستقلين موثوقين والربح من فرق الإدارة والضمان.</p>
          <div className="rounded-2xl bg-ink-950/70 border border-white/[0.06] p-4 mb-4 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><span className="text-gray-400">الوقت المطلوب:</span><b>3-4 ساعات / أسبوع</b></div>
            <div className="flex justify-between gap-3"><span className="text-gray-400">العائد المتوقع:</span><b className={`text-emerald-400 ${mono}`}>30% - 50% هامش ربح في الصفقة</b></div>
            <div className="flex justify-between gap-3"><span className="text-gray-400">أهم الأدوات:</span><b className={mono}>مستقل، خمسات، LinkedIn</b></div>
          </div>
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <p className="text-xs font-extrabold text-amber-300 mb-2">خطة الانطلاق في 3 خطوات:</p>
            <ol className="space-y-1.5 text-xs text-gray-300">
              <li>1. اختر تخصصاً محدداً (مثل مكاتب المحاماة أو المكاتب العقارية).</li>
              <li>2. اتفق مع مصمم أو مبرمج محترف لتسعير الخدمة.</li>
              <li>3. قدّم عرض قيمة متكاملاً مع استلام دفعة 50% مقدماً.</li>
            </ol>
          </div>
        </div>
        <div className="rounded-3xl border border-emerald-400/20 bg-ink-800 p-5 lg:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="chip bg-emerald-400/10 text-emerald-400">🚀 موجة التجارة الصاعدة 2026</span>
            <span className={`text-xs text-gray-400 ${mono}`}>رأس المال: 0 - 300 ر.س</span>
          </div>
          <h3 className="text-lg font-extrabold mb-2">إدارة وتشغيل مبيعات تيك توك شوب والمتاجر لتجار الجملة</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">مساعدة تجار التجزئة والمستوردين التقليديين في البطحاء أو أسواق الجملة الذين يفتقرون للخبرة الرقمية لإطلاق مبيعاتهم على تيك توك شوب وسلة، وإدارة المنتجات مقابل نسبة من صافي المبيعات.</p>
          <div className="rounded-2xl bg-ink-950/70 border border-white/[0.06] p-4 mb-4 grid sm:grid-cols-3 gap-3 text-xs">
            <div><p className="text-gray-400 mb-1">الوقت المطلوب:</p><b>6 ساعات / أسبوع</b></div>
            <div><p className="text-gray-400 mb-1">العائد المتوقع:</p><b className={`text-emerald-400 ${mono}`}>1,500 ر.س + 8% من المبيعات</b></div>
            <div><p className="text-gray-400 mb-1">أهم المنصات:</p><b className={`text-amber-300 ${mono}`}>TikTok Shop Seller, Salla</b></div>
          </div>
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <p className="text-xs font-extrabold text-emerald-400 mb-2">خطة الانطلاق السريعة:</p>
            <p className="text-xs text-gray-300 leading-relaxed">اعرض على تاجر تقليدي واحد رفع 10 منتجات مميزة له وتصوير مقاطع سريعة لها بنموذج شراكة دون أي مخاطرة مالية عليه، واستحق أول عمولة خلال أول 14 يوماً.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── عرض التقرير الثاني ─────────────────────────────────────────────────
export function DossierUpsell() {
  return (
    <section className="rounded-[28px] border-2 border-amber-400/60 p-5 lg:p-10 no-print"
      style={{ background: 'radial-gradient(90% 100% at 0% 100%, rgba(245,158,11,0.14), transparent 55%), #161C25' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-7 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="amber"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />التقرير الثاني التكميلي</Chip>
          <Chip><Award size={13} className="text-amber-400" />ترقية استشارية خاصة</Chip>
        </div>
        <span className="flex items-center gap-2 text-sm text-gray-400">عرض خاص مع هذا التقرير <span className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-extrabold text-amber-300 font-mono">49 ر.س فقط</span></span>
      </div>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div>
          <p className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-3"><Award size={16} />دليل المشاريع الأكثر ربحية 2026</p>
          <h3 className="text-2xl lg:text-[40px] font-extrabold leading-tight mb-4">دليل الـ 100 فكرة مشروع الأكثر ربحية بالسوق السعودي 2026</h3>
          <p className="text-sm lg:text-base text-gray-300 leading-relaxed mb-6">ملف تنفيذي مخصص لمضاعفة سرعة الوصول إلى المليون الأول عبر قنوات دخل إضافية مجربة ومدروسة لبيئة الأعمال السعودية.</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-7">
            {[
              [LayoutGrid, '100 فكرة سعودية مدروسة', 'مفروزة ومصنفة بحسب الميزانية والجهد المطلوب'],
              [SearchCheck, 'تحليل رأس المال والأرباح', 'تقديرات رأس المال المبدئي وصافي هامش الربح لكل فكرة'],
              [CirclePlay, 'خطة عمل اليوم الأول', 'خطوات سريعة وواضحة للانطلاق خلال 72 ساعة'],
              [Check, 'قوالب وأدوات تنفيذية', 'نماذج وشيتات عمل تفاعلية جاهزة للتحويل الفوري'],
            ].map(([Icon, t, d]) => {
              const I = Icon as React.ElementType
              return (
                <div key={t as string} className="card-soft p-4 flex items-start gap-3">
                  <I size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><b className="block text-sm">{t as string}</b><span className="text-xs text-gray-400">{d as string}</span></span>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/ideas-checkout" className="btn-primary px-6 py-3.5 text-base">انتقل إلى صفحة الدليل الكامل (49 ر.س) <ChevronLeft size={18} /></Link>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><Lock size={13} className="text-emerald-400" />دفع فوري آمن</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><Zap size={13} className="text-amber-400" />تسليم مباشر</span>
          </div>
        </div>
        <div className="rounded-3xl border border-white/[0.08] bg-ink-950/60 p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.06]">
            <p className="font-extrabold flex items-center gap-2"><FileText size={17} className="text-amber-400" />عينة مصغرة من محتوى الدليل</p>
            <span className="chip bg-emerald-400/10 text-emerald-400">مشروع #14</span>
          </div>
          <p className="font-extrabold text-amber-300 mb-1">وكالة تشغيل TikTok Shop المحلية</p>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">إدارة وربط منتجات تجار الجملة بحسابات تيك توك وتوليد عمولات فورية دون الحاجة لشراء أو تخزين بضائع.</p>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-ink-800 p-3 text-center text-xs mb-4">
            <div><p className="text-gray-400 mb-1">رأس المال</p><b className={mono}>450 ر.س</b></div>
            <div className="border-x border-white/[0.06]"><p className="text-gray-400 mb-1">الدخل المتوقع</p><b className={`text-emerald-400 ${mono}`}>حتى 12,000 ر.س</b></div>
            <div><p className="text-gray-400 mb-1">هامش الربح</p><b className={`text-amber-300 ${mono}`}>85%</b></div>
          </div>
          <div className="rounded-2xl bg-ink-800 p-3.5 text-xs">
            <p className="font-extrabold mb-1 flex items-center gap-1.5"><CircleCheck size={14} className="text-emerald-400" />خطة اليوم الأول (Day 1 Playbook):</p>
            <p className="text-gray-400 leading-relaxed">استخراج وثيقة العمل الحر، ثم الاتفاق مع تاجر جملة محلي بنموذج عمولة 15%.</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06] text-xs">
            <span className="text-gray-500 font-mono">+ 99 فكرة إضافية متكاملة</span>
            <Link href="/ideas-checkout" className="text-amber-300 font-bold flex items-center gap-1">عرض التفاصيل <ChevronLeft size={14} /></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── القسم الخامس ───────────────────────────────────────────────────────
export function DossierTools({ onTracker, fire }: {
  onTracker: () => void
  fire: { expenses: number; netWorth: number; monthly: number; rate: number }
}) {
  const [open, setOpen] = useState(false)
  const [exp, setExp] = useState(fire.expenses)
  const [mon, setMon] = useState(fire.monthly)
  const [rate, setRate] = useState(fire.rate)
  const target = Math.round(exp * 12 * 25)
  let months = 0
  if (target > fire.netWorth && mon > 0) {
    let w = fire.netWorth; const r = rate / 100 / 12
    while (w < target && months < 1200) { w = w * (1 + r) + mon; months++ }
  }
  const when = target <= fire.netWorth ? 'وصلت فعلاً 🎉' : months >= 1200 || mon <= 0 ? 'ارفع استثمارك الشهري' : dur(months).replace('سنين', 'سنوات').replace('شهور', 'أشهر')
  return (
    <section id="tools" data-pdf-break className="scroll-mt-24">
      <Head icon={FolderOpen} kicker="القسم الخامس: الحزمة المرفقة"
        title="صندوق أدوات تسريع الثروة والمصادر الحصرية المرفقة"
        sub="قوالب وأدوات جاهزة تم تضمينها مجاناً في هذا الملف لتبدأ التطبيق العملي اليوم"
        side={<Side icon={Gem} tone="amber">الحزمة المضافة متاحة مجاناً مع التقرير</Side>} />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-6 flex flex-col">
          <span className="w-14 h-14 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-5"><Sheet size={26} /></span>
          <h3 className="text-lg font-extrabold mb-2">شيت تتبع صافي الثروة الشهري (Excel)</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">شيت مبرمج بالمعادلات فيه خطتك شهراً بشهر لمدة 36 شهراً: الادخار المخطط والثروة المتوقعة، وتعبئ الفعلي ليحسب لك الفرق تلقائياً.</p>
          <button onClick={onTracker} className="mt-auto no-print w-full py-3 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400/10 transition-colors"><Download size={16} />تحميل القالب الذكي (Excel/Sheets)</button>
        </div>
        <div className="card p-6 flex flex-col">
          <span className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5"><Calculator size={26} /></span>
          <h3 className="text-lg font-extrabold mb-2">حاسبة التقاعد المبكر والاستقلال المالي (FIRE)</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">أداة تتيح لك حساب التاريخ الذي يمكنك فيه التوقف عن العمل الوظيفي والاعتماد على عوائد أصولك (قاعدة السحب الآمن 4٪).</p>
          <div className="rounded-xl bg-ink-950/60 border border-white/[0.06] p-4 mb-4 text-center">
            <p className="text-xs text-gray-400 mb-1">رقم استقلالك المالي</p>
            <p className={`text-2xl font-extrabold text-amber-300 ${mono}`}>{formatNumber(target)} ر.س</p>
            <p className="text-xs text-gray-300 mt-1">الوصول المتوقع: <b className="text-emerald-400">{when}</b></p>
          </div>
          {open && (
            <div className="space-y-3 mb-4 no-print">
              {[
                ['مصاريفك الشهرية', exp, setExp, 1000, 60000, 500],
                ['استثمارك الشهري', mon, setMon, 0, 60000, 500],
                ['العائد السنوي ٪', rate, setRate, 2, 12, 1],
              ].map(([l, v, set, mn, mx, st]) => (
                <label key={l as string} className="block text-xs">
                  <span className="flex justify-between mb-1"><span className="text-gray-400">{l as string}</span><b className={mono}>{formatNumber(v as number)}</b></span>
                  <input type="range" className="range w-full" min={mn as number} max={mx as number} step={st as number} value={v as number}
                    onChange={(e) => (set as (n: number) => void)(Number(e.target.value))}
                    style={{ ['--fill' as string]: `${(((v as number) - (mn as number)) / ((mx as number) - (mn as number))) * 100}%` } as React.CSSProperties} />
                </label>
              ))}
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="mt-auto no-print w-full py-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] text-amber-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400/10 transition-colors"><ExternalLink size={16} />{open ? 'إخفاء الحاسبة' : 'فتح حاسبة التقاعد المالي التفاعلية'}</button>
        </div>
        <div className="card p-6 flex flex-col">
          <span className="w-14 h-14 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-5"><BookOpen size={26} /></span>
          <h3 className="text-lg font-extrabold mb-2">دليل الـ 50 منصة وأداة ذكاء لتسريع الأرباح</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">كتيب تنفيذي يحوي أهم 50 منصة سعودية وعالمية لإنشاء المتاجر، وأدوات الذكاء الاصطناعي، وأدوات أتمتة العمل والدفع والشحن للبدء فوراً.</p>
          <a href="#platforms" className="mt-auto no-print w-full py-3 rounded-xl border border-blue-400/30 bg-blue-400/[0.06] text-blue-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-400/10 transition-colors"><BookOpen size={16} />استعراض الكتيب التنفيذي</a>
        </div>
      </div>
    </section>
  )
}

// ─── القسم السادس ───────────────────────────────────────────────────────
export function DossierPlan({ emergencyNeed, subs, excessCash, invMonthly, monthlySaving }: {
  emergencyNeed: number; subs: number; excessCash: number; invMonthly: number; monthlySaving: number
}) {
  const months = [
    { badge: 'الشهر الأول (الأيام 1 - 30)', tone: 'green', icon: ShieldPlus, title: 'إيقاف النزيف وبناء التحصين الأساسي', goal: 'تحرير السيولة المفقودة وتأمين الطوارئ',
      items: [
        `فصل ${formatNumber(emergencyNeed)} ر.س في حساب ادخاري مستقل كصندوق طوارئ مخصص (3 أشهر مصاريف).`,
        `مراجعة الاشتراكات وكشوف الحساب وإلغاء ما قيمته +${formatNumber(subs)} ر.س من النفقات غير المستغلة.`,
        `تفعيل أمر استقطاع دائم (Standing Order) لمبلغ الادخار (${formatNumber(Math.max(0, monthlySaving))} ر.س) في يوم نزول الراتب مباشرة.`,
      ] },
    { badge: 'الشهر الثاني (الأيام 31 - 60)', tone: 'amber', icon: Network, title: 'هندسة سلة الأصول وأتمتة التراكم', goal: 'تفعيل محرك الفائدة المركبة رسمياً',
      items: [
        'فتح وتوثيق حسابين استثماريين (أبيان أو الراجحي المالية للمؤشرات + سهم أو دراية للأسهم).',
        `ضخ أول دفعة استثمارية شهرية مجدولة (${formatNumber(invMonthly)} ر.س) وفق أوزان الأصول الأربعة المعتمدة (40/25/20/15).`,
        excessCash > 0 ? `نقل كاش السيولة الفائض البالغ ${formatNumber(excessCash)} ر.س لصناديق المرابحة والصكوك فوراً لكسر التآكل.` : 'تفعيل الاستثمار الدوري التلقائي الشهري إن كانت المنصة تدعمه.',
      ] },
    { badge: 'الشهر الثالث (الأيام 61 - 90)', tone: 'amber', icon: Rocket, title: 'إطلاق أول قناة دخل جانبي', goal: 'جلب أول 1,000 - 2,000 ر.س إضافية للمحفظة',
      items: [
        'اختيار أحد المشاريع الخمسة (مثل أتمتة الذكاء الاصطناعي أو بيع القوالب أو محتوى UGC).',
        'تجهيز العرض والنموذج التجريبي وإطلاقه لأول 10 عملاء محتملين.',
        'إيداع أول 1,000 ر.س يتم تحصيلها مباشرة في المحفظة الاستثمارية لتسريع المسار الذهبي.',
      ] },
  ]
  return (
    <section id="plan" data-pdf-break className="scroll-mt-24">
      <Head icon={Flag} tone="green" kicker="القسم السادس: خارطة التنفيذ"
        title="خطة العمل التنفيذية لأول 90 يوماً (خطوة بخطوة)"
        sub="تجزئة مسار التغيير إلى 3 مراحل شهرية مركزة ومحددة المهام لتفادي التشتت"
        side={<Side icon={Zap} tone="gray">ابدأ من الغد لتثبيت الانضباط المالي</Side>} />
      <div className="grid lg:grid-cols-3 gap-4">
        {months.map((p) => {
          const green = p.tone === 'green'
          const Icon = p.icon
          return (
            <div key={p.badge} className={`rounded-3xl border ${green ? 'border-white/[0.08]' : 'border-amber-400/20'} bg-ink-800 p-5 lg:p-6`}>
              <div className="flex items-center justify-between mb-5">
                <span className={`rounded-full px-3 py-1 text-xs font-mono font-bold ${green ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-300'}`}>{p.badge}</span>
                <Icon size={22} className={green ? 'text-emerald-400' : 'text-amber-400'} />
              </div>
              <h3 className="text-xl font-extrabold mb-1">{p.title}</h3>
              <p className="text-xs text-gray-400 mb-5">الهدف: {p.goal}</p>
              <ul className="space-y-3">
                {p.items.map((it, j) => <li key={j} className="flex items-start gap-2.5 text-sm text-gray-200 leading-relaxed"><CircleCheck size={17} className={`shrink-0 mt-0.5 ${green ? 'text-emerald-400' : 'text-amber-400'}`} />{it}</li>)}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── الختام ─────────────────────────────────────────────────────────────
export function DossierClosing({ id, shareText }: { id: string; shareText: string }) {
  return (
    <section className="rounded-[28px] border border-amber-400/25 bg-ink-800 p-6 lg:p-10 grid lg:grid-cols-[1fr_380px] gap-8 items-center">
      <div>
        <p className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-3"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />وثيقة الإنجاز المالي والعهد الشخصي</p>
        <h2 className="text-2xl lg:text-[38px] font-extrabold leading-tight mb-4">أنت الآن تملك الخارطة التي يحلم بها أغلب الناس</h2>
        <p className="text-sm lg:text-base text-gray-300 leading-loose mb-7">هذا الملف مبني على أرقامك أنت، ويختصر عليك سنوات من رحلة الثروة إذا التزمت به. السر الوحيد بعد قراءة هذا الملف هو الانضباط والاستمرارية.</p>
        <div className="flex flex-wrap gap-3 no-print">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-sm bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"><MessageSquare size={18} />مشاركة الإنجاز مع شريكك المالي عبر واتساب</a>
          <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
            className="btn-ghost px-6 py-3.5 text-sm"><Share2 size={18} className="text-blue-400" />مشاركة ملخص خطتي عبر X</a>
        </div>
      </div>
      <div className="rounded-3xl border border-white/[0.08] bg-ink-950/50 p-7 text-center">
        <span className="w-20 h-20 rounded-full border-2 border-amber-400/70 bg-amber-400/10 text-amber-300 flex items-center justify-center mx-auto mb-5" style={{ boxShadow: '0 0 30px rgba(245,158,11,0.25)' }}><ShieldPlus size={34} /></span>
        <p className="text-lg font-extrabold">ختم الملف الاستشاري الرقمي</p>
        <p className="text-xs text-gray-400 tracking-[0.2em] mt-1 font-mono" dir="ltr">CLIENT DOSSIER {new Date().getFullYear()} · {id}</p>
        <p className="text-xs text-gray-500 mt-5 pt-5 border-t border-white/[0.06] leading-relaxed">صالح للتطبيق الفوري ومصمم للتحديث الدوري مع نمو رأس المال.</p>
      </div>
    </section>
  )
}

// ─── الفوتر ─────────────────────────────────────────────────────────────
export function DossierFooter() {
  return (
    <section className="border-t border-white/[0.06] pt-10">
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 mb-8">
        <div>
          <p className="flex items-center gap-2 text-xl font-extrabold text-amber-300 mb-2"><BadgeCheck size={22} />محرك نمذجة الثروة الشخصية — متى تصير مليونير؟</p>
          <p className="text-sm text-gray-400 leading-relaxed">منظومة استشارية رقمية تعتمد على نماذج التراكم المالي لمساعدة الأفراد في رسم مسارات واضحة وقابلة للتطبيق لبلوغ الاستقلال المالي والحرية المستدامة.</p>
        </div>
        <div className="card p-5 lg:p-6">
          <p className="flex items-center gap-2 font-extrabold text-amber-300 mb-2"><Gavel size={17} />إخلاء المسؤولية الاستثمارية والقانونية</p>
          <p className="text-xs text-gray-400 leading-loose">هذا الملف التنفيذي مُعد لأغراض التخطيط المالي والمحاكاة التقديرية فقط، ولا يُعد بأي شكل من الأشكال استشارة استثمارية أو قانونية ملزمة أو توصية مباشرة لشراء أو بيع أي ورقة مالية أو أصل محدد. النتائج التقديرية مستندة إلى المدخلات الافتراضية للعميل وافتراضات العائد التاريخي المركب التي قد تتأثر بظروف الأسواق الاقتصادية والتضخم. يُنصح دائماً باستشارة خبير مالي مرخص قبل اتخاذ أي قرارات استثمارية جوهرية.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.06] text-xs text-gray-500">
        <span>© {new Date().getFullYear()} متى تصير مليونير؟ — جميع الحقوق محفوظة لمنظومة استشارات الثروة التنفيذية</span>
        <span className="flex items-center gap-2 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400" />محدّث وفق نماذج الفائدة التراكمية المركبة</span>
      </div>
    </section>
  )
}

