// общий баннер ошибки загрузки: одинаковый стиль на всех страницах-каталогах
export function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-10 border-2 border-blood bg-blood/10 p-5 font-mono text-sm text-blood"
    >
      {message} Try refreshing the page.
    </p>
  );
}
