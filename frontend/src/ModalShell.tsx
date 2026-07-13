import type { ReactNode, RefObject } from "react";

// общий каркас модалки: затемнение с блюром, центральная панель, закрытие по
// клику вне панели. фокус-трап/Escape вызывающий вешает сам через useDialog на
// panelRef - у разных модалок условия разные (напр. зум в PersonaModal).
// className задаёт ширину и внутренние отступы панели; ariaHidden - для случаев,
// когда панель временно скрыта поверх лежащим слоем
export function ModalShell({
  label,
  onClose,
  panelRef,
  className,
  ariaHidden,
  children,
}: {
  label: string;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  className: string;
  ariaHidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-hidden={ariaHidden}
        className={`max-h-[92vh] w-full overflow-y-auto border-2 border-ink bg-paper outline-none sm:shadow-[8px_8px_0_0_#16130d] ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
