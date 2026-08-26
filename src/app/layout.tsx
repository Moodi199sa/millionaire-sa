import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'متى تصير مليونير؟ — تحدي للمشاركة',
  description: 'احسب خلال 30 ثانية متى ستصل لأول مليون ريال. أداة مجانية للتخطيط المالي الشخصي في السعودية.',
  keywords: 'مليونير, ادخار, استثمار, حاسبة مالية, ثروة, ريال سعودي, تخطيط مالي, حرية مالية, كيف اوفر المال, كيف تصير مليونير',
  authors: [{ name: 'متى تصير مليونير؟' }],
  robots: 'index, follow',
  openGraph: {
    title: 'متى تصير مليونير؟ 🔥',
    description: 'احسب خلال 30 ثانية متى ستصل لأول مليون ريال — أداة مجانية',
    url: 'https://www.saudimillion.com',
    siteName: 'متى تصير مليونير؟',
    locale: 'ar_SA',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'متى تصير مليونير؟ 🔥',
    description: 'احسب خلال 30 ثانية متى ستصل لأول مليون ريال',
    images: ['/og-image.png'],
  },
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
  metadataBase: new URL('https://www.saudimillion.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // فريق تحليل البيانات: اكتُشف أن معرّفات Google Analytics وTikTok Pixel كانت
  // قيماً وهمية ثابتة بالكود (G-XXXXXXXXXX, CXXXXXXXXXXXXXXXXXX) — يعني الموقع
  // كان يحمّل سكريبتات كاملة (تكلفة أداء حقيقية) لكن صفر بيانات حقيقية تُسجَّل
  // أبداً، لأن كلتا الخدمتين ترفضان أي حدث بمعرّف غير صالح. الحل: قراءة المعرّفات
  // من متغيرات البيئة، والتحميل الشرطي فقط عند وجود قيمة حقيقية مُعدَّة فعلياً.
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

  return (
    <html lang="ar" dir="rtl">
      <head>
        {gaId && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        {tiktokPixelId && (
          <Script id="tiktok-pixel">
            {`
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
                e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `}
          </Script>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
