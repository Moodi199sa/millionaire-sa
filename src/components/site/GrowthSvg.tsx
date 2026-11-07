'use client'

import { useId } from 'react'
import { ProjectionPoint, formatNumber } from '@/lib/calculator'

interface Props {
  points: ProjectionPoint[]
  goal?: number
  showPlain?: boolean // خط الادخار فقط (متقطع)
  height?: number
  xLabels?: string[] // تسميات المحور الأفقي (اختياري)
}

// رسم بياني SVG خفيف ومتجاوب — بدون مكتبات، يشتغل على الجوال والكمبيوتر.
// المحور الأفقي من اليسار لليمين مثل التصميم: اليوم يسار، المستقبل يمين.
export default function GrowthSvg({ points, goal = 1000000, showPlain = false, height = 220, xLabels }: Props) {
  const uid = useId().replace(/:/g, '')
  const W = 600
  const H = height
  const padX = 14
  const padTop = 26
  const padBottom = 24
  if (points.length < 2) return null

  const maxM = points[points.length - 1].m || 1
  const maxV = Math.max(goal, ...points.map((p) => p.compound)) * 1.05
  const x = (m: number) => padX + (m / maxM) * (W - padX * 2)
  const y = (v: number) => padTop + (1 - v / maxV) * (H - padTop - padBottom)

  const line = (key: 'compound' | 'plain') =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.m).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ')
  const area = `${line('compound')} L${x(maxM).toFixed(1)},${(H - padBottom).toFixed(1)} L${x(0).toFixed(1)},${(H - padBottom).toFixed(1)} Z`

  // نقطة نصف المليون والمليون
  const findCross = (v: number) => points.find((p) => p.compound >= v)
  const half = findCross(goal / 2)
  const full = findCross(goal)
  const last = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} direction="ltr" style={{ direction: 'ltr' }} className="w-full h-auto" role="img" aria-label="مسار نمو ثروتك حتى المليون">
      <defs>
        <linearGradient id={`fill${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`stroke${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* خطوط إرشادية */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={padX} x2={W - padX} y1={y(goal * f)} y2={y(goal * f)} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
      ))}
      <line x1={padX} x2={W - padX} y1={y(goal)} y2={y(goal)} stroke="rgba(245,158,11,0.35)" strokeDasharray="5 5" />

      <path d={area} fill={`url(#fill${uid})`} />
      {showPlain && <path d={line('plain')} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="6 6" />}
      <path d={line('compound')} fill="none" stroke={`url(#stroke${uid})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* البداية */}
      <circle cx={x(0)} cy={y(points[0].compound)} r="6" fill="#F59E0B" stroke="#12171F" strokeWidth="3" />
      {half && (
        <>
          <circle cx={x(half.m)} cy={y(half.compound)} r="6" fill="#F59E0B" stroke="#12171F" strokeWidth="3" />
          <text x={x(half.m)} y={y(half.compound) - 12} textAnchor="middle" fontSize="13" fontWeight="800" fill="#E5E7EB">{formatNumber(goal / 2000)} ألف</text>
        </>
      )}
      {full ? (
        <>
          <circle cx={x(full.m)} cy={y(full.compound)} r="7" fill="#34D399" stroke="#12171F" strokeWidth="3" />
          <text x={Math.min(W - 60, x(full.m))} y={y(full.compound) - 13} textAnchor="middle" fontSize="13" fontWeight="800" fill="#FBBF24">🏆 المليون</text>
        </>
      ) : (
        <circle cx={x(last.m)} cy={y(last.compound)} r="6" fill="#34D399" stroke="#12171F" strokeWidth="3" />
      )}

      {xLabels && xLabels.length > 1 && xLabels.map((l, i) => (
        <text key={i} x={padX + (i / (xLabels.length - 1)) * (W - padX * 2)} y={H - 4} textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'} fontSize="12" fill="#6B7280">{l}</text>
      ))}
    </svg>
  )
}
