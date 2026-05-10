const STOP_WORDS = new Set([
  'the', 'and', 'that', 'with', 'from', 'this', 'into', 'their', 'there', 'which', 'were', 'have', 'through',
  'about', 'these', 'while', 'where', 'when', 'what', 'been', 'also', 'they', 'them', 'than', 'then', 'over',
  'under', 'between', 'after', 'before', 'because', 'toward', 'across', 'many', 'such', 'more', 'most', 'some',
  'like', 'only', 'each', 'very', 'much', 'well', 'just', 'into', 'within', 'without', 'whose', 'those',
  'hindu', 'hinduism', 'sanatana', 'dharma', 'page', 'topic'
]);

const CATEGORY_PROFILES = {
  history: {
    lens: 'Civilizational Change Lens',
    overviewFocus: 'period shifts, continuity, institutional adaptation',
    storylineFocus: 'historical pressure, response, synthesis',
    messageSet: [
      'Historical change is framed as layered adaptation rather than rupture.',
      'Political and social disruptions repeatedly trigger theological creativity.',
      'Transmission survives by shifting forms: oral, textual, institutional, and devotional.',
      'The narrative treats memory as infrastructure for civilizational resilience.',
      'Reform movements are presented as internal renewals, not external replacements.',
      'The key takeaway is continuity-through-transformation across long time scales.'
    ]
  },
  vedas: {
    lens: 'Scriptural Foundation Lens',
    overviewFocus: 'revelation, ritual architecture, interpretive traditions',
    storylineFocus: 'hymn, ritual, interpretation',
    messageSet: [
      'The Vedic layer establishes vocabulary and ritual grammar for later thought.',
      'Ritual practice is shown as knowledge technology, not mere ceremony.',
      'Authority is distributed across recitation lineages and interpretive schools.',
      'Sound, memory, and precision are treated as sacred epistemic methods.',
      'Later philosophy is read as deepening, not negating, Vedic foundations.',
      'The lasting message is disciplined transmission of meaning across generations.'
    ]
  },
  upanishads: {
    lens: 'Interior Realization Lens',
    overviewFocus: 'self, consciousness, liberation, teacher-student inquiry',
    storylineFocus: 'question, insight, realization',
    messageSet: [
      'The center of gravity moves from outer ritual to inner realization.',
      'Dialogues frame truth as discovery through disciplined inquiry.',
      'Identity questions are treated existentially, not abstractly.',
      'Liberation is presented as transformed seeing, not informational gain.',
      'Language points beyond itself, requiring contemplative verification.',
      'The key message is direct knowing of ultimate identity and reality.'
    ]
  },
  philosophy: {
    lens: 'Argument and Method Lens',
    overviewFocus: 'reasoning systems, metaphysics, epistemology, practice pathways',
    storylineFocus: 'problem statement, model, method, implication',
    messageSet: [
      'Competing schools are presented as complementary tools for distinct questions.',
      'Method matters as much as conclusion in establishing valid knowledge.',
      'Philosophy is tied to practice outcomes, not detached speculation.',
      'Disagreement is constructive and drives conceptual precision.',
      'Ontology, ethics, and soteriology are interlinked throughout.',
      'The durable takeaway is methodological pluralism with practical orientation.'
    ]
  },
  culture: {
    lens: 'Lived Tradition Lens',
    overviewFocus: 'social forms, rituals, lifecycle ethics, embodied values',
    storylineFocus: 'norm, enactment, community continuity',
    messageSet: [
      'Cultural forms are treated as carriers of metaphysical and ethical meaning.',
      'Ritual marks transitions by converting events into responsibility.',
      'Community practices preserve memory while shaping identity.',
      'Daily disciplines are framed as subtle training of attention and character.',
      'Public celebrations function as distributed pedagogy.',
      'The key message is that worldview becomes durable through embodied practice.'
    ]
  },
  sciences: {
    lens: 'Knowledge Systems Lens',
    overviewFocus: 'applied sciences, arts, mathematics, architecture, ecology',
    storylineFocus: 'observation, systematization, application',
    messageSet: [
      'Scientific and artistic traditions are integrated with spiritual worldviews.',
      'Knowledge is validated through reproducible method and long continuity.',
      'Applied disciplines connect cosmology to practical life design.',
      'Innovation appears as refinement within inherited frameworks.',
      'Interdisciplinary thinking is a recurring civilizational strength.',
      'The key takeaway is integration of utility, meaning, and ethical orientation.'
    ]
  },
  epics: {
    lens: 'Narrative-Ethical Lens',
    overviewFocus: 'moral conflict, duty, devotion, political consequence',
    storylineFocus: 'crisis, counsel, action',
    messageSet: [
      'Epic narrative is used to stage ethical dilemmas at human scale.',
      'Dharma is shown as context-sensitive judgment under pressure.',
      'Devotion and duty are presented as mutually reinforcing.',
      'Characters embody competing virtues rather than simple binaries.',
      'Storytelling becomes a durable vehicle for moral education.',
      'The key message is ethical clarity through reflective engagement with conflict.'
    ]
  },
  default: {
    lens: 'Integrated Tradition Lens',
    overviewFocus: 'conceptual depth, practice, and transmission',
    storylineFocus: 'context, development, synthesis',
    messageSet: [
      'Knowledge is cumulative and layered across sections.',
      'Insight is expected to shape conduct and social organization.',
      'Institutional forms carry philosophical intentions forward.',
      'Plurality is treated as a generative force.',
      'Continuity and adaptation are held in dynamic balance.',
      'The key message is integrative living across thought and practice.'
    ]
  }
};

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function collectWordStats(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  const frequency = new Map();
  words.forEach((word) => {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  });

  return [...frequency.entries()].sort((a, b) => b[1] - a[1]);
}

function summarizeParagraph(paragraph, index, total, focus) {
  const cleaned = stripHtml(paragraph);
  const ranked = collectWordStats(cleaned).slice(0, 4).map(([word]) => word);
  const sentenceCount = Math.max(1, cleaned.split(/[.!?]+/).filter(Boolean).length);
  const sequence = index === 0 ? 'opens' : index === total - 1 ? 'concludes' : 'develops';

  if (ranked.length === 0) {
    return `Part ${index + 1} ${sequence} the argument with emphasis on ${focus}.`;
  }

  const keyCluster = ranked.join(', ');
  return `Part ${index + 1} ${sequence} the narrative around ${keyCluster}, framing ${focus} across about ${sentenceCount} focused moments.`;
}

export function buildTopicSummary({ page, category }) {
  const body = (page?.body ?? []).map(stripHtml).filter(Boolean);
  const combined = body.join(' ');
  const topKeywords = collectWordStats(combined).slice(0, 12).map(([word]) => word);
  const profile = CATEGORY_PROFILES[category?.id] ?? CATEGORY_PROFILES.default;

  const keywordLine = topKeywords.length
    ? topKeywords.slice(0, 7).join(', ')
    : 'ethics, practice, insight, transmission';

  const arc = body.slice(0, 8).map((paragraph, index) => summarizeParagraph(paragraph, index, body.length, profile.storylineFocus));

  const overview = [
    `${page.title} is interpreted through a ${profile.lens.toLowerCase()}, emphasizing ${profile.overviewFocus}.`,
    `The summary foregrounds how this topic turns abstract claims into durable frameworks for individual and collective life.`,
    `Across the narrative, recurring motifs such as ${keywordLine} are used to connect metaphysical vision, social forms, and practical discipline.`
  ];

  const storyline = [
    `The narrative begins by defining the stakes of this topic in its historical and conceptual setting (${page.period ?? 'multi-period context'}).`,
    `It then advances through a sequence of interpretive turns where key terms are expanded, contested, and reapplied to lived situations.`,
    `The conclusion consolidates a usable orientation: how to think, practice, and act once the topic's core insight is internalized.`
  ];

  const reflectionPrompts = [
    `Which interpretive turn most changes how you read the topic's core claim?`,
    `What practice or discipline is implied before the teaching becomes transformative?`,
    `How could these insights be translated into contemporary personal or social life?`
  ];

  return {
    lens: profile.lens,
    overview,
    storyline,
    arc,
    keyMessages: profile.messageSet,
    reflectionPrompts,
    themes: topKeywords.slice(0, 8),
  };
}
