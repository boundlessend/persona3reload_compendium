// справочник Theurgy напарников P3R: у каждого свой навык, у большинства он
// эволюционирует в усиленную версию после пробуждения ultimate-персоны.
// компаньоны - не персоны (их нет в personas.json), поэтому раздел статичный.
// данные сверены по 2+ источникам (Dexerto, Samurai Gamers, TheGamer, GameFAQs).
type PartyTheurgySkill = { member: string; base: string; evolved?: string };

const PARTY_THEURGY: PartyTheurgySkill[] = [
  { member: "Yukari", base: "Cyclone Arrow", evolved: "Tranquility" },
  { member: "Junpei", base: "Hack n' Blast", evolved: "Blaze of Life" },
  { member: "Akihiko", base: "Lightning Spike", evolved: "Electric Onslaught" },
  { member: "Mitsuru", base: "Blizzard Edge", evolved: "Blade of Execution" },
  { member: "Fuuka", base: "Oracle", evolved: "Revelation" },
  { member: "Aigis", base: "Orgia Mode", evolved: "Maximum Firepower" },
  { member: "Ken", base: "Divine Retribution", evolved: "Divine Intervention" },
  { member: "Koromaru", base: "Hound of Hades / Power Howling" },
  { member: "Shinjiro", base: "Bleeding Fury" },
];

export function PartyTheurgy() {
  return (
    <section className="mt-20">
      <h2 className="font-mono text-sm tracking-[0.1em] text-blood">
        PARTY THEURGY
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-mut">
        Every party member has their own Theurgy skill. For most, it evolves
        into a stronger version once they awaken their ultimate persona.
      </p>
      <div className="mt-6 grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
        {PARTY_THEURGY.map(({ member, base, evolved }) => (
          <div
            key={member}
            className="flex flex-col gap-1.5 border-b-2 border-r-2 border-ink bg-card p-4"
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
              {member}
            </span>
            <span className="font-display text-lg uppercase leading-none break-words">
              {base}
            </span>
            {evolved && (
              <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
                {"→ "}
                {evolved}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
