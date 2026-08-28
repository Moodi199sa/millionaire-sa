'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Result() {
  const params = useSearchParams()
  const router = useRouter()
  const success = params.get('success') === 'true' || params.get('is_voided') === 'false'
  const product = params.get('extras') || ''

  useEffect(() => {
    if (success) {
      const dest = product?.includes('ideas') ? '/ideas' : '/report'
      setTimeout(() => router.push(dest), 3000)
    }
  }, [success, product, router])

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center font-tajawal" dir="rtl">
      <div className="text-center px-4">
        {success ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">تم الدفع بنجاح!</h1>
            <p className="text-gray-400">جاري تحويلك...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">لم يتم الدفع</h1>
            <button onClick={() => router.back()} className="mt-4 px-6 py-3 bg-gold text-white rounded-xl font-bold">
              حاول مجدداً
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
