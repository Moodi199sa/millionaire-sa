// عناصر واجهة مشتركة لصفحة التقرير
export function SectionHead({ icon: Icon, kicker, title, sub, side, tone = 'amber' }: {
  icon: React.ElementType; kicker: string; title: string; sub: string; side?: React.ReactNode; tone?: 'amber' | 'green'
}) {
  const chipCls = tone === 'green'
    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
    : 'bg-amber-400/10 text-amber-300 border-amber-400/25'
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
      <div>
        <span className={`chip border mb-3 ${chipCls}`}><Icon size={13} />{kicker}</span>
        <h2 className="text-2xl lg:text-[34px] font-extrabold leading-tight mb-1.5">{title}</h2>
        <p className="text-sm lg:text-base text-gray-400">{sub}</p>
      </div>
      {side && <div className="shrink-0">{side}</div>}
    </div>
  )
}

export function SideTag({ icon: Icon, children, tone = 'green' }: { icon: React.ElementType; children: React.ReactNode; tone?: 'green' | 'amber' | 'gray' }) {
  const cls = tone === 'green' ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300'
    : tone === 'amber' ? 'border-amber-400/25 bg-amber-400/[0.06] text-amber-200' : 'border-white/10 bg-white/[0.03] text-gray-300'
  return <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs lg:text-sm font-bold ${cls}`}><Icon size={16} className="shrink-0" /><span>{children}</span></div>
}

export function Num({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`tabular-nums ${className}`} dir="ltr">{children}</span>
}

// صندوق "الخلاصة العملية" في آخر كل قسم
export function Takeaway({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4 lg:p-5 flex items-start gap-3">
      <span className="text-lg leading-none">📌</span>
      <div className="text-sm text-gray-200 leading-relaxed"><b className="text-amber-300">الخلاصة العملية: </b>{children}</div>
    </div>
  )
}
