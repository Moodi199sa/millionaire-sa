import SiteHeader from './SiteHeader'
import Footer from '@/components/Footer'

// غلاف موحّد لصفحات الموقع: هيدر + محتوى + فوتر
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900 text-white font-tajawal flex flex-col" dir="rtl">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
