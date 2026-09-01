import crypto from 'crypto'

// توكن وصول موقّع للمحتوى المدفوع. يُصدَر فقط بعد دفعة مؤكَّدة من Paymob
// (عبر التحقق من توقيع HMAC الخاص بـ Paymob). التوكن نفسه موقّع بسر السيرفر
// فلا يمكن تزويره أو تعديل المنتج/الصلاحية من طرف العميل.
//
// البنية: base64url(payload).base64url(hmacSHA256(payload, SECRET))
// payload = { product, exp }  (exp = وقت انتهاء بالمللي ثانية)

function getSecret(): string {
  // نعيد استخدام سر Paymob كسر توقيع — موجود أصلاً في البيئة.
  // (يفضّل سر مستقل ACCESS_TOKEN_SECRET إن وُجد.)
  return process.env.ACCESS_TOKEN_SECRET || process.env.PAYMOB_HMAC_SECRET || process.env.PAYMOB_SECRET_KEY || ''
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Buffer {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return Buffer.from(s, 'base64')
}

// صلاحية التوكن: 30 يوماً (يكفي ليرجع المستخدم لتقريره)
const TTL_MS = 30 * 24 * 60 * 60 * 1000

export function issueAccessToken(product: string, ttlMs = TTL_MS): string {
  const secret = getSecret()
  const payload = JSON.stringify({ product, exp: Date.now() + ttlMs })
  const p = b64url(payload)
  const sig = b64url(crypto.createHmac('sha256', secret).update(p).digest())
  return `${p}.${sig}`
}

export function verifyAccessToken(token: string, expectedProduct: string): boolean {
  try {
    const secret = getSecret()
    if (!secret || !token || !token.includes('.')) return false
    const [p, sig] = token.split('.')
    const expected = b64url(crypto.createHmac('sha256', secret).update(p).digest())
    // مقارنة ثابتة الزمن لمنع timing attacks
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
    const data = JSON.parse(fromB64url(p).toString('utf8'))
    if (data.product !== expectedProduct) return false
    if (typeof data.exp !== 'number' || Date.now() > data.exp) return false
    return true
  } catch {
    return false
  }
}

// التحقق من توقيع Paymob على callback (HMAC) — يثبت أن الدفعة حقيقية.
// Paymob يرسل hmac كـ query param، محسوب على حقول محددة مرتبة.
export function verifyPaymobHmac(fields: Record<string, string>, receivedHmac: string): boolean {
  try {
    const secret = process.env.PAYMOB_HMAC_SECRET || ''
    if (!secret || !receivedHmac) return false
    // ترتيب الحقول المعتمد من Paymob للـ transaction callback (بصيغة النقاط الرسمية)
    const order = [
      'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
      'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
      'is_standalone_payment', 'is_voided', 'order', 'owner', 'pending',
      'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
    ]
    // Paymob قد يرسل المفاتيح بنقطة (source_data.pan) أو بشرطة (source_data_pan)،
    // و order قد يصل كـ order أو order.id — نجرّب كل الصيغ لضمان التطابق.
    const resolve = (key: string): string => {
      const candidates = [key, key.replace(/\./g, '_')]
      if (key === 'order') candidates.push('order.id', 'order_id')
      for (const c of candidates) if (fields[c] !== undefined) return fields[c]
      return ''
    }
    const concat = order.map(resolve).join('')
    const computed = crypto.createHmac('sha512', secret).update(concat).digest('hex')
    const a = Buffer.from(computed)
    const b = Buffer.from(receivedHmac)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}
