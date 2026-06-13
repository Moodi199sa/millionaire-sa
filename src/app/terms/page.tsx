import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'الشروط والأحكام | متى تصير مليونير؟',
  description: 'الشروط والأحكام لاستخدام موقع متى تصير مليونير؟',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link href="/" className="text-gold text-sm hover:underline mb-8 block">
          ← العودة للرئيسية
        </Link>

        <h1 className="text-2xl font-extrabold mb-2">الشروط والأحكام</h1>
        <p className="text-gray-400 text-sm mb-8">آخر تحديث: يناير 2025</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. قبول الشروط</h2>
            <p>باستخدام موقع "متى تصير مليونير؟"، فأنت توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام الموقع.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. طبيعة الخدمة</h2>
            <p className="mb-2">الموقع يقدم أداة تعليمية وتوعوية للتخطيط المالي الشخصي. <strong className="text-white">النتائج تقديرية وليست استشارة مالية.</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>الحسابات مبنية على افتراضات ثبات الأرقام المدخلة</li>
              <li>النتائج الفعلية قد تختلف بناءً على ظروف متعددة</li>
              <li>لا نتحمل مسؤولية أي قرارات مالية مبنية على نتائج الموقع</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. التقارير المدفوعة</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>التقارير تُولَّد بالذكاء الاصطناعي وتعتمد على البيانات المدخلة</li>
              <li>سياسة الاسترداد: 24 ساعة من وقت الشراء بدون أسئلة</li>
              <li>التقارير للاستخدام الشخصي فقط وغير قابلة للبيع أو التوزيع</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. الاشتراك الشهري</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>يمكن إلغاء الاشتراك في أي وقت قبل تاريخ التجديد</li>
              <li>لا يوجد استرداد للفترة الحالية بعد التجديد</li>
              <li>ضمان استرداد 7 أيام للاشتراك الأول فقط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. الملكية الفكرية</h2>
            <p>جميع محتويات الموقع محمية بحقوق النشر. لا يجوز نسخ أو إعادة نشر المحتوى دون إذن كتابي مسبق.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. تعديل الشروط</h2>
            <p>نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين المسجلين عبر البريد الإلكتروني بأي تغييرات جوهرية.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. التواصل</h2>
            <p>لأي استفسار: <a href="mailto:hello@millionaire-sa.com" className="text-gold hover:underline">hello@millionaire-sa.com</a></p>
          </section>

        </div>

      </div>
    </main>
  )
}
