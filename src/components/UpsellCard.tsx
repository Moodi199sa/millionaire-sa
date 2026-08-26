'use client'

import { useRouter } from 'next/navigation'
import { monthsToLabel } from '@/lib/calculator'
import { saveUserData, UserData } from '@/lib/store'

interface Scenario { label: string; months: number }
interface Props { scenarios: Scenario[]; userData: UserData }

export default function UpsellCard({ scenarios, userData }: Props) {
  const router = useRouter()

  const handleBuy = () => {
    saveUserData(userData)
    // TODO: ربط شركة المدفوعات
    router.push('/report')
  }

  return (
    <div className="rounded-3xl overflow-hidden border-2" style={{borderColor:'#1a9e6b'}}>
      {/* Header */}
      <div className="p-5 text-center" style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)'}}>
        <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
          style={{background:'rgba(26,158,107,0.3)', color:'#6ee7b7', border:'1px solid rgba(26,158,107,0.5)'}}>
          📊 تقرير شخصي مخصص
        </div>
        <h2 className="text-lg font-extrabold text-white mb-1">تريد تعرف كيف تصل أسرع؟</h2>
        <p className="text-sm" style={{color:'rgba(255,255,255,0.6)'}}>تقريرك يجاوب على كل هذا</p>
      </div>

      <div className="bg-white p-5 space-y-4">
        {/* ما ستحصل عليه */}
        <div className="space-y-2">
          {[
            {icon:'🎯', text:'تشخيص شخصي — وش يؤخرك بالضبط بأرقامك'},
            {icon:'⚡', text:'مقارنة السيناريوهات — كم توفر بكل تغيير'},
            {icon:'🧮', text:'حاسبة تفاعلية — كم تحتاج شهرياً لأي هدف'},
            {icon:'💡', text:'5 أفكار دخل إضافي مناسبة لوضعك'},
            {icon:'📅', text:'خطة عملية أسبوع بأسبوع للشهر الأول'},
            {icon:'🏆', text:'أهدافك الواضحة — شهرية وسنوية ونهائية'},
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm" style={{color:'#374151'}}>
              <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* السيناريوهات */}
        <div className="rounded-2xl p-4" style={{background:'rgba(26,158,107,0.06)', border:'1px solid rgba(26,158,107,0.2)'}}>
          <p className="text-xs font-bold mb-2" style={{color:'#1a9e6b'}}>⚡ معاينة من تقريرك</p>
          <div className="space-y-1.5">
            {scenarios.slice(0,3).map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{s.label}</span>
                <span className="font-bold" style={{color: i===0?'#6b7280':'#1a9e6b'}}>{monthsToLabel(s.months)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* السعر والزر */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-gray-400 text-sm line-through">9 ريال</span>
            <span className="text-3xl font-extrabold" style={{color:'#1a9e6b'}}>مجاناً</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{background:'rgba(26,158,107,0.1)', color:'#1a9e6b'}}>الآن</span>
          </div>
          <button onClick={handleBuy}
            className="w-full py-4 text-white font-extrabold text-base rounded-2xl transition-all active:scale-95 shadow-lg"
            style={{background:'linear-gradient(135deg,#0d1b3e,#1a3a6b)', boxShadow:'0 4px 20px rgba(13,27,62,0.25)'}}>
            احصل على تقريرك الشخصي ←
          </button>
          <p className="text-xs text-gray-400 mt-2">⚡ وصول فوري — لا حاجة لبطاقة</p>
        </div>
      </div>
    </div>
  )
}
