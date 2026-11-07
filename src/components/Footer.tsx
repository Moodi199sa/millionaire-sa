export default function Footer() {
  return (
    <footer className="mt-12 pb-6 text-center border-t border-gold/20 pt-8">
      <div className="text-gold-deep font-extrabold text-lg mb-1">💰 متى تصير مليونير؟</div>
      <p className="text-ink-muted text-xs mb-4">أداة مجانية لحساب هدفك المالي — للتوعية المالية فقط</p>
      <div className="flex justify-center gap-5 text-xs text-ink-muted mb-4 flex-wrap">
        <a href="/privacy" className="hover:text-gold transition-colors">سياسة الخصوصية</a>
        <span className="hidden sm:inline">·</span>
        <a href="/terms" className="hover:text-gold transition-colors">الشروط والأحكام</a>
        <span className="hidden sm:inline">·</span>
        <a href="/blog" className="hover:text-gold transition-colors">نصائح مالية</a>
        <span className="hidden sm:inline">·</span>
        <a href="mailto:support@amerniksa.com" className="hover:text-gold transition-colors">تواصل معنا</a>
      </div>
      <p className="text-ink-muted text-xs">
        © {new Date().getFullYear()} متى تصير مليونير — جميع الحقوق محفوظة
      </p>
      <p className="text-ink-muted text-xs mt-1">
        ⚠️ النتائج تقديرية وليست استشارة مالية
      </p>
    </footer>
  )
}
