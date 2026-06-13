import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | متى تصير مليونير؟',
  description: 'سياسة الخصوصية وحماية البيانات لموقع متى تصير مليونير؟',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link href="/" className="text-gold text-sm hover:underline mb-8 block">
          ← العودة للرئيسية
        </Link>

        <h1 className="text-2xl font-extrabold mb-2">سياسة الخصوصية</h1>
        <p className="text-gray-400 text-sm mb-8">آخر تحديث: يناير 2025</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. المعلومات التي نجمعها</h2>
            <p className="mb-2">نجمع النوعين التاليين من المعلومات:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>البيانات المالية التي تدخلها (الراتب، المصروف، المدخرات) — وهي مؤقتة وتختفي بعد إغلاق المتصفح</li>
              <li>البريد الإلكتروني — فقط عند شراء التقرير المدفوع</li>
              <li>بيانات الاستخدام عبر Google Analytics (مجهولة الهوية)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>تقديم التقرير المالي المخصص</li>
              <li>إرسال نصائح مالية أسبوعية (يمكنك إلغاء الاشتراك في أي وقت)</li>
              <li>تحسين تجربة الموقع</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. حماية البيانات</h2>
            <p>نحن لا نخزن بياناتك المالية على خوادمنا. جميع الحسابات تتم في متصفحك مباشرة. البريد الإلكتروني يُخزن بشكل آمن ومشفر ولا يُشارك مع أي طرف ثالث.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. ملفات الارتباط (Cookies)</h2>
            <p>نستخدم ملفات الارتباط لتحسين تجربتك فقط، مثل تذكر تفضيلاتك. لا نستخدمها لأغراض إعلانية.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. حقوقك</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>طلب حذف بياناتك في أي وقت</li>
              <li>إلغاء الاشتراك في الرسائل البريدية</li>
              <li>الاطلاع على البيانات المخزنة عنك</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. التواصل</h2>
            <p>لأي استفسار متعلق بالخصوصية: <a href="mailto:hello@millionaire-sa.com" className="text-gold hover:underline">hello@millionaire-sa.com</a></p>
          </section>

        </div>

      </div>
    </main>
  )
}
