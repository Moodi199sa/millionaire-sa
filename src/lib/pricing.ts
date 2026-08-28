// أسعار المنتجات تُحدَّد في السيرفر فقط — العميل لا يرسل المبلغ أبداً.
// أي محاولة لتمرير مبلغ من العميل تُتجاهل ويُستخدم السعر الرسمي هنا.
export const PRODUCTS = {
  report: { amount: 9, name: 'التقرير المالي الشخصي' },
  ideas: { amount: 49, name: 'دليل 8 أفكار دخل مربحة' },
} as const

export type ProductId = keyof typeof PRODUCTS

export function getProduct(product: string): { id: ProductId; amount: number; name: string } | null {
  if (product in PRODUCTS) {
    const id = product as ProductId
    return { id, amount: PRODUCTS[id].amount, name: PRODUCTS[id].name }
  }
  return null
}
