import { RACES, resultArcana } from "./fusion";

// 3-буквенные коды аркан для компактной 22x22 матрицы
const ABBR: Record<string, string> = {
  Fool: "Foo",
  Magician: "Mag",
  Priestess: "Pri",
  Empress: "Eps",
  Emperor: "Emp",
  Hierophant: "Hie",
  Lovers: "Lov",
  Chariot: "Cha",
  Justice: "Jus",
  Hermit: "Her",
  Fortune: "For",
  Strength: "Str",
  Hanged: "Han",
  Death: "Dea",
  Temperance: "Tem",
  Devil: "Dev",
  Tower: "Tow",
  Star: "Sta",
  Moon: "Moo",
  Sun: "Sun",
  Judgement: "Jud",
  Aeon: "Aeo",
};

// результат слияния двух аркан; диагональ (та же аркана) даёт персону той же
// арканы, поэтому показываем саму аркану
function cellResult(a: string, b: string): string | null {
  if (a === b) return a;
  return resultArcana(a, b);
}

// матрица слияния по арканам: строка + столбец = аркана результата.
// таблица нижнетреугольная и симметрична, поэтому показываем полный квадрат
export function FusionMatrix() {
  return (
    <section className="mt-20">
      <h2 className="font-mono text-sm tracking-[0.1em] text-blood">
        FUSION BY ARCANA
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-mut">
        Which arcana a normal two-persona fusion produces. Read a row and a
        column: their cell is the result arcana. The diagonal (same arcana)
        keeps the arcana and yields a lower persona of it.
      </p>

      <div className="mt-6 overflow-x-auto border-2 border-ink">
        <table className="border-collapse font-mono text-[10px] uppercase">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b-2 border-r-2 border-ink bg-paper2 p-1.5" />
              {RACES.map((name) => (
                <th
                  key={name}
                  title={name}
                  className="border-b-2 border-r border-ink/40 bg-paper2 p-1.5 font-bold text-blood"
                >
                  {ABBR[name]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RACES.map((row) => (
              <tr key={row}>
                <th
                  title={row}
                  className="sticky left-0 z-10 border-b border-r-2 border-ink bg-paper2 p-1.5 text-right font-bold text-blood"
                >
                  {ABBR[row]}
                </th>
                {RACES.map((col) => {
                  const result = cellResult(row, col);
                  const diagonal = row === col;
                  return (
                    <td
                      key={col}
                      title={
                        result
                          ? `${row} + ${col} = ${result}`
                          : `${row} + ${col}: no fusion`
                      }
                      className={`border-b border-r border-ink/15 p-1.5 text-center ${
                        diagonal
                          ? "bg-ink font-bold text-paper"
                          : "text-ink"
                      }`}
                    >
                      {result ? ABBR[result] : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
