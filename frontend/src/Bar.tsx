import { useEffect, useRef } from "react";

// горизонтальная полоса; ширина задаётся через CSSOM, а не инлайн style-атрибут:
// CSSOM-правки не подпадают под style-src-attr, поэтому CSP обходится без него
export function Bar({ pct, tone }: { pct: number; tone: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current)
      ref.current.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }, [pct]);
  return (
    <div className="h-2 border border-ink">
      <div ref={ref} className={`h-full ${tone}`} />
    </div>
  );
}
