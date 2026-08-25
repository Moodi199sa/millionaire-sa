import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'متى تصير مليونير؟ — تحدي للمشاركة',
  description: 'أجب على 4 أسئلة بسيطة واعرف متى ستصل لأول مليون ريال. تحدّ أصدقائك!',
  keywords: 'مليونير, ادخار, استثمار, حاسبة مالية, ثروة, ريال سعودي',
  openGraph: {
    title: 'متى تصير مليونير؟ 💰',
    description: 'احسب خلال دقيقة متى ستصل لأول مليون ريال',
    url: 'https://saudimillion.com',
    siteName: 'متى تصير مليونير؟',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'متى تصير مليونير؟ 💰',
    description: 'احسب خلال دقيقة متى ستصل لأول مليون ريال',
  },
  metadataBase: new URL('https://saudimillion.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
