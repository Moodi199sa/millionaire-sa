'use client'

import { useRouter } from 'next/navigation'

const testimonials = [
  {
    name: 'محمد العتيبي',
    job: 'موظف حكومي - الرياض',
    text: 'كنت أحسب إن المليون مستحيل براتبي. الموقع فتح عيني — اكتشفت إني أقدر أوصل خلال 11 سنة لو غيرت شي بسيط في مصاريفي.',
    years: '11 سنة',
    avatar: 'م',
    color: 'bg-blue-500',
  },
  {
    name: 'سارة الدوسري',
    job: 'معلمة - جدة',
    text: 'التقرير خلاني أشوف وين تروح فلوسي. بدأت أوفر 800 ريال إضافي كل شهر بعد ما طبقت النصايح.',
    years: '9 سنوات',
    avatar: 'س',
    color: 'bg-pink-500',
  },
  {
    name: 'فهد الشمري',
    job: 'سائق - الدمام',
    text: 'ما كنت أعرف عن الاستثمار شيء. الموقع شرح لي بطريقة بسيطة وعطاني أفكار مشاريع جانبية ممتازة.',
    years: '14 سنة',
    avatar: 'ف',
    color: 'bg-green-500',
  },
]

const faqs = [
  {
    q: 'هل الحاسبة دقيقة؟',
    a: 'الحاسبة تعتمد على معادلات الفائدة المركبة المعيارية. النتائج تقديرية وتفترض ثبات المتغيرات، وهي مناسبة للتخطيط المالي الشخصي.',
  },
  {
    q: 'هل معلوماتي آمنة؟',
    a: 'نعم بشكل كامل. لا نحفظ أي بيانات مالية شخصية. البيانات تُستخدم فقط لتوليد التقرير وتختفي بعد انتهاء الجلسة.',
  },
  {
    q: 'هل التقرير يستحق 9 ريال؟',
    a: 'التقرير يشمل تحليل مخصص لوضعك، 4 سيناريوهات مقارنة، أفكار دخل إضافي، وخطة شهرية. لو غيّر ولو قرار مالي واحد، سيوفر لك آلاف الريالات.',
  },
  {
    q: 'ما عندي مدخرات، هل الموقع مفيد؟',
    a: 'بالتأكيد! الموقع مصمم خصيصاً للشخص اللي يبدأ من الصفر. ستعرف بالضبط كيف تبدأ ومتى تصل للمليون.',
  },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white font-tajawal" dir="rtl">

      {/* Nav */}
      <nav className="border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-gold font-extrabold text-lg">💰 متى تصير مليونير؟</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gold text-white text-sm font-bold rounded-xl hover:bg-yellow-600 transition-all"
          >
            ابدأ مجاناً
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block bg-gold/20 border border-gold/40 text-gold text-xs font-bold px-4 py-1.5 rounded-full mb-6">
          🎯 أداة مجانية للتخطيط المالي
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          متى تصبح<br /><span className="text-gold">مليونير</span>؟
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-4 max-w-xl mx-auto leading-relaxed">
          أجب على 4 أسئلة بسيطة واكتشف متى ستصل لأول مليون ريال — ومشاريع وأفكار تساعدك تصل أسرع
        </p>
        <p className="text-gray-600 text-sm mb-10">انضم لأكثر من 5,000 شخص استخدموا الحاسبة هذا الشهر</p>

        <button
          onClick={() => router.push('/')}
          className="px-10 py-4 bg-gold hover:bg-yellow-600 text-white font-extrabold text-xl rounded-2xl transition-all active:scale-95 shadow-xl shadow-gold/20 mb-4"
        >
          احسب متى تصير مليونير 🚀
        </button>
        <p className="text-gray-600 text-xs">مجاني تماماً · لا تسجيل · 30 ثانية</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-14 max-w-lg mx-auto">
          {[
            { num: '+5,000', label: 'مستخدم هذا الشهر' },
            { num: '30 ثانية', label: 'للحصول على النتيجة' },
            { num: '100%', label: 'مجاني ومحمي' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-extrabold text-gold">{s.num}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/3 border-y border-white/10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-10">كيف يعمل الموقع؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '✏️', title: 'أدخل بياناتك', desc: 'راتبك، مصروفك، ومدخراتك — 4 أسئلة بسيطة فقط' },
              { step: '2', icon: '🤖', title: 'الذكاء الاصطناعي يحلل', desc: 'يحسب المدة ويقارن السيناريوهات المختلفة' },
              { step: '3', icon: '🎯', title: 'خطتك جاهزة', desc: 'تعرف بالضبط متى تصل وكيف تصل أسرع' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-extrabold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-center mb-10">وش تحصل مجاناً؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '📊', title: 'حساب دقيق للمدة', desc: 'بالسنوات والأشهر والتاريخ المتوقع' },
            { icon: '📈', title: 'رسم بياني لنمو ثروتك', desc: 'شوف كيف تنمو فلوسك بمرور الوقت' },
            { icon: '🎴', title: 'بطاقة مشاركة', desc: 'شارك نتيجتك على واتساب وتيك توك' },
            { icon: '🎯', title: 'مقارنة السيناريوهات', desc: 'اعرف كيف توصل أسرع بتغييرات بسيطة' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-3xl shrink-0">{item.icon}</span>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white/3 border-y border-white/10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-2">قالوا عن الموقع</h2>
          <p className="text-gray-500 text-sm text-center mb-10">آراء حقيقية من مستخدمين</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-extrabold text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.job}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">"{t.text}"</p>
                <div className="text-xs text-gold font-bold">🎯 سيصل خلال: {t.years}</div>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-gold text-xs">★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-center mb-10">أسئلة شائعة</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="font-bold text-sm mb-2">❓ {faq.q}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gold/10 border-y border-gold/20 py-16 px-4 text-center">
        <h2 className="text-2xl font-extrabold mb-3">تحدّ أصدقائك — من يصير مليونير أول؟</h2>
        <p className="text-gray-400 text-sm mb-8">30 ثانية بس — ومجاني تماماً</p>
        <button
          onClick={() => router.push('/')}
          className="px-10 py-4 bg-gold hover:bg-yellow-600 text-white font-extrabold text-xl rounded-2xl transition-all active:scale-95 shadow-xl shadow-gold/20"
        >
          ابدأ الحساب مجاناً 🚀
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-white/10">
        <div className="text-gold font-extrabold mb-2">💰 متى تصير مليونير؟</div>
        <div className="flex justify-center gap-5 text-xs text-gray-500 mb-3">
          <a href="/privacy" className="hover:text-gold transition-colors">سياسة الخصوصية</a>
          <span>·</span>
          <a href="/terms" className="hover:text-gold transition-colors">الشروط والأحكام</a>
          <span>·</span>
          <a href="mailto:hello@millionaire-sa.com" className="hover:text-gold transition-colors">تواصل معنا</a>
        </div>
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} متى تصير مليونير — للتوعية المالية فقط، ليست استشارة مالية</p>
      </footer>

    </main>
  )
}
