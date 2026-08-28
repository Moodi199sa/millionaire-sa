'use client'
import { useState } from 'react'

interface Props {
  amount: number
  product: string
  label: string
  className?: string
}

export default function PaymobButton({ amount, product, label, className }: Props) {
  const [loading, setLoading] = useState(false)
  const publicKey = process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY || ''

  const handlePay = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, product }),
      })
      const data = await res.json()
      if (data.client_secret) {
        window.location.href = `https://ksa.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${data.client_secret}`
      } else {
        alert('خطأ في الدفع — حاول مرة أخرى')
      }
    } catch {
      alert('خطأ — حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePay} disabled={loading}
      className={className || 'w-full py-4 bg-gold hover:bg-yellow-600 text-white font-extrabold rounded-2xl transition-all active:scale-95'}>
      {loading ? '⏳ جاري التحضير...' : label}
    </button>
  )
}
