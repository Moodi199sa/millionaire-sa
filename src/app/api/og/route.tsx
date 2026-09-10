import { ImageResponse } from 'next/og'
import { monthsToLabel, targetDate } from '@/lib/calculator'

export const runtime = 'edge'

const GOLD = '#D4A017'
const SOFT = '#F5C842'

// @vercel/og يرتّب العربي (RTL) صحيحاً من نفسه، لكنه يجعل المسافة العادية عريضة جداً.
// الحل: مسافة غير فاصلة (nbsp) تعطي تباعداً طبيعياً وثابتاً. ونتجنّب الشرطات/النقطتين
// لأنها (كمحايدات bidi) تعكس ترتيب الجُمَل في هذا المحرّك.
const sp = (t: string) => t.replace(/ /g, '\u00A0')

function Tx({ text, style }: { text: string; style?: React.CSSProperties }) {
  return <div style={{ display: 'flex', ...style }}>{sp(text)}</div>
}

// أرقام هندية بفاصلة عادية — next/og يضعها بالاتجاه الصحيح
const arNum = (n: number) => n.toLocaleString('en-US').replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])

function Stat({ value, unit }: { value: number; unit: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 16, padding: '12px 26px' }}>
      <div style={{ display: 'flex', color: GOLD, fontSize: 38, fontWeight: 800 }}>{arNum(value)}</div>
      <div style={{ display: 'flex', color: '#8b93a1', fontSize: 18 }}>{unit}</div>
    </div>
  )
}

const Divider = () => <div style={{ display: 'flex', width: 560, height: 1, background: 'rgba(212,160,23,0.3)', margin: '6px 0' }} />

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const m = parseInt(searchParams.get('m') || '0', 10)
  const months = Number.isFinite(m) && m > 0 && m < 99999 ? m : 0

  const label = months ? monthsToLabel(months) : 'احسب نتيجتك'
  const days = months * 30
  const weeks = Math.round(months * 4.3)
  const date = months ? targetDate(months) : ''
  // عبارات تحفيزية بلا شرطات أو أرقام لاتينية (آمنة للاتجاه)
  const motivations = [
    'المليون الأول أقرب مما تتوقع',
    `رحلتك للمليون تستغرق ${label} فقط`,
    'كل شهر يقرّبك أكثر من المليون',
    `المليون الأول ليس بعيداً ويصلك خلال ${label}`,
  ]
  const motivation = months ? motivations[months % 4] : 'احسب خلال 30 ثانية متى تصل لأول مليون'

  const [reg, bold, extra] = await Promise.all([
    fetch(new URL('/fonts/Tajawal-Regular.ttf', origin)).then(r => r.arrayBuffer()),
    fetch(new URL('/fonts/Tajawal-Bold.ttf', origin)).then(r => r.arrayBuffer()),
    fetch(new URL('/fonts/Tajawal-ExtraBold.ttf', origin)).then(r => r.arrayBuffer()),
  ])

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', background: '#070b14', padding: 28, fontFamily: 'Tajawal' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0F1C', border: `2px solid ${GOLD}`, borderRadius: 24, padding: '22px 40px', gap: 11 }}>
          <div style={{ position: 'absolute', top: -10, right: 20, fontSize: 150, opacity: 0.05, display: 'flex' }}>💰</div>
          <div style={{ position: 'absolute', bottom: -20, left: 20, fontSize: 150, opacity: 0.05, display: 'flex' }}>🏆</div>
          <div style={{ display: 'flex', background: GOLD, color: '#0A0F1C', padding: '6px 22px', borderRadius: 20 }}>
            <Tx text="تحدي المليونير 🔥" style={{ fontSize: 22, fontWeight: 800 }} />
          </div>
          <Tx text={`💎 ${motivation}`} style={{ color: SOFT, fontSize: 23, fontWeight: 700, maxWidth: 1000 }} />
          <Divider />
          <Tx text="أنا بكون مليونير خلال" style={{ color: '#9CA3AF', fontSize: 24 }} />
          <Tx text={label} style={{ color: GOLD, fontSize: 72, fontWeight: 800, maxWidth: 1080 }} />
          {months ? (
            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 18, margin: '6px 0' }}>
              <Stat value={months} unit="شهر" />
              <Stat value={days} unit="يوم" />
              <Stat value={weeks} unit="أسبوع" />
            </div>
          ) : null}
          <Divider />
          <Tx text="وأنت؟ احسب متى بتصير مليونير 👇" style={{ color: SOFT, fontSize: 30, fontWeight: 800 }} />
          <Tx text="تحدّ أصدقائك ومن يصير مليونير أول؟" style={{ color: '#6B7280', fontSize: 20 }} />
          {date ? <Tx text={`📅 التاريخ المتوقع ${date}`} style={{ color: '#9CA3AF', fontSize: 20 }} /> : null}
          <div style={{ display: 'flex', background: 'rgba(212,160,23,0.15)', borderRadius: 10, padding: '6px 20px', color: GOLD, fontSize: 22, fontWeight: 700 }}>saudimillion.com</div>
        </div>
      </div>
    ),
    {
      width: 1200, height: 630,
      fonts: [
        { name: 'Tajawal', data: reg, weight: 400, style: 'normal' },
        { name: 'Tajawal', data: bold, weight: 700, style: 'normal' },
        { name: 'Tajawal', data: extra, weight: 800, style: 'normal' },
      ],
    }
  )
}
