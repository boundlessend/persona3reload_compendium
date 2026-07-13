// курируемая справка по арканам P3R: привязка к Social Link (confidant) выверена
// по гайдам (rpgsite/game8). Fool/Death/Judgement растут по сюжету автоматически,
// Aeon (Aigis) добавлен в дополнении Episode Aigis. Ключи - значения persona.arcana
export type ArcanaEntry = { confidant: string; blurb: string };

export const ARCANA_GUIDE: Record<string, ArcanaEntry> = {
  Fool: {
    confidant: "S.E.E.S. / the protagonist",
    blurb:
      "Arcana of beginnings and boundless potential. In Persona 3 Reload it belongs to the protagonist and the founding of S.E.E.S.",
  },
  Magician: {
    confidant: "Kenji Tomochika",
    blurb:
      "Arcana of creation and initiative. Bonded through Kenji Tomochika, a classmate chasing an older woman's affection.",
  },
  Priestess: {
    confidant: "Fuuka Yamagishi",
    blurb:
      "Arcana of intuition and hidden knowledge. Bonded through Fuuka Yamagishi, S.E.E.S.'s gentle navigator.",
  },
  Empress: {
    confidant: "Mitsuru Kirijo",
    blurb:
      "Arcana of abundance and command. Bonded through Mitsuru Kirijo, the composed leader of the group.",
  },
  Emperor: {
    confidant: "Hidetoshi Odagiri",
    blurb:
      "Arcana of structure and authority. Bonded through Hidetoshi Odagiri of the Student Council.",
  },
  Hierophant: {
    confidant: "Bunkichi and Mitsuko",
    blurb:
      "Arcana of tradition and guidance. Bonded through Bunkichi and Mitsuko, the kindly bookshop couple.",
  },
  Lovers: {
    confidant: "Yukari Takeba",
    blurb:
      "Arcana of union and choice. Bonded through Yukari Takeba, an early member of S.E.E.S.",
  },
  Chariot: {
    confidant: "Kazushi Miyamoto",
    blurb:
      "Arcana of willpower and drive. Bonded through Kazushi Miyamoto, an athlete pushing through injury.",
  },
  Justice: {
    confidant: "Chihiro Fushimi",
    blurb:
      "Arcana of balance and truth. Bonded through Chihiro Fushimi of the Student Council.",
  },
  Hermit: {
    confidant: "Maya",
    blurb:
      "Arcana of solitude and introspection. Bonded through Maya, a friend met only inside an online game.",
  },
  Fortune: {
    confidant: "Keisuke Hiraga",
    blurb:
      "Arcana of fate and change. Bonded through Keisuke Hiraga as he questions the path laid out for him.",
  },
  Strength: {
    confidant: "Yuko Nishiwaki",
    blurb:
      "Arcana of inner resolve. Bonded through Yuko Nishiwaki, manager of the school's sports teams.",
  },
  Hanged: {
    confidant: "Maiko Oohashi",
    blurb:
      "Arcana of suspension and sacrifice. Bonded through Maiko Oohashi, a lonely young girl.",
  },
  Death: {
    confidant: "Pharos / Ryoji Mochizuki",
    blurb:
      "Arcana of endings and transformation. Tied to Pharos, the boy later known as Ryoji Mochizuki; ranks up through the story.",
  },
  Temperance: {
    confidant: "Andre 'Bebe' Roland Jean Geraux",
    blurb:
      "Arcana of harmony and moderation. Bonded through Bebe, a foreign student devoted to Japanese craft.",
  },
  Devil: {
    confidant: "President Tanaka",
    blurb:
      "Arcana of temptation and materialism. Bonded through the notorious President Tanaka of the shopping program.",
  },
  Tower: {
    confidant: "Mutatsu",
    blurb:
      "Arcana of upheaval and sudden change. Bonded through Mutatsu, a monk drinking away his regrets.",
  },
  Star: {
    confidant: "Mamoru Hayase",
    blurb:
      "Arcana of hope and aspiration. Bonded through Mamoru Hayase, a track athlete carrying his family.",
  },
  Moon: {
    confidant: "Nozomi Suemitsu",
    blurb:
      "Arcana of illusion and the unconscious. Bonded through Nozomi Suemitsu, the self-styled Gourmet King.",
  },
  Sun: {
    confidant: "Akinari Kamiki",
    blurb:
      "Arcana of vitality and clarity. Bonded through Akinari Kamiki, a frail youth writing his own story.",
  },
  Judgement: {
    confidant: "The bond of S.E.E.S.",
    blurb:
      "Arcana of reckoning and resolve. The bond uniting all of S.E.E.S. against Nyx; ranks up through the story.",
  },
  Aeon: {
    confidant: "Aigis",
    blurb:
      "Arcana of awakening and new cycles. Bonded through Aigis, the anti-Shadow android (added in the Episode Aigis expansion).",
  },
};

// арканы, чья ultimate-персона открывается по сюжету, а не Rank 10 конфиданта
// (сверено 2+ источника). Саму ultimate-персону выводим как топ-персону арканы
// без DLC - для P3R это совпадает с проверенным списком по всем 22 арканам
const STORY_ULTIMATE: Record<string, string> = {
  Fool: "Unlocked through the story, after maxing every Social Link.",
  Death: "Unlocked automatically through the story.",
  Judgement: "Unlocked through the story, on the true-ending route.",
  Aeon: "Added in the Episode Aigis expansion.",
};

// как открывается ultimate-персона арканы
export function ultimateUnlock(arcana: string, confidant: string): string {
  return STORY_ULTIMATE[arcana] ?? `Reach Rank 10 with ${confidant}.`;
}
