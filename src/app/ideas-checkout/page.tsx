'use client'

import { Lightbulb, Wallet, Rocket, Filter, RefreshCw } from 'lucide-react'
import SiteShell from '@/components/site/SiteShell'
import ProductCheckout, { PreviewPages } from '@/components/site/ProductCheckout'

export default function IdeasCheckout() {
  return (
    <SiteShell>
      <ProductCheckout
        product="ideas"
        price={49}
        badge="دليل الأفكار"
        productName="دليل 100 فكرة مشروع"
        title={<>دليل <span className="text-amber-grad">100 فكرة مشروع</span></>}
        subtitle="محدّث بأحدث فرص السوق السعودي 2026 — أفكار عملية مع خطوات تنفيذ، تساعدك تزيد دخلك وتقرّب موعد مليونك."
        preview={<PreviewPages icon={Lightbulb} accent="#34D399" lines={['100 فكرة مع خطوات تنفيذ', 'رأس المال والربح لكل فكرة', 'خطة اليوم الأول', 'فلترة حسب رأس المال']} />}
        features={[
          { icon: Rocket, title: '100 فكرة مشروع', desc: 'كل فكرة معها خطوات تنفيذية واضحة.' },
          { icon: Wallet, title: 'رأس المال والربح', desc: 'تحليل رأس المال المطلوب والربح المتوقع لكل فكرة.' },
          { icon: Filter, title: 'فلترة ذكية', desc: 'فلترة حسب رأس المال والتصنيف عشان تلقى اللي يناسبك.' },
          { icon: RefreshCw, title: 'تحديث مستمر', desc: 'الدليل يتحدّث بأحدث الفرص.' },
        ]}
        faqs={[
          { q: 'متى أستلم الدليل؟', a: 'فور تأكيد الدفع نحوّلك للدليل مباشرة.' },
          { q: 'هل يناسبني لو رأس مالي صغير؟', a: 'إيه، تقدر تفلتر الأفكار حسب رأس المال وتبدأ باللي يناسبك.' },
          { q: 'هل فيه اشتراك؟', a: 'لا، دفعة وحدة بـ 49 ريال.' },
        ]}
      />
    </SiteShell>
  )
}
