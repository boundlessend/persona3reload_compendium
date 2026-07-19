import { Component, type ErrorInfo, type ReactNode } from "react";

// корневой предохранитель: любой throw в рендере локализуется здесь, а не обнуляет
// всё приложение белым экраном. React требует для этого класс (хук-аналога нет)
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };

  static getDerivedStateFromError(): { crashed: boolean } {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("app crashed:", error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.crashed) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
        <p className="font-display text-[clamp(4rem,20vw,10rem)] uppercase leading-none tracking-tight text-blood">
          Error
        </p>
        <h1 className="mt-4 font-display text-2xl uppercase tracking-tight sm:text-4xl">
          Something broke
        </h1>
        <div className="my-6 h-0.5 w-24 bg-blood" />
        <a
          href="/"
          className="mt-4 inline-block bg-blood px-8 py-4 font-mono text-sm uppercase tracking-widest text-paper transition hover:bg-paper hover:text-ink"
        >
          Return to the record →
        </a>
      </div>
    );
  }
}
