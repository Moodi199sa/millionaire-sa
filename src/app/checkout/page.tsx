'use client'

import { BarChart3, Target, Lightbulb, CalendarCheck, FileBarChart } from 'lucide-react'
import SiteShell from '@/components/site/SiteShell'
import ProductCheckout, { PreviewPages } from '@/components/site/ProductCheckout'

// صفحة شراء التقرير — دفع حقيقي عبر Paymob (بدل صفحة "مجاني لفترة الإطلاق" القديمة
// اللي كانت ترجّع المستخدم لنفسها بسبب حارس الوصول في صفحة التقرير).
export default function CheckoutPage() {
  return (
    <SiteShell>
      <ProductCheckout
        product="report"
        price={9}
        requiresData
        badge="التقرير الشامل"
        productName="تقرير تسريع الثروة الشامل"
        title={<>تقرير تسريع الثروة <span className="text-amber-grad">الشامل</span></>}
        subtitle="تحليل مخصص لأرقامك أنت: يقارن السيناريوهات، يشخّص وضعك المالي، ويعطيك خطة أسبوعية واضحة توصلك للمليون أسرع."
        preview={<PreviewPages icon={BarChart3} accent="#F59E0B" lines={['الزبدة: ملخص وضعك', 'درجة جاهزيتك المالية', 'مقارنة 5 سيناريوهات', 'خطتك الأسبوعية']} />}
        features={[
          { icon: Target, title: 'مقارنة السيناريوهات', desc: 'زيادة الادخار، دخل إضافي، رفع العائد — وكم توفّر عليك كل حركة.' },
          { icon: FileBarChart, title: 'تشخيص وجاهزية', desc: 'درجة جاهزيتك المالية، نقاط قوتك وضعفك، وتشخيص واضح لوضعك.' },
          { icon: Lightbulb, title: 'أفكار دخل إضافي', desc: 'أفكار عملية تناسب وضعك تزيد دخلك الشهري.' },
          { icon: CalendarCheck, title: 'خطة أسبوعية وأهداف', desc: 'خطوات تبدأ فيها بكرة، وأهداف واضحة توصلك للمليون.' },
        ]}
        faqs={[
          { q: 'متى وكيف أستلم التقرير؟', a: 'فور ما يتأكد الدفع نحوّلك لتقريرك مباشرة، ويتجهز خلال ثواني على أرقامك. تقدر تطبعه أو تحفظه PDF.' },
          { q: 'هل التقرير مخصص لي أو نموذج عام؟', a: 'مخصص لأرقامك اللي دخلتها في الحاسبة: راتبك، مصروفك، مدخراتك، ونوع استثمارك.' },
          { q: 'هل يتجدد الدفع أو فيه اشتراك؟', a: 'لا، دفعة وحدة بس بـ 9 ريال، بدون أي اشتراك.' },
        ]}
      />
    </SiteShell>
  )
}
