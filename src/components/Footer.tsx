import Link from 'next/link'
import { ChevronLeft, Lock, ShieldCheck } from 'lucide-react'

// فوتر الموقع الموحّد — 4 أعمدة على الكمبيوتر، مكدّس على الجوال
export default function Footer() {
  const tools = [
    { href: '/calculator', label: 'حاسبة المليون الأول التفاعلية' },
    { href: '/result', label: 'خارطة طريق تراكم الثروة' },
    { href: '/checkout', label: 'تقرير تسريع الثروة الشامل' },
    { href: '/ideas-checkout', label: 'دليل 100 فكرة مشروع' },
  ]
  const legal = [
    { href: '/privacy', label: 'سياسة الخصوصية' },
    { href: '/terms', label: 'الشروط والأحكام' },
    { href: '/blog', label: 'مدونة الثراء' },
    { href: 'mailto:support@amerniksa.com', label: 'تواصل معنا' },
  ]

  return (
    <footer className="bg-ink-950 border-t border-white/[0.06] mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <p className="text-lg font-extrabold text-white mb-3">متى تصير <span className="text-amber-400">مليونير؟</span> 💰</p>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            أداة عربية مجانية تحسب لك متى توصل لأول مليون ريال، وتوريك وش أسرع الحركات اللي تختصر عليك الطريق.
          </p>
          <p className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> حساباتك تتم على جهازك
          </p>
        </div>

        <FooterCol title="أدوات التخطيط" links={tools} />
        <FooterCol title="روابط مهمة" links={legal} />

        <div>
          <p className="font-extrabold text-white mb-4">الدفع الآمن</p>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">المدفوعات تتم عبر بوابة Paymob، وما نحفظ بيانات بطاقتك عندنا.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['مدى', 'VISA', 'Mastercard', 'Apple Pay', 'Paymob'].map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-lg bg-ink-800 border border-white/[0.06] text-xs font-bold text-gray-200">{m}</span>
            ))}
          </div>
          <p className="inline-flex items-center gap-2 text-xs text-gray-400 bg-ink-800 border border-white/[0.06] rounded-lg px-3 py-2">
            <Lock size={13} className="text-emerald-400" /> اتصال مشفّر بالكامل (HTTPS)
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} متى تصير مليونير؟ — جميع الحقوق محفوظة</p>
          <p className="flex items-center gap-1.5"><ShieldCheck size={13} /> النتائج تقديرية للتوعية وليست استشارة مالية</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-extrabold text-white mb-4">{title}</p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors">
              <ChevronLeft size={14} className="text-amber-500/70" /> {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
