import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { amount, product } = await req.json()
    const secretKey = process.env.PAYMOB_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Missing key' }, { status: 500 })

    const res = await fetch('https://ksa.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // halalat → fils
        currency: 'SAR',
        payment_methods: ['card'],
        items: [{ name: product, amount: amount * 100, description: product, quantity: 1 }],
        billing_data: {
          first_name: 'Customer',
          last_name: 'SA',
          email: 'customer@saudimillion.com',
          phone_number: '+966500000000',
          country: 'SA',
          city: 'Riyadh',
          street: 'NA',
          building: 'NA',
          floor: 'NA',
          apartment: 'NA',
        },
        extras: { product },
        special_reference: `sm_${Date.now()}`,
        redirection_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://saudimillion.com'}/payment-result`,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: 400 })
    return NextResponse.json({ client_secret: data.client_secret, id: data.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
