import { NextRequest, NextResponse } from 'next/server'
import { getProduct } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    // العميل يرسل اسم المنتج فقط — السعر يُحدَّد في السيرفر ولا يُقبل من العميل أبداً
    const { product } = await req.json()
    const prod = getProduct(String(product || ''))
    if (!prod) return NextResponse.json({ error: 'منتج غير معروف' }, { status: 400 })

    const secretKey = process.env.PAYMOB_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Missing key' }, { status: 500 })

    const amountCents = prod.amount * 100 // ريال → هللات

    // Integration ID من البيئة (رقم واحد أو عدة أرقام مفصولة بفواصل)
    const intId = process.env.PAYMOB_INTEGRATION_ID
    const paymentMethods: (number | string)[] = intId
      ? intId.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n))
      : ['card']

    const res = await fetch('https://ksa.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'SAR',
        payment_methods: paymentMethods,
        items: [{ name: prod.name, amount: amountCents, description: prod.name, quantity: 1 }],
        billing_data: {
          first_name: 'Customer',
          last_name: 'SA',
          email: 'customer@saudimillion.com',
          phone_number: '+966500000000',
          country: 'SA',
          city: 'Riyadh',
          street: 'NA', building: 'NA', floor: 'NA', apartment: 'NA',
        },
        extras: { product: prod.id },
        special_reference: `sm_${prod.id}_${Date.now()}`,
        redirection_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://saudimillion.com'}/payment-result`,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: 'فشل إنشاء الدفعة' }, { status: 400 })
    if (!data.client_secret) return NextResponse.json({ error: 'no client_secret' }, { status: 400 })
    return NextResponse.json({ client_secret: data.client_secret, id: data.id })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
