import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type DropdownOption<T extends string> = { value: T; label: string };

// кастомный listbox в брутализм-стиле сайта: замена нативному <select>,
// с клавиатурной навигацией, click-outside и ARIA-разметкой
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex] ?? options[0];

  // при открытии перевести фокус на выбранную опцию
  useEffect(() => {
    if (!open) return;
    const index = selectedIndex < 0 ? 0 : selectedIndex;
    optionRefs.current[index]?.focus();
  }, [open, selectedIndex]);

  // закрытие по клику вне компонента
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const commit = (next: T): void => {
    onChange(next);
    setOpen(false);
  };

  const focusOption = (index: number): void => {
    const next = (index + options.length) % options.length;
    optionRefs.current[next]?.focus();
  };

  const onOptionKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    index: number,
  ): void => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusOption(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusOption(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = options[index];
        if (option) commit(option.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        onPointerDown={() => setOpen((prev) => !prev)}
        onKeyDown={onTriggerKeyDown}
        className="flex items-center gap-2 border-2 border-ink bg-transparent px-3 py-3 font-mono text-xs uppercase tracking-wider text-ink outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood sm:py-2"
      >
        {selected?.label}
        <span
          aria-hidden="true"
          className={`text-blood transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-full z-20 mt-1 min-w-full border-2 border-ink bg-paper"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={() => commit(option.value)}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
                className={`flex cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-2 font-mono text-xs uppercase tracking-wider outline-none transition hover:bg-ink hover:text-paper focus:bg-ink focus:text-paper ${
                  isSelected ? "text-blood" : "text-ink"
                }`}
              >
                <span aria-hidden="true" className="w-2">
                  {isSelected ? "◆" : ""}
                </span>
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
