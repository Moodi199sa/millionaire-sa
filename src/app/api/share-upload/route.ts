import { getStore } from '@netlify/blobs'

// يستقبل صورة PNG بصيغة data URL (المولّدة فعلياً في متصفح المستخدم عبر
// html-to-image لنفس الكرت المعروض في الموقع) ويخزّنها، عشان تُستخدم كما هي
// كصورة OG عند المشاركة — بدون أي إعادة بناء للتصميم على السيرفر.
export async function POST(req: Request) {
  try {
    const { image, months } = await req.json()
    if (typeof image !== 'string' || !image.startsWith('data:image/png;base64,')) {
      return Response.json({ error: 'invalid_image' }, { status: 400 })
    }
    const m = parseInt(months, 10)
    if (!Number.isFinite(m) || m <= 0) {
      return Response.json({ error: 'invalid_months' }, { status: 400 })
    }

    const base64 = image.slice('data:image/png;base64,'.length)

    // معرّف = رقم الأشهر نفسه: كل نتيجة لها كرت واحد محدّث دائماً،
    // فلا تتراكم نسخ، وأي إعادة مشاركة لنفس النتيجة تحدّث نفس المعرّف.
    // نخزّن base64 كنص (BlobInput لا يقبل Buffer/Uint8Array من Node مباشرة).
    const store = getStore('share-cards')
    await store.set(String(m), base64, { metadata: { months: m, updatedAt: Date.now() } })

    return Response.json({ id: String(m) })
  } catch (e) {
    console.error('share-upload error:', (e as Error).message)
    return Response.json({ error: 'upload_failed' }, { status: 500 })
  }
}
