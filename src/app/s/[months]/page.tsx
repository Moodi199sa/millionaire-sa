import type { Metadata } from 'next'
import Link from 'next/link'
import { monthsToLabel } from '@/lib/calculator'

// صفحة هبوط للمشاركة: الرابط المشارك يحمل نتيجة الشخص (عدد الأشهر)،
// و generateMetadata يضبط صورة OG الديناميكية عشان تطلع البطاقة بنتيجته في تويتر.
export async function generateMetadata(
  { params }: { params: { months: string } }
): Promise<Metadata> {
  const m = parseInt(params.months, 10)
  const valid = Number.isFinite(m) && m > 0
  const label = valid ? monthsToLabel(m) : 'احسب متى تصير مليونير'
  const title = valid ? `أنا بكون مليونير خلال ${label} 🔥` : 'متى تصير مليونير؟ 🔥'
  const description = 'وأنت؟ احسب خلال 30 ثانية متى بتصير مليونير — وتحدَّ أصدقائك.'
  const ogImage = `/api/og?m=${valid ? m : 0}`

  return {
    title,
    description,
    openGraph: {
      title, description, type: 'website', locale: 'ar_SA',
      siteName: 'متى تصير مليونير؟',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  }
}

export default function SharePage({ params }: { params: { months: string } }) {
  const m = parseInt(params.months, 10)
  const valid = Number.isFinite(m) && m > 0
  const label = valid ? monthsToLabel(m) : null

  return (
    <main dir="rtl" className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'radial-gradient(circle at 50% 25%, #12203a 0%, #0a0f1c 60%, #070b14 100%)' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(212,160,23,0.15)', border: '3px solid #D4A017', color: '#D4A017', fontSize: 40, fontWeight: 800 }}>
        $
      </div>
      <h1 className="text-white text-2xl font-extrabold mb-2">تحدي المليونير 🔥</h1>
      {valid ? (
        <>
          <p className="text-gray-400 mb-1">صديقك يتحدّاك — هو بيصير مليونير خلال</p>
          <p className="text-4xl font-extrabold mb-6" style={{ color: '#D4A017' }}>{label}</p>
        </>
      ) : (
        <p className="text-gray-400 mb-6">احسب خلال 30 ثانية متى بتصل لأول مليون</p>
      )}
      <p className="text-white font-bold mb-4">وأنت؟ متى بتصير مليونير؟</p>
      <Link href="/"
        className="px-8 py-4 rounded-2xl font-extrabold text-lg"
        style={{ background: '#D4A017', color: '#0a0f1c' }}>
        احسب نتيجتي الآن ←
      </Link>
    </main>
  )
}
