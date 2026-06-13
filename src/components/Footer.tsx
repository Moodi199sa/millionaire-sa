export default function Footer() {
  return (
    <footer className="mt-12 pb-6 text-center border-t border-white/10 pt-8">
      <div className="text-gold font-extrabold text-lg mb-1">💰 متى تصير مليونير؟</div>
      <p className="text-gray-500 text-xs mb-4">أداة مجانية لحساب هدفك المالي — للتوعية المالية فقط</p>
      <div className="flex justify-center gap-5 text-xs text-gray-500 mb-4">
        <a href="/privacy" className="hover:text-gold transition-colors">سياسة الخصوصية</a>
        <span>·</span>
        <a href="/terms" className="hover:text-gold transition-colors">الشروط والأحكام</a>
        <span>·</span>
        <a href="mailto:support@millionaire-sa.com" className="hover:text-gold transition-colors">تواصل معنا</a>
      </div>
      <p className="text-gray-600 text-xs">
        © {new Date().getFullYear()} متى تصير مليونير — جميع الحقوق محفوظة
      </p>
      <p className="text-gray-600 text-xs mt-1">
        ⚠️ النتائج تقديرية وليست استشارة مالية
      </p>
    </footer>
  )
}
