import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/accessToken'

// يتحقق من توكن الوصول لمنتج معيّن (report أو ideas) دون كشف أي محتوى.
// تستخدمه صفحات المحتوى client-side لتقرر: تعرض أم تحوّل لصفحة الدفع.
export async function GET(req: NextRequest) {
  const product = req.nextUrl.searchParams.get('product') || ''
  if (product !== 'report' && product !== 'ideas') {
    return NextResponse.json({ access: false }, { status: 400 })
  }
  const token = req.cookies.get(`sm_access_${product}`)?.value || ''
  const access = verifyAccessToken(token, product)
  return NextResponse.json({ access })
}
