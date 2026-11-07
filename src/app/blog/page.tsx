import type { Metadata } from 'next'
import Link from 'next/link'
import SiteShell from '@/components/site/SiteShell'

export const metadata: Metadata = {
  title: 'كيف تصير مليونير في السعودية | دليل شامل 2025',
  description: 'تعرف على أفضل طرق الادخار والاستثمار في السعودية وكيف تصل لأول مليون ريال بخطوات عملية.',
  keywords: 'كيف تصير مليونير, ادخار المال, استثمار في السعودية, طرق زيادة الدخل, حرية مالية',
}

const articles = [
  {
    title: 'كيف توفر 1000 ريال إضافي كل شهر',
    desc: '10 طرق عملية لتوفير المال دون التأثير على جودة حياتك',
    slug: 'save-1000-riyal',
    tag: 'ادخار',
    readTime: '5 دقائق',
  },
  {
    title: 'أفضل طرق الاستثمار في السعودية 2025',
    desc: 'مقارنة بين الأسهم، الصناديق، العقارات، والودائع — أيها يناسبك؟',
    slug: 'best-investments-saudi',
    tag: 'استثمار',
    readTime: '7 دقائق',
  },
  {
    title: 'كيف تبدأ مشروعاً جانبياً براتب محدود',
    desc: '6 أفكار مشاريع ناجحة تقدر تبدأها بأقل من 1000 ريال',
    slug: 'side-business-limited-budget',
    tag: 'مشاريع',
    readTime: '6 دقائق',
  },
  {
    title: 'الفرق بين الادخار والاستثمار — أيهما أولاً؟',
    desc: 'كيف تتخذ القرار الصح في توزيع فلوسك بين الادخار والاستثمار',
    slug: 'saving-vs-investing',
    tag: 'تخطيط',
    readTime: '4 دقائق',
  },
  {
    title: 'حاسبة الحرية المالية FIRE للسعوديين',
    desc: 'كيف تحقق الاستقلال المالي وتتقاعد مبكراً في السعودية',
    slug: 'fire-calculator-saudi',
    tag: 'حرية مالية',
    readTime: '8 دقائق',
  },
  {
    title: 'أخطاء مالية يرتكبها 90% من الشباب السعودي',
    desc: 'تعرف على أبرز الأخطاء المالية وكيف تتجنبها قبل فوات الأوان',
    slug: 'financial-mistakes-youth',
    tag: 'نصائح',
    readTime: '5 دقائق',
  },
]

const tagColors: Record<string, string> = {
  'ادخار': 'text-blue-400 bg-blue-400/10',
  'استثمار': 'text-green-400 bg-green-400/10',
  'مشاريع': 'text-gold bg-gold/10',
  'تخطيط': 'text-purple-400 bg-purple-400/10',
  'حرية مالية': 'text-pink-400 bg-pink-400/10',
  'نصائح': 'text-orange-400 bg-orange-400/10',
}

export default function BlogPage() {
  return (
    <SiteShell>
      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-10 lg:py-14">
        <p className="text-sm font-extrabold text-amber-400 mb-2">مدونة الثراء</p>
        <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">مقالات عملية تقرّبك من المليون</h1>
        <p className="text-gray-400 mb-10">ادخار، استثمار، ودخل إضافي — بالسعودي وبدون تعقيد.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {articles.map((article, i) => (
            <div key={i} className="card p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${tagColors[article.tag]}`}>{article.tag}</span>
                <span className="text-xs text-gray-500">{article.readTime}</span>
              </div>
              <h2 className="text-lg font-extrabold mb-2">{article.title}</h2>
              <p className="text-sm text-gray-400 flex-1">{article.desc}</p>
              <p className="text-xs text-amber-400/80 mt-4 font-bold">قريباً 🔜</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-amber-400/25 p-8 text-center" style={{ background: 'linear-gradient(135deg,#2A2418 0%,#1A212B 70%)' }}>
          <h3 className="text-2xl font-extrabold mb-2">تحدّ أصدقائك الحين!</h3>
          <p className="text-gray-400 mb-6">30 ثانية بس — ومجاني</p>
          <Link href="/calculator" className="btn-primary px-8 py-3.5">ابدأ الحساب 🚀</Link>
        </div>
      </main>
    </SiteShell>
  )
}
