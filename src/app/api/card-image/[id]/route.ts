import { getStore } from '@netlify/blobs'

// يعرض بايتات الصورة المخزّنة (نفس PNG الذي ولّده متصفح المستخدم) كصورة خام،
// عشان تعمل كصورة OG قابلة للجلب من زواحف تويتر/واتساب.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const store = getStore('share-cards')
  const base64 = await store.get(params.id, { type: 'text' })
  if (!base64) {
    return new Response('Not found', { status: 404 })
  }
  const bytes = Buffer.from(base64, 'base64')
  return new Response(bytes, {
    headers: {
      'Content-Type': 'image/png',
      // كاش يوم واحد فقط: يسمح بتحديث الكرت (تعديل تصميم لاحق) دون كاش أبدي على مستوى شبكتنا،
      // مستقل عن كاش تويتر الخاص به على مستوى الرابط.
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
