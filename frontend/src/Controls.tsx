import type { ReactNode } from "react";

// общие кнопки панели/модалок. pressed опционален: задан - это toggle (blood при
// нажатии, ink иначе) с aria-pressed; не задан - обычное действие в ink-стиле
const INK = "border-ink text-ink hover:bg-ink hover:text-paper";
const BLOOD = "border-blood bg-blood text-paper";

function tone(pressed: boolean | undefined): string {
  if (pressed === undefined) return INK;
  return pressed ? BLOOD : INK;
}

// прямоугольная кнопка ряда контролов (Favorites/Compare/Team/Shuffle/Clear)
export function ControlButton({
  pressed,
  onClick,
  className = "",
  children,
}: {
  pressed?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...(pressed === undefined ? {} : { "aria-pressed": pressed })}
      className={`border-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${tone(pressed)} ${className}`}
    >
      {children}
    </button>
  );
}

// квадратная иконочная кнопка модалок (Close, Favorite); pressed - для toggle
export function IconButton({
  pressed,
  onClick,
  ariaLabel,
  className = "",
  children,
}: {
  pressed?: boolean;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...(pressed === undefined ? {} : { "aria-pressed": pressed })}
      className={`grid h-9 w-9 place-items-center border-2 transition ${tone(pressed)} ${className}`}
    >
      {children}
    </button>
  );
}

// чип-фильтр (арканы, стихии скиллов); размер задаёт caller через className
export function Chip({
  pressed,
  onClick,
  className = "",
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`border-2 border-ink py-1.5 font-mono uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
        pressed ? "bg-ink text-paper" : "text-ink hover:bg-ink hover:text-paper"
      } ${className}`}
    >
      {children}
    </button>
  );
}
