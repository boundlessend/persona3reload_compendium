import type { ReactNode } from "react";

// общий заголовок секции: mono-капс с blood-подчёркиванием. используется в
// модалках и на страницах-справочниках. as задаёт уровень (h2 для секции
// страницы, h3 по умолчанию для подсекции внутри модалки); className - отступы
export function SectionHeading({
  as: Tag = "h3",
  className = "",
  children,
}: {
  as?: "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood ${className}`}
    >
      {children}
    </Tag>
  );
}
