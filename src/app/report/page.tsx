'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Download, Printer, Hourglass, Rocket, BadgeCheck, CalendarDays, Hash, Star, PieChart, Scissors,
  Sparkles, Target, TrendingUp, Table2, Globe2, Building2, Landmark, Building, ShieldCheck, Flame,
  Lightbulb, Briefcase, FileSpreadsheet, BellRing, Flag, CheckCircle2, Share2, MessageCircle,
  Scale, AlertTriangle, Zap, Calculator, ChevronLeft, Brain, Coffee, Wallet, Gavel, Lock,
} from 'lucide-react'
import { SectionHead, SideTag, Num, Takeaway } from '@/components/report/ui'
import {
  TableOfContents, BudgetDetail, PrioritiesAndDebt, SensitivityGrid, TimeAndRisk, ZakatRetirementProtection,
  MoneyPsychology, KpiReview, GlossaryFaqSources, PlatformsGuide,
} from '@/components/report/ExtendedSections'
import {
  DossierHeader, DossierHero, DossierBudget, DossierScenarios, DossierAssets, DossierProjects, DossierUpsell,
  DossierTools, DossierPlan, DossierClosing, DossierFooter,
} from '@/components/report/DossierSections'
import { getReportData, UserData } from '@/lib/store'
import { formatNumber, contributionSplit } from '@/lib/calculator'
import { ReportData, computeExtras, buildLocalReport } from '@/lib/reportFallback'
import {
  GOAL, NEVER, dur, yearsShort, reportId, readiness, cashflow, scenarios, yearTable, requiredMonthly,
  BUCKETS, blendedReturn, trackerCsv, reminderIcs, downloadFile, SIDE_INCOME, BALANCED_RATE,
  sensitivity, delayCost, stressTests, inflationView, saveMoreTomorrow, rule72, budgetLines, priorities,
  debtView, zakatView, kpis, inflationLoss,
} from '@/lib/reportModel'

const SAR = 'ر.س'

function LoadingReport() {
  const [step, setStep] = useState(0)
  const steps = ['نحلل مصاريفك وادخارك...', 'نكشف التسريبات ونحسب السيناريوهات...', 'نوزّع محفظتك ونجهز خطة الـ90 يوم...', 'لحظات وتقريرك جاهز...']
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1800)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="text-center py-28 px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-6 animate-glow"><BadgeCheck size={30} /></div>
      <h2 className="text-xl font-extrabold mb-2">نجهز تقريرك الشخصي</h2>
      <p className="text-gray-400 text-sm mb-8">{steps[step]}</p>
      <div className="w-56 h-2 bg-ink-700 rounded-full mx-auto overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 bg-amber-400" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

// يقص الصفوف الفاضية (لون الخلفية) من أسفل اللقطة
function trimBottom(c: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const { width, height } = c
  const data = ctx.getImageData(0, 0, width, height).data
  const isBg = (i: number) => Math.abs(data[i] - 18) < 6 && Math.abs(data[i + 1] - 23) < 6 && Math.abs(data[i + 2] - 31) < 6
  let last = height - 1
  outer: for (; last > 0; last--) {
    const row = last * width * 4
    for (let x = 0; x < width; x += 3) if (!isBg(row + x * 4)) break outer
  }
  const h = Math.min(height, last + 8)
  if (h >= height) return c
  const out = document.createElement('canvas')
  out.width = width; out.height = h
  out.getContext('2d')!.drawImage(c, 0, 0, width, h, 0, 0, width, h)
  return out
}

// توحيد الأرقام (العربية-الهندية → إنجليزية) في نصوص التقرير، مثل باقي الموقع
function latinDigits<T>(v: T): T {
  if (typeof v === 'string') return v.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660)).replace(/٬/g, ',').replace(/٫/g, '.') as unknown as T
  if (Array.isArray(v)) return v.map(latinDigits) as unknown as T
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, latinDigits(x)])) as T
  return v
}

// ─── الصفحة ─────────────────────────────────────────────────────────────
export default function ReportPage() {
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [targetYears, setTargetYears] = useState(10)
  const [calcRate, setCalcRate] = useState(BALANCED_RATE)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfMode, setPdfMode] = useState(false)
  const [noData, setNoData] = useState(false)

  useEffect(() => {
    // وضع توليد الـPDF داخل إطار مخفي (للجوال): البيانات تجي من الصفحة الأم بدون طلب جديد
    try {
      const parent = window.parent as unknown as { __smPdfPayload?: { data: UserData; report: ReportData } }
      if (new URLSearchParams(window.location.search).get('pdf') === '1' && window.parent !== window && parent.__smPdfPayload) {
        setData(parent.__smPdfPayload.data)
        setReport(parent.__smPdfPayload.report)
        setLoading(false)
        setPdfMode(true)
        return
      }
    } catch {}
    // حارس الوصول: التقرير محتوى مدفوع — نتحقق من توكن الوصول قبل عرض أي شيء
    fetch('/api/check-access?product=report')
      .then((r) => r.json())
      .then((res) => {
        if (res.access) {
          const d = getReportData()
          // بدون أرقام: لا نعرض أرقاماً افتراضية — نطلب من العميل يحسب أول (وصوله المدفوع محفوظ)
          if (!d) { setNoData(true); setLoading(false); return }
          setData(d)
          generateReport(d)
        } else {
          router.push('/checkout')
        }
      })
      .catch(() => router.push('/checkout'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateReport = async (d: UserData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: d.salary, expenses: d.expenses, monthlySaving: d.monthlySaving, totalMonths: d.totalMonths, netWorth: d.netWorth, rate: d.rate }),
      })
      const json = await res.json()
      if (json.result) {
        try {
          const ai = JSON.parse(json.result)
          // الـAI يعطي النصوص الإبداعية، والحقول الحسابية تُحسب محلياً دائماً
          setReport(latinDigits({ ...ai, ...computeExtras(d) }))
          return
        } catch {}
      }
      throw new Error('fallback')
    } catch {
      setReport(latinDigits(buildLocalReport(d)))
    } finally {
      setLoading(false)
    }
  }

  const m = useMemo(() => {
    if (!data) return null
    const flow = cashflow(data)
    const sc = scenarios(data, flow.recovery)
    const best = sc[2]
    const table = yearTable(data.netWorth, best.monthly, best.rate, best.months)
    const split = contributionSplit(data.netWorth, best.monthly, best.months)
    const ext = {
      grid: sensitivity(data),
      delay: delayCost(data, best.monthly, best.rate, best.months),
      stress: stressTests(data, best.monthly, best.rate, best.months),
      infl: inflationView(data, best.monthly, best.rate, best.months),
      smt: saveMoreTomorrow(data, best.monthly, best.rate),
      budget: budgetLines(flow.S, flow.target),
      steps: priorities(data, flow.emergencyNeed),
      debt: debtView(data),
      zakat: zakatView(data),
      kpi: kpis(data, flow.emergencyNeed),
    }
    return { flow, sc, best, table, split, ext, ready: readiness(data), id: reportId(data) }
  }, [data])

  const [pdfProgress, setPdfProgress] = useState(0)

  // على الجوال: نولّد الـPDF من نسخة بعرض الكمبيوتر داخل إطار مخفي، عشان يطلع بنفس تنسيق التقرير الكامل
  const downloadViaFrame = () => {
    const w = window as unknown as Record<string, unknown>
    setPdfBusy(true); setPdfProgress(0)
    w.__smPdfPayload = { data, report }
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;top:0;left:-20000px;width:1280px;height:900px;border:0;opacity:0;pointer-events:none'
    let finished = false
    const cleanup = () => { finished = true; clearTimeout(timer); frame.remove(); setPdfBusy(false); delete w.__smPdfPayload }
    w.__smPdfProgress = (p: number) => setPdfProgress(p)
    w.__smPdfResolve = (buf: ArrayBuffer) => {
      downloadFile('تقرير-تسريع-الثروة-saudimillion.pdf', '', 'application/pdf', new Blob([buf], { type: 'application/pdf' }))
      cleanup()
    }
    w.__smPdfReject = () => { if (!finished) { cleanup(); window.print() } }
    const timer = setTimeout(() => (w.__smPdfReject as () => void)(), 120000)
    frame.src = '/report?pdf=1'
    document.body.appendChild(frame)
  }

  const downloadPDF = async (inFrame = false) => {
    if (!inFrame && window.innerWidth < 1024) return downloadViaFrame()
    const parentApi = window.parent as unknown as { __smPdfProgress?: (p: number) => void; __smPdfResolve?: (b: ArrayBuffer) => void; __smPdfReject?: () => void }
    setPdfBusy(true); setPdfProgress(0)
    try {
      const { toCanvas, getFontEmbedCSS } = await import('html-to-image')
      const { default: jsPDF } = await import('jspdf')
      const root = document.getElementById('report-content')
      if (!root) return
      await document.fonts.ready
      await new Promise((r) => setTimeout(r, 150))
      // نلتقط بعرض ثابت مناسب للورق (A4) عشان الخط يطلع مقروء والصفحات ممتلئة
      const prevW = root.style.width, prevMax = root.style.maxWidth
      if (window.innerWidth >= 1024) { root.style.width = '1100px'; root.style.maxWidth = '1100px' }
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)))
      const restore = () => { root.style.width = prevW; root.style.maxWidth = prevMax }
      const sections = Array.from(root.children) as HTMLElement[]
      let fontEmbedCSS: string | undefined
      try { fontEmbedCSS = await getFontEmbedCSS(root) } catch {}
      const opts = {
        pixelRatio: 2, backgroundColor: '#12171F', cacheBust: true, fontEmbedCSS,
        filter: (node: HTMLElement) => !(node instanceof HTMLElement && node.classList.contains('no-print')),
      }
      // تقسيم احترافي: كل قسم رئيسي يبدأ بصفحة جديدة، والأقسام ما تنقص من النص
      const pdf = new jsPDF('p', 'mm', 'a4')
      const PW = pdf.internal.pageSize.getWidth(), PH = pdf.internal.pageSize.getHeight()
      const M = 8, TOP = 10, BOTTOM = 12, GAP = 6
      const CW = PW - M * 2, CH = PH - TOP - BOTTOM
      let y = TOP, pageHasContent = false
      const paint = () => { pdf.setFillColor(18, 23, 31); pdf.rect(0, 0, PW, PH, 'F') }
      const newPage = () => { pdf.addPage(); paint(); y = TOP; pageHasContent = false }
      paint()
      // نقسم الأقسام الطويلة لوحدات (عنوان، بطاقات، خلاصة...) عشان ما ينقص كرت بنص صفحة
      const pxPerMm = root.getBoundingClientRect().width / CW
      const maxPx = CH * pxPerMm
      const isStack = (el: HTMLElement) => {
        const kids = Array.from(el.children) as HTMLElement[]
        if (kids.length < 2) return false
        const w = el.getBoundingClientRect().width
        return kids.every((k) => k.getBoundingClientRect().width >= w * 0.9)
      }
      const units: { el: HTMLElement; brk: boolean }[] = []
      const expand = (el: HTMLElement, brk: boolean, depth: number) => {
        if (el.classList.contains('no-print') || el.offsetHeight === 0) return
        if (el.offsetHeight > maxPx * 0.92 && depth < 3 && isStack(el)) {
          (Array.from(el.children) as HTMLElement[]).forEach((k, idx) => expand(k, brk && idx === 0, depth + 1))
        } else units.push({ el, brk })
      }
      sections.forEach((sec) => expand(sec, sec.hasAttribute('data-pdf-break'), 0))
      for (let i = 0; i < units.length; i++) {
        const { el: sec, brk } = units[i]
        // نعطي مساحة إضافية تحت (لو الخط في النسخة الملتقطة لفّ أكثر) ثم نقص الفراغ
        const raw = await toCanvas(sec, { ...opts, height: Math.ceil(sec.offsetHeight * 1.3) + 40, style: { height: 'auto' } })
        const canvas = trimBottom(raw)
        setPdfProgress(Math.round(((i + 1) / units.length) * 100))
        if (inFrame) parentApi.__smPdfProgress?.(Math.round(((i + 1) / units.length) * 100))
        const mmPerPx = CW / (canvas.width * (root.getBoundingClientRect().width / sec.getBoundingClientRect().width))
        const wMm = canvas.width * mmPerPx
        const hMm = canvas.height * mmPerPx
        const x = PW - M - wMm // محاذاة يمين (RTL)
        if (brk && pageHasContent) newPage()
        if (hMm <= CH - (y - TOP)) {
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, wMm, hMm)
          y += hMm + GAP; pageHasContent = true
          continue
        }
        if (hMm <= CH) {
          if (pageHasContent) newPage()
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, wMm, hMm)
          y += hMm + GAP; pageHasContent = true
          continue
        }
        // وحدة أطول من صفحة: نقسمها على عدة صفحات
        if (pageHasContent) newPage()
        const slicePx = Math.floor(CH / mmPerPx)
        for (let off = 0; off < canvas.height; off += slicePx) {
          const h = Math.min(slicePx, canvas.height - off)
          const part = document.createElement('canvas')
          part.width = canvas.width; part.height = h
          part.getContext('2d')!.drawImage(canvas, 0, off, canvas.width, h, 0, 0, canvas.width, h)
          if (off > 0) newPage()
          pdf.addImage(part.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, wMm, h * mmPerPx)
          y += h * mmPerPx + GAP; pageHasContent = true
        }
      }
      restore()
      // ترقيم الصفحات
      const total = pdf.getNumberOfPages()
      for (let p = 1; p <= total; p++) {
        pdf.setPage(p)
        pdf.setFontSize(8); pdf.setTextColor(120, 130, 145)
        pdf.text(`saudimillion.com  |  ${m?.id || ''}`, M, PH - 5)
        pdf.text(`${p} / ${total}`, PW - M, PH - 5, { align: 'right' })
      }
      if (inFrame) parentApi.__smPdfResolve?.(pdf.output('arraybuffer'))
      else pdf.save('تقرير-تسريع-الثروة-saudimillion.pdf')
    } catch (e) {
      console.error(e)
      if (inFrame) { parentApi.__smPdfReject?.(); return }
      const root = document.getElementById('report-content')
      if (root) { root.style.width = ''; root.style.maxWidth = '' }
      window.print()
    } finally {
      setPdfBusy(false)
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (pdfMode && report && m) {
      const t = setTimeout(() => downloadPDF(true), 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfMode, report, m])

  if (noData) {
    return (
      <div className="min-h-screen bg-ink-950 text-white font-tajawal flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-5"><Calculator size={30} /></div>
          <h1 className="text-2xl font-extrabold mb-2">تقريرك جاهز — باقي أرقامك</h1>
          <p className="text-gray-400 leading-relaxed mb-6">ما لقينا أرقامك على هذا الجهاز. أدخلها في الحاسبة (أقل من دقيقة) ونرجعك لتقريرك مباشرة — اشتراكك محفوظ وما يحتاج تدفع مرة ثانية.</p>
          <Link href="/calculator?next=report" className="btn-primary px-6 py-3.5 text-base">أدخل أرقامي وافتح التقرير</Link>
        </div>
      </div>
    )
  }

  if (!data || !m || loading || !report) {
    return <div className="min-h-screen bg-ink-950 text-white font-tajawal" dir="rtl"><LoadingReport /></div>
  }

  const { flow, sc, best, table, split, ext, ready: rd, id } = m
  const A = data.totalMonths
  const C = best.months
  const alreadyMillion = data.netWorth >= GOAL
  const today = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
  const blended = blendedReturn()
  const investMonthly = sc[1].monthly
  const emergencyGap = Math.max(0, flow.emergencyNeed - flow.cash)
  const fireNumber = Math.round(flow.E * 12 * 25)
  const fireMonths = fireNumber > data.netWorth && best.monthly > 0
    ? (() => { let w = data.netWorth, k = 0; const r = best.rate / 100 / 12; while (w < fireNumber && k < 1200) { w = w * (1 + r) + best.monthly; k++ } return k >= 1200 ? NEVER : k })()
    : 0
  const req = requiredMonthly(data.netWorth, calcRate, targetYears)
  const reqGap = req - Math.max(0, data.monthlySaving)
  const ideas = (report.income_ideas || []).slice(0, 6)
  const strengths = report.strengths || []
  const cushion = flow.E > 0 ? Math.floor(flow.cash / flow.E) : 0
  const risks = (report.risk_analysis || []).map((r, i) => i === 0
    ? { ...r, mitigation: `عندك كاش يغطي ${cushion} ${cushion === 1 ? 'شهر' : cushion === 2 ? 'شهرين' : 'شهور'} مصاريف — ${cushion >= 6 ? 'وضعك آمن' : 'الهدف 3 شهور كحد أدنى'}` }
    : r)
  const weaknesses = report.weaknesses || []

  const weekStep = emergencyGap > 0
    ? `افتح حساب ادخار منفصل اليوم، وفعّل تحويل تلقائي بمبلغ ${formatNumber(Math.max(500, data.monthlySaving))} ${SAR} يوم 27 من كل شهر. أول هدف: تكمّل صندوق الطوارئ (ناقصك ${formatNumber(emergencyGap)} ${SAR}).`
    : `افتح محفظة استثمارية عند وسيط مرخّص هالأسبوع، وحط أول دفعة ${formatNumber(investMonthly)} ${SAR} موزعة حسب القسم الثالث. وفعّل تحويل تلقائي يوم 27.`

  const zubda = [
    { t: `نسبة ادخارك ${flow.savingPct}٪`, s: flow.savingPct >= 20 ? 'فوق القاعدة الذهبية (20٪) — أساسك قوي' : `تحت القاعدة الذهبية (20٪) بـ${20 - flow.savingPct} نقاط — وهذا أسهل شي نصلحه` },
    { t: `تقدر تحرر ${formatNumber(flow.recovery)} ${SAR} بالشهر`, s: 'من مصاريف أوتوماتيكية ما تحس فيها — بدون تقشف' },
    alreadyMillion
      ? { t: 'المليون الأول خلفك ✅', s: 'الهدف الحين: حمايته وتنميته لين يغطي مصاريفك (رقم الاستقلال المالي)' }
      : { t: A >= NEVER ? `المسار المسرّع يوصلك خلال ${dur(C)}` : `${dur(A)} ← ${dur(C)}`, s: 'من وضعك الحالي إلى المسار المسرّع في هالتقرير' },
    { t: emergencyGap > 0 ? `صندوق الطوارئ ناقصه ${formatNumber(emergencyGap)} ${SAR}` : 'صندوق طوارئك مكتمل ✅', s: emergencyGap > 0 ? 'هذا أول شي نسكّره قبل أي استثمار' : 'تقدر توجّه كل فائضك للاستثمار مباشرة' },
    { t: split.gainsPct > 0 ? `${split.gainsPct}٪ من مليونك يجي من العائد المركب` : 'العائد المركب هو سلاحك الأكبر', s: 'يعني فلوسك تشتغل عنك — مو بس أنت اللي تشتغل' },
  ]

  const shareText = `💰 طلعت تقرير تسريع الثروة حقي — ${A < NEVER && C < A ? `اختصرت طريقي للمليون من ${yearsShort(A)} إلى ${yearsShort(C)}` : `خطتي للمليون الأول جاهزة`}.\nاحسب متى تصير مليونير:\nhttps://saudimillion.com/s/${data.totalMonths}`

  const quarter = (() => { const d = new Date(); return `${['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'][Math.floor(d.getMonth() / 3)]} ${d.getFullYear()}` })()
  const tier = rd.score >= 80 ? { label: 'جاهزية متقدمة', desc: 'طاقتك الادخارية تشكل أرضية صلبة للانتقال الفوري إلى مرحلة التراكم المضاعف.' }
    : rd.score >= 60 ? { label: 'جاهزية جيدة', desc: 'أساسك المالي جيد، وتحتاج تفعيل الاستثمار الآلي لتسريع التراكم.' }
    : rd.score >= 40 ? { label: 'جاهزية متوسطة', desc: 'ضبط التسريبات ورفع نسبة الادخار سينقلك سريعاً إلى مرحلة التراكم.' }
    : { label: 'مرحلة التأسيس', desc: 'البداية الصحيحة الآن: صندوق طوارئ، ميزانية منضبطة، ثم استثمار شهري ثابت.' }
  const APPENDIX = [
    { id: 'a-zubda', n: '01', title: 'الزبدة وخطوتك هالأسبوع', desc: 'أهم 5 نقاط وأول خطوة عملية' },
    { id: 'a-diag', n: '02', title: 'قراءة صريحة لوضعك', desc: 'نقاط القوة والضعف والمخاطر' },
    { id: 'a-budget', n: '03', title: 'الميزانية بند بند', desc: 'سقوف شهرية بالريال لكل بند' },
    { id: 'priorities', n: '04', title: 'سلّم الأولويات والديون', desc: 'وش تسوي أول، وحدود الأقساط' },
    { id: 'a-sens', n: '05', title: 'مصفوفة الحساسية', desc: 'كل مزيج ادخار وعائد + الحاسبة العكسية' },
    { id: 'risk', n: '06', title: 'اختبار الضغط والتضخم', desc: 'وش يصير لو صار شي غلط' },
    { id: 'protect', n: '07', title: 'الزكاة والتقاعد والحماية', desc: 'الأشياء اللي أغلب الخطط تنساها' },
    { id: 'a-ideas', n: '08', title: 'أفكار دخل مخصصة لك', desc: 'مبنية على أرقامك' },
    { id: 'platforms', n: '09', title: 'دليل الـ50 منصة وأداة', desc: 'متاجر، دفع، شحن، ذكاء اصطناعي' },
    { id: 'mind', n: '10', title: 'علم النفس المالي', desc: '6 فخاخ سلوكية وحلولها' },
    { id: 'a-month', n: '11', title: 'الشهر الأول أسبوع بأسبوع', desc: 'مع تذكير شهري في تقويمك' },
    { id: 'kpi', n: '12', title: 'لوحة المؤشرات', desc: '6 أرقام تراقبها كل 3 شهور' },
    { id: 'glossary', n: '13', title: 'المرجع', desc: 'قاموس المصطلحات، الأسئلة، والمصادر' },
  ]

  return (
    <div className="min-h-screen bg-ink-950 text-white font-tajawal" dir="rtl">
      <DossierHeader onPrint={() => window.print()} onPdf={() => downloadPDF()} busy={pdfBusy} progress={pdfProgress} />

      <main id="report-content" className="report-print max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-16 lg:space-y-24">
        <DossierHero id={id} quarter={quarter} A={A} C={C} score={rd.score} tier={tier}
          S={flow.S} E={flow.E} M={flow.M} expensePct={flow.expensePct} savingPct={flow.savingPct}
          cash={flow.cash} inv={flow.inv} inflationLossA={inflationLoss(A)} />
        <DossierBudget S={flow.S} E={flow.E} M={flow.M} expensePct={flow.expensePct} savingPct={flow.savingPct}
          recovery={flow.recovery} items={flow.items} target={flow.target} leaks={flow.leaks} />
        <DossierScenarios sc={sc} table={table} best={best} split={split} />
        <DossierAssets monthly={best.monthly} blended={blended} />
        <DossierProjects />
        <DossierUpsell />
        <DossierTools onTracker={() => downloadFile('متتبع-الثروة-saudimillion.csv', trackerCsv(data, best.monthly, best.rate), 'text/csv;charset=utf-8')}
          fire={{ expenses: flow.E, netWorth: data.netWorth, monthly: best.monthly, rate: best.rate }} />
        <DossierPlan emergencyNeed={flow.emergencyNeed} subs={flow.items[0].amount} excessCash={flow.excessCash} invMonthly={best.monthly} monthlySaving={data.monthlySaving} />
        <DossierClosing id={id} shareText={shareText} />

        {/* ═══════════════ الملحق ═══════════════ */}
        <TableOfContents items={APPENDIX} />

        {/* ═══ الزبدة ═══ */}
        <section id="a-zubda" data-pdf-break className="grid lg:grid-cols-[1fr_1.1fr] gap-5 scroll-mt-24">
          <div className="rounded-3xl border border-amber-400/30 p-6 lg:p-8 flex flex-col"
            style={{ background: 'linear-gradient(160deg, rgba(245,158,11,0.14), rgba(245,158,11,0.03) 60%), #1A212B' }}>
            <span className="chip bg-amber-400 text-ink-950 w-fit mb-4"><Zap size={13} />ابدأ من هنا</span>
            <h2 className="text-2xl font-extrabold mb-3">خطوتك هالأسبوع</h2>
            <p className="text-base lg:text-lg text-white/90 leading-loose font-bold">{weekStep}</p>
            <p className="text-xs text-gray-400 mt-auto pt-5">↓ باقي التقرير يشرح لك ليش، وكم بتوفر، وش الخطوة اللي بعدها.</p>
          </div>
          <div className="card p-6 lg:p-8">
            <h2 className="text-xl font-extrabold mb-5 flex items-center gap-2"><Sparkles size={20} className="text-amber-400" />الزبدة — أهم 5 نقاط بتقريرك</h2>
            <ol className="space-y-3">
              {zubda.map((z, i) => (
                <li key={i} className="flex items-start gap-3 card-soft p-3.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-300 text-sm font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div><p className="font-extrabold text-[15px]">{z.t}</p><p className="text-xs text-gray-400 mt-0.5">{z.s}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ قراءة صريحة ═══ */}
        <section id="a-diag" data-pdf-break className="scroll-mt-24">
          <SectionHead icon={Brain} kicker="تشخيصك" title="قراءة صريحة لوضعك المالي" sub="بدون مجاملة وبدون تخويف — وين أنت قوي، ووين تحتاج تشتغل." />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="card p-6 lg:col-span-2">
              {report.reality_check && <p className="text-base text-gray-200 leading-loose mb-4">{report.reality_check}</p>}
              {report.diagnosis && <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100 font-bold leading-relaxed mb-5">🎯 {report.diagnosis}</p>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-extrabold text-emerald-400 mb-2.5">💪 نقاط قوتك</p>
                  <div className="space-y-2.5">
                    {strengths.map((s, i) => (
                      <div key={i} className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3.5">
                        <p className="text-sm font-extrabold mb-1">{s.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-amber-300 mb-2.5">🔧 وش تحتاج تصلح</p>
                  <div className="space-y-2.5">
                    {weaknesses.map((w, i) => (
                      <div key={i} className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3.5">
                        <p className="text-sm font-extrabold mb-1">{w.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed"><b className="text-amber-300">الحل: </b>{w.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {report.money_personality && (
                <div className="card p-6">
                  <p className="text-xs text-gray-400 font-bold mb-1">شخصيتك المالية</p>
                  <p className="text-2xl font-extrabold text-amber-300 mb-2">{report.money_personality.type}</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">{report.money_personality.desc}</p>
                  <p className="text-xs rounded-lg bg-white/[0.04] p-3 text-gray-200 leading-relaxed">💡 {report.money_personality.advice}</p>
                </div>
              )}
              {!alreadyMillion && report.daily_cost ? (
                <div className="card p-6">
                  <p className="text-xs text-gray-400 font-bold mb-2 flex items-center gap-1.5"><Coffee size={14} />المليون بلغة يومية</p>
                  <p className="text-3xl font-extrabold tabular-nums text-emerald-400">{formatNumber(report.daily_cost)} <span className="text-sm text-gray-400">{SAR} باليوم</span></p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">هذا اللي تحتاج "تحطه جانب" كل يوم على وضعك الحالي عشان توصل. أقل من وجبة غدا.</p>
                </div>
              ) : null}
              {risks.length > 0 && (
                <div className="card p-6">
                  <p className="text-sm font-extrabold mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-red-400" />المخاطر وكيف تحمي نفسك</p>
                  <div className="space-y-3">
                    {risks.map((r, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold flex items-center gap-2">{r.risk}<span className={`text-[10px] px-2 py-0.5 rounded-full ${r.impact === 'عالي' ? 'bg-red-400/15 text-red-300' : 'bg-amber-400/15 text-amber-300'}`}>{r.impact}</span></p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="a-budget" data-pdf-break className="scroll-mt-24">
          <SectionHead icon={Wallet} kicker="ملحق: الميزانية التفصيلية" title="ميزانيتك الشهرية بند بند"
            sub="ترجمة النموذج الذهبي إلى سقوف شهرية بالريال لكل بند من مصاريفك." />
          <BudgetDetail lines={ext.budget} S={flow.S} />
        </section>

        <PrioritiesAndDebt steps={ext.steps} debt={ext.debt} S={flow.S} />

        <section id="a-sens" data-pdf-break className="scroll-mt-24">
          <SectionHead icon={Target} tone="green" kicker="ملحق: مصفوفة الحساسية" title="كل مزيج ادخار وعائد — ومتى يوصلك"
            sub="جرّب بعينك: وش يصير لو زدت ادخارك، أو لو تغيّر العائد." />
          <SensitivityGrid grid={ext.grid} userRate={data.rate} bestExtra={best.monthly - Math.max(0, data.monthlySaving)} bestRate={best.rate} />
          <div className="h-5" />
          {/* الحاسبة العكسية */}
          <div className="card p-5 lg:p-7 grid lg:grid-cols-[1fr_1fr] gap-6 items-center">
            <div>
              <h3 className="text-lg font-extrabold mb-1 flex items-center gap-2"><Target size={18} className="text-amber-400" />الحاسبة العكسية: حدد متى تبي توصل</h3>
              <p className="text-sm text-gray-400 mb-5">حرّك المؤشر ونقولك كم لازم تستثمر بالشهر.</p>
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">أبي أوصل خلال</span><span className="font-extrabold text-amber-300">{targetYears} سنة</span></div>
              <input type="range" min={3} max={25} value={targetYears} onChange={(e) => setTargetYears(Number(e.target.value))}
                className="range w-full mb-5" style={{ ['--fill' as string]: `${((targetYears - 3) / 22) * 100}%` } as React.CSSProperties} aria-label="عدد السنوات" />
              <p className="text-sm text-gray-400 mb-2">بعائد سنوي</p>
              <div className="flex gap-2">
                {[4, 7, 9].map((r) => (
                  <button key={r} onClick={() => setCalcRate(r)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${calcRate === r ? 'bg-amber-400 text-ink-950 border-amber-400' : 'border-white/10 text-gray-300'}`}>
                    {r}٪ {r === 4 ? 'ادخار' : r === 7 ? 'متوازن' : 'نمو'}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-ink-950/60 border border-white/[0.06] p-6 text-center">
              <p className="text-sm text-gray-400 mb-1">تحتاج تستثمر شهرياً</p>
              <p className="text-4xl font-extrabold text-amber-grad tabular-nums mb-2">{formatNumber(req)} <span className="text-base">{SAR}</span></p>
              {alreadyMillion ? <p className="text-sm text-emerald-400 font-bold">أنت فعلاً فوق المليون 🎉</p>
                : reqGap > 0 ? <p className="text-sm text-gray-300">يعني <b className="text-amber-300 tabular-nums">{formatNumber(reqGap)} {SAR}</b> فوق ادخارك الحالي — قناة دخل جانبية تسد جزء كبير منها.</p>
                : <p className="text-sm text-emerald-400 font-bold">ادخارك الحالي يكفي — بس لازم يتحول من ادخار إلى استثمار.</p>}
            </div>
          </div>
        </section>

        <TimeAndRisk delay={ext.delay} doubleYears={rule72(best.rate)} rate={best.rate} stress={ext.stress} inflation={ext.infl} base={best.months} smt={ext.smt} netWorth={data.netWorth} />

        <ZakatRetirementProtection zakat={ext.zakat} S={flow.S} />

        {ideas.length > 0 && (
          <section id="a-ideas" data-pdf-break className="scroll-mt-24">
            <SectionHead icon={Rocket} kicker="ملحق: أفكار دخل مخصصة" title="أفكار دخل إضافية تناسب وضعك"
              sub="أفكار عملية تقدر تبدأها جنب وظيفتك برأس مال صغير — مع أول خطوة لكل وحدة."
              side={<SideTag icon={Target} tone="green">الهدف: +{formatNumber(SIDE_INCOME)} {SAR} بالشهر تنضاف لمحفظتك</SideTag>} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, i) => {
                const steps = (idea.how_to_start || '').split('\n').map((s) => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean).slice(0, 4)
                const easy = /سهل/.test(idea.difficulty)
                return (
                  <div key={i} className={`rounded-3xl p-5 flex flex-col border ${i === 0 ? 'border-amber-400/30 bg-ink-800' : easy ? 'border-emerald-400/15 bg-ink-800' : 'card'}`}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`chip ${i === 0 ? 'bg-amber-400/15 text-amber-300' : easy ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/[0.05] text-gray-300'}`}>{i === 0 ? '🔥 أنسب بداية لك' : idea.difficulty}</span>
                      <Lightbulb size={16} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-extrabold mb-2 leading-snug">{idea.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-5">{idea.description}</p>
                    <div className="rounded-xl bg-ink-950/60 border border-white/[0.06] p-3 mb-4 text-xs space-y-1.5">
                      <div className="flex justify-between gap-2"><span className="text-gray-400">العائد المتوقع</span><b className="text-emerald-400 text-left">{idea.potential}</b></div>
                      <div className="flex justify-between gap-2"><span className="text-gray-400">الصعوبة</span><b>{idea.difficulty}</b></div>
                    </div>
                    {steps.length > 0 && (
                      <div className="mt-auto pt-3 border-t border-white/[0.06]">
                        <p className="text-xs font-extrabold text-amber-300 mb-2">خطة الانطلاق:</p>
                        <ol className="space-y-1 text-xs text-gray-300">
                          {steps.map((s, j) => <li key={j} className="leading-relaxed">{j + 1}. {s}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </section>
        )}

        <PlatformsGuide />

        <MoneyPsychology />

        <section id="a-month" data-pdf-break className="scroll-mt-24">
          <SectionHead icon={CalendarDays} tone="green" kicker="ملحق: الشهر الأول" title="الشهر الأول أسبوع بأسبوع"
            sub="تفصيل أدق للمرحلة الأولى من خطة الـ90 يوماً، مع تذكير شهري يثبّت العادة." />
          <div className="card p-5 lg:p-6 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-extrabold mb-1 flex items-center gap-2"><BellRing size={18} className="text-amber-400" />تذكير "يوم المليون" الشهري</p>
              <p className="text-sm text-gray-400">تذكير يتكرر يوم 27 من كل شهر في تقويم جوالك: "حوّل {formatNumber(best.monthly)} {SAR} قبل لا تصرف".</p>
            </div>
            <button onClick={() => downloadFile('تذكير-يوم-المليون.ics', reminderIcs(best.monthly), 'text/calendar;charset=utf-8')}
              className="no-print shrink-0 px-5 py-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] text-amber-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400/10 transition-colors">
              <CalendarDays size={16} /> أضفه لتقويمي
            </button>
          </div>
          {report.monthly_plan && report.monthly_plan.length > 0 && (
            <div className="card p-5 lg:p-7">
              <h3 className="text-lg font-extrabold mb-4">المهام الأسبوعية</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {report.monthly_plan.map((w, i) => (
                  <div key={i} className="card-soft p-4">
                    <p className="text-xs font-extrabold text-amber-300 mb-1.5">{w.week}</p>
                    <p className="text-sm font-bold mb-1.5 leading-relaxed">{w.task}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{w.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ═══ عقلية المليون ═══ */}
        {report.mindset_tips && report.mindset_tips.length > 0 && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.mindset_tips.map((t, i) => (
              <div key={i} className="card-soft p-4 text-sm text-gray-200 leading-relaxed font-bold"><span className="text-amber-400 ml-1">❝</span>{t}</div>
            ))}
          </section>
        )}

        <KpiReview items={ext.kpi} />

        <GlossaryFaqSources />

        <DossierFooter />
      </main>
    </div>
  )
}
