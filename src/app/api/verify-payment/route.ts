import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymobHmac, issueAccessToken } from '@/lib/accessToken'
import { PRODUCTS } from '@/lib/pricing'

// يستقبل معاملات callback من Paymob (كما وصلت لصفحة payment-result)،
// يتحقق من توقيع HMAC — فإن صحّ وكانت الدفعة ناجحة، يصدر توكن وصول
// موقّعاً ويضعه في httpOnly cookie. بدون توقيع صحيح لا يُصدَر أي توكن.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fields: Record<string, string> = {}
    for (const k of Object.keys(body)) fields[k] = String(body[k] ?? '')

    const receivedHmac = fields['hmac'] || ''
    const isValid = verifyPaymobHmac(fields, receivedHmac)
    const paidOk = fields['success'] === 'true' && fields['error_occured'] !== 'true'

    if (!isValid || !paidOk) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }

    // تحديد المنتج: من extras أو من المبلغ المدفوع
    let product = ''
    const cents = Number(fields['amount_cents'] || 0)
    if (cents === PRODUCTS.ideas.amount * 100) product = 'ideas'
    else if (cents === PRODUCTS.report.amount * 100) product = 'report'
    if (!product) return NextResponse.json({ ok: false }, { status: 400 })

    const token = issueAccessToken(product)
    const resp = NextResponse.json({ ok: true, product })
    resp.cookies.set(`sm_access_${product}`, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return resp
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
