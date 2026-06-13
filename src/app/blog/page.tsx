import type { Metadata } from 'next'
import Link from 'next/link'

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
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Nav */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="text-gold font-extrabold text-lg">💰 متى تصير مليونير؟</Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← الرئيسية</Link>
        </div>

        <h1 className="text-2xl font-extrabold mb-2">📚 مدونة الثروة الشخصية</h1>
        <p className="text-gray-400 text-sm mb-8">مقالات عملية لمساعدتك على الوصول للمليون أسرع</p>

        {/* Articles */}
        <div className="space-y-4 mb-10">
          {articles.map((article, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-gold/30 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${tagColors[article.tag]}`}>
                  {article.tag}
                </span>
                <span className="text-xs text-gray-500">{article.readTime}</span>
              </div>
              <h2 className="text-base font-bold mb-2">{article.title}</h2>
              <p className="text-sm text-gray-400">{article.desc}</p>
              <p className="text-xs text-gold mt-3 font-bold">اقرأ المقال ←</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-extrabold mb-2">تحدّ أصدقائك الحين!</h3>
          <p className="text-gray-400 text-sm mb-4">30 ثانية فقط — مجاناً</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gold hover:bg-yellow-600 text-white font-bold rounded-xl transition-all"
          >
            ابدأ الحساب 🚀
          </Link>
        </div>

      </div>
    </main>
  )
}
