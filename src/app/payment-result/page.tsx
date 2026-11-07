'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Result() {
  const params = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<'checking' | 'success' | 'failed'>('checking')

  useEffect(() => {
    // نجمع كل معاملات Paymob من الـ URL ونرسلها للسيرفر للتحقق من توقيع HMAC.
    // لا نثق بـ success=true وحده — التحقق يتم في السيرفر ويصدر توكن الوصول.
    const fields: Record<string, string> = {}
    params.forEach((v, k) => { fields[k] = v })

    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.product) {
          setState('success')
          const dest = data.product === 'ideas' ? '/ideas' : '/report'
          setTimeout(() => router.push(dest), 2500)
        } else {
          setState('failed')
        }
      })
      .catch(() => setState('failed'))
  }, [params, router])

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center font-tajawal" dir="rtl">
      <div className="text-center px-4">
        {state === 'checking' && (
          <>
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">جاري تأكيد الدفع...</h1>
            <p className="text-gray-400">لحظات من فضلك</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">تم الدفع بنجاح!</h1>
            <p className="text-gray-400">جاري تحويلك...</p>
          </>
        )}
        {state === 'failed' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">لم يتم تأكيد الدفع</h1>
            <p className="text-gray-400 mb-4 text-sm">إذا خُصم المبلغ ولم يظهر المحتوى، تواصل معنا</p>
            <button onClick={() => router.push('/')} className="mt-2 px-6 py-3 bg-gold text-white rounded-xl font-bold">
              العودة للرئيسية
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default function Page() {
  return <Suspense><Result /></Suspense>
}
