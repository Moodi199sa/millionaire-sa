import { ImageResponse } from 'next/og'
import { monthsToLabel, targetDate } from '@/lib/calculator'

export const runtime = 'edge'

const GOLD = '#D4A017'
const SOFT = '#F5C842'

// نص عربي: كل كلمة عنصر flex مع row-reverse — يضمن الترتيب الصحيح (RTL) والمسافات،
// لأن Satori لا يطبّق خوارزمية الاتجاه (bidi) على النص المتصل.
function AR({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: '0.28em', ...style }}>
      {text.split(' ').map((w, i) => (<span key={i}>{w}</span>))}
    </div>
  )
}

// رقم: صف flex ثابت الاتجاه — يمنع انعكاس الأرقام الهندية في Satori
function NUM({ value, style }: { value: number; style?: React.CSSProperties }) {
  const s = value.toLocaleString('en-US').replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])
  return (
    <div style={{ display: 'flex', flexDirection: 'row', ...style }}>
      {[...s].map((c, i) => (<span key={i}>{c}</span>))}
    </div>
  )
}

function Stat({ value, unit }: { value: number; unit: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 16, padding: '12px 26px' }}>
      <NUM value={value} style={{ color: GOLD, fontSize: 38, fontWeight: 800 }} />
      <div style={{ color: '#8b93a1', fontSize: 18 }}>{unit}</div>
    </div>
  )
}

const Divider = () => <div style={{ width: 560, height: 1, background: 'rgba(212,160,23,0.3)', margin: '6px 0' }} />

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const m = parseInt(searchParams.get('m') || '0', 10)
  const months = Number.isFinite(m) && m > 0 && m < 99999 ? m : 0

  const label = months ? monthsToLabel(months) : 'احسب نتيجتك'
  const days = months * 30
  const weeks = Math.round(months * 4.3)
  const date = months ? targetDate(months) : ''
  const motivations = [
    `على بُعد ${months} شهراً من المليون الأول`,
    `رحلتك للمليون تستغرق ${label}`,
    `كل شهر يقربك أكثر من المليون`,
    `المليون الأول ليس بعيداً — ${label} وتصله`,
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0F1C', border: `2px solid ${GOLD}`, borderRadius: 24, padding: '22px 40px', gap: 11 }}>
          <div style={{ display: 'flex', background: GOLD, color: '#0A0F1C', padding: '6px 22px', borderRadius: 20 }}>
            <AR text="تحدي المليونير 🔥" style={{ fontSize: 22, fontWeight: 800 }} />
          </div>
          <AR text={`💎 ${motivation}`} style={{ color: SOFT, fontSize: 24, fontWeight: 700, maxWidth: 980 }} />
          <Divider />
          <AR text="أنا بكون مليونير خلال" style={{ color: '#9CA3AF', fontSize: 24 }} />
          <AR text={label} style={{ color: GOLD, fontSize: 72, fontWeight: 800, maxWidth: 1050 }} />
          {months ? (
            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 18, margin: '6px 0' }}>
              <Stat value={months} unit="شهر" />
              <Stat value={days} unit="يوم" />
              <Stat value={weeks} unit="أسبوع" />
            </div>
          ) : null}
          <Divider />
          <AR text="وأنت؟ احسب متى بتصير مليونير 👇" style={{ color: SOFT, fontSize: 30, fontWeight: 800 }} />
          <AR text="تحدّ أصدقائك — من يصير مليونير أول؟" style={{ color: '#6B7280', fontSize: 20 }} />
          {date ? <AR text={`📅 التاريخ المتوقع: ${date}`} style={{ color: '#9CA3AF', fontSize: 20 }} /> : null}
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
