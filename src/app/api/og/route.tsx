import { ImageResponse } from 'next/og'
import { monthsToLabel } from '@/lib/calculator'

export const runtime = 'edge'

const gold = '#D4A017'
const goldSoft = 'rgba(212,160,23,0.12)'
const goldBorder = 'rgba(212,160,23,0.25)'

function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: goldSoft, border: `2px solid ${goldBorder}`, borderRadius: 18, padding: '14px 30px' }}>
      <div style={{ color: gold, fontSize: 40, fontWeight: 800 }}>{value}</div>
      <div style={{ color: '#8b93a1', fontSize: 20 }}>{unit}</div>
    </div>
  )
}

// صورة OG ديناميكية: تعيد رسم «كرت النتيجة» لكل شخص حسب عدد الأشهر (m)
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const m = parseInt(searchParams.get('m') || '0', 10)
  const months = Number.isFinite(m) && m > 0 ? m : 0

  const label = months ? monthsToLabel(months) : 'احسب نتيجتك'
  const days = months ? Math.round(months * 30.44) : 0
  const weeks = months ? Math.round(months * 4.345) : 0
  const ar = (n: number) => n.toLocaleString('ar-SA')

  const [bold, extra] = await Promise.all([
    fetch(new URL('/fonts/Tajawal-Bold.ttf', origin)).then(r => r.arrayBuffer()),
    fetch(new URL('/fonts/Tajawal-ExtraBold.ttf', origin)).then(r => r.arrayBuffer()),
  ])

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', direction: 'rtl', background: 'radial-gradient(circle at 50% 30%, #12203a 0%, #0a0f1c 60%, #070b14 100%)', fontFamily: 'Tajawal', padding: '48px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(212,160,23,0.15)', border: `3px solid ${gold}`, color: gold, fontSize: 52, fontWeight: 800 }}>$</div>
        <div style={{ color: '#fff', fontSize: 30, fontWeight: 700, marginBottom: 6 }}>تحدي المليونير 🔥</div>
        <div style={{ color: '#9CA3AF', fontSize: 26, marginBottom: 4 }}>أنا بكون مليونير خلال</div>
        <div style={{ color: gold, fontSize: 78, fontWeight: 800, lineHeight: 1.1, marginBottom: 18 }}>{label}</div>
        {months ? (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 22, marginBottom: 26 }}>
            <Stat value={ar(months)} unit="شهر" />
            <Stat value={ar(weeks)} unit="أسبوع" />
            <Stat value={ar(days)} unit="يوم" />
          </div>
        ) : null}
        <div style={{ color: '#F5C842', fontSize: 30, fontWeight: 800, marginBottom: 14 }}>وأنت؟ احسب متى بتصير مليونير 👇</div>
        <div style={{ background: 'rgba(212,160,23,0.15)', borderRadius: 12, padding: '8px 22px', color: gold, fontSize: 24, fontWeight: 700 }}>saudimillion.com</div>
      </div>
    ),
    {
      width: 1200, height: 630,
      fonts: [
        { name: 'Tajawal', data: bold, weight: 700, style: 'normal' },
        { name: 'Tajawal', data: extra, weight: 800, style: 'normal' },
      ],
    }
  )
}
