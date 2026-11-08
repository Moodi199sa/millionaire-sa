// الأقسام الموسّعة لتقرير تسريع الثروة.
// كل رقم هنا محسوب من أرقام المستخدم في lib/reportModel.ts — ولا يوجد أي رقم ثابت وهمي.
import {
  ListChecks, Wallet, ListOrdered, CreditCard, Grid3x3, Clock, ShieldAlert, TrendingDown, HandCoins,
  Landmark, Home, Umbrella, Brain, Gauge, BookOpen, Link2, CheckCircle2, Circle, CircleDot, HelpCircle,
  Repeat, Sparkles, CalendarClock,
} from 'lucide-react'
import { SectionHead, SideTag, Num, Takeaway } from './ui'
import { formatNumber } from '@/lib/calculator'
import {
  NEVER, dur, yearsShort, SENS_EXTRA, SENS_RATES, BudgetLine, StepStatus, INFLATION, BALANCED_RATE,
} from '@/lib/reportModel'

const SAR = 'ر.س'

// ─── فهرس المحتويات ─────────────────────────────────────────────────────
export function TableOfContents({ items }: { items: { id: string; n: string; title: string; desc: string }[] }) {
  return (
    <section data-pdf-break>
      <SectionHead icon={ListChecks} kicker="محتويات التقرير" title="وش بتلقى في تقريرك؟"
        sub="12 قسم مرتبة من التشخيص إلى التنفيذ. اقرأه مرة كامل، وبعدها ارجع للقسم اللي تحتاجه." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => (
          <a key={it.id} href={`#${it.id}`} className="card p-4 flex items-start gap-3 hover:border-amber-400/30 transition-colors">
            <span className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-300 font-extrabold flex items-center justify-center shrink-0 tabular-nums">{it.n}</span>
            <span><b className="block text-[15px] mb-0.5">{it.title}</b><span className="text-xs text-gray-400 leading-relaxed">{it.desc}</span></span>
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── الميزانية التفصيلية ─────────────────────────────────────────────────
export function BudgetDetail({ lines, S }: { lines: BudgetLine[]; S: number }) {
  const groups: { key: BudgetLine['group']; label: string; color: string }[] = [
    { key: 'needs', label: 'الأساسيات', color: '#3B82F6' },
    { key: 'wants', label: 'الرغبات', color: '#F59E0B' },
    { key: 'save', label: 'الاستثمار', color: '#10B981' },
  ]
  return (
    <div className="card p-5 lg:p-7 mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h3 className="text-lg font-extrabold flex items-center gap-2"><Wallet size={18} className="text-amber-400" />ميزانيتك الشهرية المقترحة — بند بند</h3>
        <span className="text-xs text-gray-500">من راتب <Num>{formatNumber(S)}</Num> {SAR}</span>
      </div>
      <p className="text-sm text-gray-400 mb-5">هذي سقوف شهرية مو أوامر. حركها بين البنود براحتك — بس لا تلمس سطر الاستثمار.</p>
      <div className="grid lg:grid-cols-3 gap-4">
        {groups.map((g) => {
          const ls = lines.filter((l) => l.group === g.key)
          const total = ls.reduce((s, l) => s + l.amount, 0)
          return (
            <div key={g.key} className="card-soft p-4">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
                <span className="flex items-center gap-2 font-extrabold"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: g.color }} />{g.label}</span>
                <b className="tabular-nums" style={{ color: g.color }}>{formatNumber(total)} {SAR}</b>
              </div>
              <div className="space-y-3">
                {ls.map((l) => (
                  <div key={l.name}>
                    <div className="flex justify-between gap-2 text-sm"><span className="font-bold">{l.name}</span><b className="tabular-nums shrink-0">{formatNumber(l.amount)}</b></div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{l.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <Takeaway>اعمل حساب بنكي فرعي (أو "محفظة") لكل مجموعة، وحوّل لها يوم الراتب. لما يخلص رصيد الرغبات، تخلص الرغبات لين الشهر الجاي — بدون ما تلمس الأساسيات أو الاستثمار.</Takeaway>
    </div>
  )
}

// ─── سلّم الأولويات + الديون ─────────────────────────────────────────────
export function PrioritiesAndDebt({ steps, debt, S }: {
  steps: { title: string; desc: string; status: StepStatus }[]
  debt: { samaCap: number; comfy: number; car: number; flat: number; years: number; profit: number; installment: number; fv: number }
  S: number
}) {
  const icon = (s: StepStatus) => s === 'done' ? <CheckCircle2 size={20} className="text-emerald-400" />
    : s === 'now' ? <CircleDot size={20} className="text-amber-400" />
    : s === 'check' ? <HelpCircle size={20} className="text-blue-300" /> : <Circle size={20} className="text-gray-600" />
  const label = (s: StepStatus) => s === 'done' ? 'منجز' : s === 'now' ? 'أنت هنا' : s === 'check' ? 'راجعها بنفسك' : 'بعدها'
  return (
    <section id="priorities" data-pdf-break className="scroll-mt-36">
      <SectionHead icon={ListOrdered} kicker="القسم الثاني: سلّم الأولويات والديون"
        title="وش تسوي أول؟ الترتيب الصح لفلوسك"
        sub="أكبر غلط مالي مو إنك ما تستثمر — إنك تسوي الخطوة الصح بالترتيب الغلط."
        side={<SideTag icon={ListOrdered} tone="gray">مبني على ترتيب المخططين الماليين المعتمد</SideTag>} />
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-5">سلّم الأولويات المالية — ووين أنت عليه</h3>
          <ol className="relative space-y-1">
            {steps.map((s, i) => (
              <li key={i} className={`flex items-start gap-3 rounded-2xl p-3.5 ${s.status === 'now' ? 'bg-amber-400/[0.07] border border-amber-400/25' : ''}`}>
                <span className="mt-0.5 shrink-0">{icon(s.status)}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2"><b className="text-[15px]">{i + 1}. {s.title}</b>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.status === 'done' ? 'bg-emerald-400/10 text-emerald-400' : s.status === 'now' ? 'bg-amber-400 text-ink-950' : s.status === 'check' ? 'bg-blue-400/10 text-blue-300' : 'bg-white/[0.05] text-gray-400'}`}>{label(s.status)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5">
          <div className="card p-5 lg:p-6">
            <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><CreditCard size={18} className="text-red-400" />الأقساط: وين الحد؟</h3>
            <p className="text-xs text-gray-400 mb-4">البنك المركزي (ساما) يحدد سقف لأقساط التمويل الاستهلاكي — بس السقف النظامي مو هو الرقم الصحي.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3.5">
                <p className="text-[11px] text-gray-400 mb-1">السقف النظامي (33.33٪)</p>
                <p className="text-xl font-extrabold text-red-300 tabular-nums">{formatNumber(debt.samaCap)} <span className="text-xs">{SAR}</span></p>
              </div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3.5">
                <p className="text-[11px] text-gray-400 mb-1">الحد المريح لخطتك (15٪)</p>
                <p className="text-xl font-extrabold text-emerald-400 tabular-nums">{formatNumber(debt.comfy)} <span className="text-xs">{SAR}</span></p>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">كل ريال قسط فوق الحد المريح هو ريال طالع من استثمارك. لو عندك أكثر من دين: سدّد <b className="text-white">الأعلى نسبة ربح أول</b> (يوفر فلوس أكثر)، أو <b className="text-white">الأصغر مبلغ أول</b> لو تحتاج دفعة معنوية — المهم ما تفتح دين جديد وأنت تسدد.</p>
          </div>
          <div className="card p-5 lg:p-6">
            <h3 className="text-base font-extrabold mb-3">مثال: وش تكلفك سيارة بالتقسيط فعلياً؟</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">سعر السيارة (مثال على راتبك)</span><b className="tabular-nums">{formatNumber(debt.car)} {SAR}</b></div>
              <div className="flex justify-between"><span className="text-gray-400">ربح ثابت {debt.flat}٪ لمدة {debt.years} سنين</span><b className="tabular-nums text-red-300">+{formatNumber(debt.profit)} {SAR}</b></div>
              <div className="flex justify-between"><span className="text-gray-400">القسط الشهري</span><b className="tabular-nums">{formatNumber(debt.installment)} {SAR}</b></div>
              <div className="flex justify-between pt-2 border-t border-white/[0.06]"><span className="text-gray-400">نفس القسط لو استثمرته {debt.years} سنين بـ{BALANCED_RATE}٪</span><b className="tabular-nums text-emerald-400">{formatNumber(debt.fv)} {SAR}</b></div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">النسبة الثابتة 5٪ مثال توضيحي. قبل أي تمويل اطلب "معدل النسبة السنوي" (APR) — هو الرقم الحقيقي اللي تقارن فيه.</p>
          </div>
        </div>
      </div>
      <Takeaway>لا تستثمر وعليك بطاقة ائتمانية مدورة — سدادها أول. وأي قرار تمويل جديد، اسأل نفسك: هل القسط تحت <Num>{formatNumber(debt.comfy)}</Num> {SAR}؟ ولو لا، أجّله.</Takeaway>
    </section>
  )
}

// ─── مصفوفة الحساسية ────────────────────────────────────────────────────
export function SensitivityGrid({ grid, userRate, bestExtra, bestRate }: { grid: number[][]; userRate: number; bestExtra: number; bestRate: number }) {
  const rowNear = SENS_EXTRA.reduce((bi, e, i) => Math.abs(e - bestExtra) < Math.abs(SENS_EXTRA[bi] - bestExtra) ? i : bi, 0)
  const all = grid.flat().filter((m) => m < NEVER)
  const min = Math.min(...all), max = Math.max(...all)
  const shade = (m: number) => {
    if (m >= NEVER) return 'rgba(239,68,68,0.12)'
    const t = max === min ? 1 : 1 - (m - min) / (max - min)
    return `rgba(16,185,129,${0.06 + t * 0.32})`
  }
  return (
    <div className="card p-4 lg:p-7 mt-5">
      <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Grid3x3 size={18} className="text-amber-400" />مصفوفة الحساسية: كل مزيج ادخار وعائد</h3>
      <p className="text-sm text-gray-400 mb-4">كل خانة = كم سنة توصل للمليون. كل ما كانت أخضر أكثر، كل ما وصلت أسرع. المربع الذهبي = مسارك المسرّع تقريباً.</p>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[520px] text-sm border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="text-right text-xs text-gray-400 font-bold p-2">زيادة شهرية ↓ / العائد ←</th>
              {SENS_RATES.map((r) => <th key={r} className={`text-center text-xs font-extrabold p-2 ${r === userRate ? 'text-amber-300' : 'text-gray-300'}`}>{r}٪{r === userRate ? ' (حالياً)' : ''}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, i) => (
              <tr key={i}>
                <td className="text-xs font-bold text-gray-300 p-2 whitespace-nowrap">{SENS_EXTRA[i] === 0 ? 'بدون زيادة' : `+${formatNumber(SENS_EXTRA[i])} ${SAR}`}</td>
                {row.map((m, j) => {
                  const isBest = i === rowNear && SENS_RATES[j] === bestRate
                  const isNow = i === 0 && SENS_RATES[j] === userRate
                  return (
                    <td key={j} className={`text-center rounded-lg py-2.5 font-extrabold tabular-nums ${isBest ? 'ring-2 ring-amber-400 text-amber-200' : isNow ? 'ring-1 ring-white/40' : ''}`} style={{ background: shade(m) }}>
                      {m >= NEVER ? '—' : yearsShort(m).replace(' سنة', '')}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-500 mt-2">الأرقام بالسنوات. "—" تعني ما توصل بهالمزيج. المربع المحدد بالأبيض = وضعك الحالي.</p>
      <Takeaway>لاحظ إن النزول عمودياً (تزيد المبلغ) غالباً يختصر أكثر من التحرك أفقياً (تطارد عائد أعلى). المبلغ بيدك — العائد بيد السوق.</Takeaway>
    </div>
  )
}

// ─── الزمن والتضخم واختبار الضغط ─────────────────────────────────────────
export function TimeAndRisk({ delay, doubleYears, rate, stress, inflation, base, smt, netWorth }: {
  delay: { years: number; total: number; lost: number; needed: number }[]
  doubleYears: number; rate: number
  stress: { key: string; title: string; when: string; months: number; delay: number; fix: string }[]
  inflation: { real: number; realMonths: number }
  base: number; smt: number; netWorth: number
}) {
  return (
    <section id="risk" data-pdf-break className="scroll-mt-36">
      <SectionHead icon={Clock} tone="green" kicker="القسم الرابع: الوقت والتضخم والمخاطر"
        title="اختبار الضغط: وش يصير لو الدنيا ما مشت مثل الخطة؟"
        sub="الخطة الجيدة مو اللي تنجح بالظروف المثالية — اللي تصمد لما يصير شي غلط."
        side={<SideTag icon={ShieldAlert} tone="gray">محاكاة شهرية على مسارك المسرّع</SideTag>} />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 mb-5">
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-red-400" />4 صدمات محتملة — وكم تأخرك</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {stress.map((s) => (
              <div key={s.key} className="card-soft p-4">
                <p className="font-extrabold text-sm">{s.title}</p>
                <p className="text-[11px] text-gray-500 mb-2">{s.when}</p>
                <p className={`text-xl font-extrabold mb-2 ${s.delay >= NEVER ? 'text-red-300' : s.delay === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {s.delay >= NEVER ? 'تتعطل الخطة' : s.delay === 0 ? 'بدون تأخير يذكر' : `+${dur(s.delay)}`}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">💡 {s.fix}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="card p-5 lg:p-6">
            <h3 className="text-base font-extrabold mb-2 flex items-center gap-2"><TrendingDown size={17} className="text-amber-400" />المليون بعد التضخم</h3>
            <p className="text-xs text-gray-400 mb-3">التضخم في السعودية كان بمتوسط {INFLATION}٪ في 2025. يعني المليون اللي بتوصله، قيمته الشرائية بفلوس اليوم أقل:</p>
            <p className="text-3xl font-extrabold text-amber-300 tabular-nums">{inflation.real ? `${formatNumber(inflation.real)} ${SAR}` : '—'}</p>
            <p className="text-xs text-gray-400 mt-1">قيمة مليونك بفلوس اليوم عند وصولك</p>
            <div className="mt-4 pt-4 border-t border-white/[0.06] text-sm text-gray-300 leading-relaxed">
              تبي <b className="text-white">مليون حقيقي بقيمة اليوم</b>؟ بنفس المسار تحتاج <b className="text-emerald-400">{dur(inflation.realMonths)}</b>. عشان كذا الاستثمار مو رفاهية — الكاش لحاله يخسر.
            </div>
          </div>
          <div className="card p-5 lg:p-6">
            <h3 className="text-base font-extrabold mb-2 flex items-center gap-2"><Repeat size={17} className="text-emerald-400" />قاعدة 72</h3>
            <p className="text-sm text-gray-300 leading-relaxed">اقسم 72 على العائد وتعرف كل كم سنة تتضاعف فلوسك. بعائد <b className="text-white">{rate}٪</b> فلوسك تتضاعف كل <b className="text-emerald-400 tabular-nums">{doubleYears}</b> سنة — يعني ثروتك الحالية (<Num>{formatNumber(netWorth)}</Num>) تصير <b className="text-white tabular-nums">{formatNumber(netWorth * 2)}</b> بدون ما تضيف ريال.</p>
          </div>
        </div>
      </div>

      <div className="card p-5 lg:p-7">
        <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><CalendarClock size={18} className="text-red-400" />تكلفة "بأبدأ بعدين"</h3>
        <p className="text-sm text-gray-400 mb-5">لو أجّلت تطبيق الخطة وكملت على وضعك الحالي، هذا اللي تخسره:</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {delay.map((d) => (
            <div key={d.years} className="rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">لو أجّلت {d.years === 1 ? 'سنة' : `${d.years} سنين`}</p>
              <p className="text-2xl font-extrabold text-red-300">{d.total >= NEVER ? '—' : `+${dur(d.lost)}`}</p>
              <p className="text-[11px] text-gray-500 mt-1">تأخير على موعد وصولك</p>
              {d.needed > 0 && <p className="text-xs text-gray-300 mt-3 pt-3 border-t border-white/[0.06]">وعشان توصل بنفس الموعد بتحتاج <b className="text-white tabular-nums">{formatNumber(d.needed)} {SAR}</b> بالشهر</p>}
            </div>
          ))}
        </div>
        {smt < NEVER && smt < base && (
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 lg:p-5">
            <p className="font-extrabold text-emerald-300 mb-1 flex items-center gap-2"><Sparkles size={16} />سلاح سري: "ادخر بكرة أكثر"</p>
            <p className="text-sm text-gray-200 leading-relaxed">طريقة من علم الاقتصاد السلوكي: كل ما زاد راتبك، نص الزيادة تروح للاستثمار تلقائياً. ما تحس بأي حرمان لأنك ما تعودت على الفلوس أصلاً. لو راتبك يزيد 3٪ بالسنة وطبقتها، توصل خلال <b className="text-white">{dur(smt)}</b> بدل {dur(base)} — <b className="text-emerald-400">توفر {dur(base - smt)}</b>.</p>
          </div>
        )}
      </div>
      <Takeaway>3 أشياء تحميك من أغلب الصدمات: صندوق طوارئ كامل، تحويل تلقائي ما تقدر "تنساه"، وقاعدة إنك ما تبيع وقت النزول.</Takeaway>
    </section>
  )
}

// ─── الزكاة + التقاعد + السكن + الحماية ─────────────────────────────────
export function ZakatRetirementProtection({ zakat, S }: { zakat: { onCash: number; upper: number; cash: number; inv: number }; S: number }) {
  const housing = Math.round((S * 0.28) / 50) * 50
  return (
    <section id="protect" data-pdf-break className="scroll-mt-36">
      <SectionHead icon={Umbrella} kicker="القسم السادس: الزكاة والتقاعد والحماية"
        title="الأشياء اللي أغلب الخطط تنساها"
        sub="زكاتك، تقاعدك، سكنك، وتأمينك — كلها تأثر على مليونك أكثر مما تتوقع." />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><HandCoins size={18} className="text-amber-400" />الزكاة في خطتك</h3>
          <p className="text-sm text-gray-400 mb-4">الزكاة ربع العشر (2.5٪) على المال اللي بلغ النصاب (قيمة 85 جرام ذهب) وحال عليه الحول.</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card-soft p-3.5"><p className="text-[11px] text-gray-400 mb-1">على الكاش (<Num>{formatNumber(zakat.cash)}</Num>)</p><p className="text-xl font-extrabold text-amber-300 tabular-nums">~{formatNumber(zakat.onCash)} <span className="text-xs">{SAR}/سنة</span></p></div>
            <div className="card-soft p-3.5"><p className="text-[11px] text-gray-400 mb-1">لو تزكي الكاش والاستثمارات كاملة</p><p className="text-xl font-extrabold tabular-nums">~{formatNumber(zakat.upper)} <span className="text-xs">{SAR}/سنة</span></p></div>
          </div>
          <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>• <b className="text-white">الأسهم للمضاربة:</b> تُزكّى بقيمتها السوقية 2.5٪.</li>
            <li>• <b className="text-white">الأسهم للاستثمار الطويل:</b> فيها تفصيل عند العلماء (بعضهم يرى الزكاة على الموجودات الزكوية للشركة فقط) — اسأل الهيئة الشرعية في منصتك.</li>
            <li>• <b className="text-white">الصناديق:</b> زكاتها حسب مكوناتها، وكثير من مدراء الصناديق ينشرون مقدار الزكاة للوحدة.</li>
          </ul>
          <p className="text-[11px] text-gray-500 mt-3">حدد "يوم زكاة" ثابت كل سنة وخلّه في تقويمك. الأرقام هنا تقديرية — راجع مختص لحالتك.</p>
        </div>
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Landmark size={18} className="text-emerald-400" />التقاعد والتأمينات الاجتماعية</h3>
          <p className="text-sm text-gray-400 mb-4">نظام التأمينات الجديد غيّر قواعد اللعبة للموظفين الجدد:</p>
          <ul className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /><span>اللي بدأ يشترك لأول مرة من 3 يوليو 2024: نسبة اشتراك المعاشات ترتفع تدريجياً من 9٪ إلى 11٪ (نص بالمية كل سنة).</span></li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /><span>سن التقاعد النظامي صار بين 58 و65 سنة حسب الحالة.</span></li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /><span>المشتركين القدامى باقين على نسبتهم الحالية.</span></li>
          </ul>
          <div className="mt-4 rounded-xl bg-white/[0.04] p-3.5 text-sm text-gray-200 leading-relaxed">💡 اعتبر معاش التقاعد <b className="text-white">أرضية</b>، والمليون <b className="text-white">سقفك</b>. المعاش لحاله غالباً أقل من راتبك الأخير، والفرق تغطيه استثماراتك.</div>
        </div>
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Home size={18} className="text-blue-400" />السكن: أكبر قرار مالي بحياتك</h3>
          <p className="text-sm text-gray-400 mb-4">السكن غالباً أكبر بند. لو انضبط، نص الخطة انضبطت.</p>
          <div className="rounded-xl border border-blue-400/20 bg-blue-400/[0.05] p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1">سقف السكن المريح لك (إيجار أو قسط)</p>
            <p className="text-2xl font-extrabold text-blue-300 tabular-nums">{formatNumber(housing)} {SAR} <span className="text-xs text-gray-400">بالشهر</span></p>
          </div>
          <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>• قبل الشراء: شيك على أهليتك لبرامج الدعم السكني في منصة "سكني".</li>
            <li>• الدفعة الأولى تُجمع بحساب مستقل — مو من صندوق الطوارئ ولا من الاستثمار طويل الأجل.</li>
            <li>• قارن القسط بالإيجار + الصيانة + تكلفة الفرصة للدفعة الأولى، مو القسط لحاله.</li>
          </ul>
        </div>
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Umbrella size={18} className="text-amber-400" />الحماية: لا تخلي حادث يمسح سنين</h3>
          <p className="text-sm text-gray-400 mb-4">قائمة تحقق — علّم على اللي عندك:</p>
          <div className="space-y-2">
            {[
              ['تأمين طبي يغطيك ويغطي عائلتك', 'مصروف علاج كبير ممكن ياكل صندوق الطوارئ كامل'],
              ['تأمين شامل للسيارة', 'خصوصاً لو عليها تمويل'],
              ['تأمين تكافلي على الحياة', 'لو فيه أحد يعتمد على دخلك'],
              ['وصية مكتوبة وتوثيق الديون', 'حق لك ولأهلك — وأسهل مما تتوقع'],
              ['قائمة بحساباتك ومنصاتك', 'عشان أحد تثق فيه يعرف وين كل شي'],
            ].map(([t, d]) => (
              <div key={t} className="card-soft p-3 flex items-start gap-2.5"><span className="w-4 h-4 rounded border border-white/30 shrink-0 mt-0.5" /><span><b className="text-sm">{t}</b><span className="block text-[11px] text-gray-500">{d}</span></span></div>
            ))}
          </div>
        </div>
      </div>
      <Takeaway>خصص الزكاة كبند سنوي في ميزانيتك (حوالي <Num>{formatNumber(Math.round(zakat.onCash / 12))}</Num> {SAR} بالشهر على كاشك الحالي)، وأكمل قائمة الحماية قبل ما تزيد المخاطرة في محفظتك.</Takeaway>
    </section>
  )
}

// ─── علم النفس المالي ───────────────────────────────────────────────────
export function MoneyPsychology() {
  const biases = [
    { t: 'تضخّم نمط الحياة', d: 'كل زيادة راتب تروح لسيارة أحسن وبيت أكبر — وتبقى بنفس النقطة.', f: 'نص أي زيادة يروح للاستثمار تلقائياً قبل ما تتعود عليه.' },
    { t: 'الهلع وقت النزول', d: 'خسارة 10٪ توجع ضعف ما تفرّح ربح 10٪، فتبيع بأسوأ وقت.', f: 'لا تفتح المحفظة يومياً. مراجعة كل 3 شهور تكفي.' },
    { t: 'نصايح السوشيال ميديا', d: '"سهم بيطير" و"فرصة ما تتعوض" — أغلبها تسويق أو مضاربة.', f: 'أي فرصة تحتاج تقرر فيها بسرعة = لا.' },
    { t: 'تفضيل الحين على بعدين', d: 'متعة اليوم تبان أكبر من مليون بعد سنين.', f: 'اربط الادخار بهدف محسوس: صورة، تاريخ، رقم في جوالك.' },
    { t: 'فلوس "الحظ"', d: 'المكافآت والهدايا والبونص نعاملها كأنها مو فلوس حقيقية.', f: 'قاعدة 50/50: نص لك تستمتع فيه، ونص للمحفظة.' },
    { t: 'الثقة الزايدة', d: 'كثرة البيع والشراء تحسسك إنك تتحكم — بس الرسوم والأخطاء تاكل العائد.', f: 'صناديق مؤشرات + تحويل تلقائي = أقل قرارات وأقل أخطاء.' },
  ]
  return (
    <section id="mind" data-pdf-break className="scroll-mt-36">
      <SectionHead icon={Brain} tone="green" kicker="القسم الثامن: علم النفس المالي"
        title="أكبر خطر على مليونك… أنت"
        sub="الدراسات في الاقتصاد السلوكي تقول: السلوك يفرّق أكثر من المعرفة. هذي 6 فخاخ وكيف تتجنبها." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {biases.map((b, i) => (
          <div key={i} className="card p-5">
            <span className="w-8 h-8 rounded-lg bg-red-400/10 text-red-300 font-extrabold text-sm flex items-center justify-center mb-3 tabular-nums">{i + 1}</span>
            <h3 className="font-extrabold mb-1.5">{b.t}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">{b.d}</p>
            <p className="text-sm text-emerald-300 leading-relaxed"><b>الحل: </b>{b.f}</p>
          </div>
        ))}
      </div>
      <Takeaway>اكتب قواعدك الآن وأنت هادي: "ما أبيع وقت النزول، ما أستثمر في شي ما أفهمه، ونص أي زيادة للمحفظة". القرار المكتوب مسبقاً أقوى من أي قرار وقت الحماس.</Takeaway>
    </section>
  )
}

// ─── لوحة المؤشرات والمراجعة الدورية ─────────────────────────────────────
export function KpiReview({ items }: { items: { name: string; now: string; target: string; ok: boolean }[] }) {
  return (
    <section id="kpi" data-pdf-break className="scroll-mt-36">
      <SectionHead icon={Gauge} kicker="القسم الحادي عشر: لوحة مؤشراتك"
        title="6 أرقام تراقبها — وكل شي ثاني تفاصيل"
        sub="ما تحتاج تتابع السوق يومياً. تابع هالمؤشرات كل 3 شهور وبتعرف بالضبط وين أنت." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {items.map((k) => (
          <div key={k.name} className={`rounded-2xl border p-5 ${k.ok ? 'border-emerald-400/20 bg-emerald-400/[0.04]' : 'border-white/[0.06] bg-ink-800'}`}>
            <p className="text-xs text-gray-400 font-bold mb-2">{k.name}</p>
            <p className={`text-2xl font-extrabold tabular-nums mb-1 ${k.ok ? 'text-emerald-400' : 'text-white'}`}>{k.now}</p>
            <p className="text-xs text-gray-500">الهدف: {k.target} {k.ok && <span className="text-emerald-400 font-bold">✓</span>}</p>
          </div>
        ))}
      </div>
      <div className="card p-5 lg:p-7">
        <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2"><CalendarClock size={18} className="text-amber-400" />المراجعة الربع سنوية — 20 دقيقة كل 3 شهور</h3>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {[
            'حدّث صافي ثروتك في شيت التتبّع',
            'قارن الادخار الفعلي بالمخطط — وش سبب الفرق؟',
            'هل نسبة الادخار زادت أو نقصت؟',
            'أعد توازن المحفظة لو انحرفت أكثر من 5٪ عن الأوزان',
            'راجع الاشتراكات والفواتير المتكررة',
            'هل دخلك الجانبي يتحرك؟ وش الخطوة الجاية؟',
            'أي زيادة راتب؟ طبّق قاعدة النص للمحفظة',
            'افتح الحاسبة وحدّث أرقامك — شوف موعدك الجديد',
          ].map((t) => <div key={t} className="flex items-start gap-2 text-sm text-gray-200"><span className="w-4 h-4 rounded border border-white/30 shrink-0 mt-0.5" />{t}</div>)}
        </div>
      </div>
    </section>
  )
}

// ─── المسرد + الأسئلة + المصادر ─────────────────────────────────────────
export function GlossaryFaqSources() {
  const terms = [
    ['العائد المركب', 'ربح على ربحك. فلوسك تكسب، والمكسب نفسه يكسب.'],
    ['صندوق المؤشر (ETF)', 'صندوق يشتري سلة شركات كاملة دفعة وحدة، ويتداول مثل السهم.'],
    ['الصكوك', 'أداة تمويل متوافقة مع الشريعة بعائد شبه ثابت، أقل مخاطرة من الأسهم.'],
    ['صندوق المرابحة', 'صندوق منخفض المخاطر وسهل السحب — مناسب للطوارئ.'],
    ['صناديق ريت', 'صناديق عقارية مدرجة توزع أغلب دخلها الإيجاري على المستثمرين.'],
    ['إعادة التوازن', 'ترجّع محفظتك لأوزانها الأصلية لما تنحرف بسبب حركة السوق.'],
    ['متوسط التكلفة (DCA)', 'تستثمر مبلغ ثابت كل شهر بغض النظر عن السعر.'],
    ['صافي الثروة', 'كل اللي تملكه ناقص كل اللي عليك.'],
    ['معدل النسبة السنوي (APR)', 'التكلفة الحقيقية للتمويل شاملة كل الرسوم.'],
    ['قاعدة الـ4٪', 'تقدر تسحب تقريباً 4٪ من محفظتك سنوياً لفترة طويلة بدون ما تخلص.'],
    ['التضخم', 'ارتفاع الأسعار مع الوقت — يعني نفس الريال يشتري أقل.'],
    ['السيولة', 'سهولة تحويل الأصل لكاش بسرعة وبدون خسارة.'],
  ]
  const faq = [
    ['أبدأ أستثمر وأنا ما كملت صندوق الطوارئ؟', 'الأفضل تكمّل الطوارئ أول. لو المدة طويلة، قسّم: 70٪ للطوارئ و30٪ للاستثمار لين يكتمل.'],
    ['وش أحسن وقت أدخل السوق؟', 'ما أحد يعرف. الاستثمار الشهري الثابت يحل المشكلة لأنك تشتري بكل الأسعار.'],
    ['هل الذهب أو الكريبتو مكانهم في المحفظة؟', 'الذهب ممكن بنسبة صغيرة كتحوّط. الكريبتو مضاربة عالية المخاطر — إذا لازم، نسبة صغيرة تتحمل خسارتها كاملة.'],
    ['أشتري بيت ولا أستثمر؟', 'قرار شخصي. القاعدة: لا يتعدى القسط 25–30٪ من راتبك، ولا تستخدم صندوق الطوارئ كدفعة أولى.'],
    ['كم مرة أحدّث التقرير؟', 'كل 3 شهور أو مع أي تغيير كبير (راتب، زواج، بيت). أدخل أرقامك الجديدة في الحاسبة.'],
    ['هل هذا التقرير استشارة مالية؟', 'لا — هو خطة تخطيط وتوعية مبنية على أرقامك. للقرارات الكبيرة استشر مستشار مرخص.'],
  ]
  const sources = [
    ['الهيئة العامة للإحصاء — مؤشر أسعار المستهلك 2025/2026', 'https://stats.gov.sa'],
    ['وزارة المالية / المركز الوطني لإدارة الدين — منتج صكوك "صح"', 'https://www.ndmc.gov.sa'],
    ['المؤسسة العامة للتأمينات الاجتماعية — نظام التأمينات الجديد', 'https://www.gosi.gov.sa'],
    ['البنك المركزي السعودي — مبادئ التمويل المسؤول', 'https://rulebook.sama.gov.sa'],
    ['هيئة السوق المالية — التحقق من الجهات المرخصة', 'https://cma.org.sa'],
    ['برنامج تطوير القطاع المالي — رؤية 2030', 'https://www.vision2030.gov.sa'],
  ]
  return (
    <section id="glossary" data-pdf-break className="scroll-mt-36">
      <SectionHead icon={BookOpen} tone="green" kicker="القسم الثاني عشر: المرجع"
        title="المسرد، الأسئلة الشائعة، والمصادر"
        sub="كل مصطلح استخدمناه — بلغة بسيطة — ومن وين جبنا الأرقام." />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2"><BookOpen size={18} className="text-amber-400" />مسرد المصطلحات</h3>
          <dl className="grid sm:grid-cols-2 gap-3">
            {terms.map(([t, d]) => <div key={t} className="card-soft p-3"><dt className="text-sm font-extrabold text-amber-200 mb-0.5">{t}</dt><dd className="text-xs text-gray-400 leading-relaxed">{d}</dd></div>)}
          </dl>
        </div>
        <div className="card p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2"><HelpCircle size={18} className="text-emerald-400" />أسئلة يسألها الكل</h3>
          <div className="space-y-3">
            {faq.map(([q, a]) => <div key={q} className="card-soft p-3.5"><p className="text-sm font-extrabold mb-1">{q}</p><p className="text-xs text-gray-400 leading-relaxed">{a}</p></div>)}
          </div>
        </div>
      </div>
      <div className="card p-5 lg:p-7 mt-5">
        <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Link2 size={18} className="text-blue-400" />مصادر الأرقام والأنظمة</h3>
        <p className="text-xs text-gray-400 mb-4">آخر مراجعة: نوفمبر 2026. العوائد التاريخية تقريبية للتخطيط فقط.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {sources.map(([t, u]) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="card-soft p-3 text-sm hover:border-blue-400/30 transition-colors"><b className="block">{t}</b><span className="text-[11px] text-gray-500" dir="ltr">{u.replace('https://', '')}</span></a>)}
        </div>
      </div>
    </section>
  )
}


