import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCompletedDays,
  resetSevenDayPlan,
  toggleDayComplete,
} from '../utils/sevenDayPlan';

const sections = [
  {
    title: 'Core Foundation: How to Live',
    points: [
      'Live with dharma: choose actions that protect life, truth, trust, and long-term harmony.',
      'Hold inner discipline and outer responsibility together - spiritual growth is not separate from daily conduct.',
      'Treat learning as a lifelong practice: study, reflection, self-correction, and service must move together.',
      'Seek balance among the four aims of life: dharma, artha, kama, and moksha - no single aim should destroy the others.'
    ]
  },
  {
    title: 'Living and Working with Nature',
    points: [
      'See nature as sacred relationship, not raw resource: earth, water, plants, and animals are part of one living order.',
      'Consume mindfully: take what is needed, reduce waste, repair before replacing, and avoid excess as a way of life.',
      'Build rhythms around ecological awareness: food seasonality, local stewardship, and care for shared commons.',
      'Practice gratitude and reciprocity: what is taken from nature should be restored through protection and regeneration.'
    ]
  },
  {
    title: 'How to Treat Other People',
    points: [
      'Practice ahimsa in speech, behavior, and systems: avoid harm, humiliation, and exploitation.',
      'Speak satya with compassion - truth should clarify and heal, not become a weapon.',
      'Respect dignity across differences of class, caste, gender, belief, and background; exclusion is a failure of dharma.',
      'Serve before status: leadership in dharmic terms means responsibility, restraint, and protection of the vulnerable.'
    ]
  },
  {
    title: 'Work, Wealth, and Responsibility',
    points: [
      'Earn through right means: work should create value without destroying people, community, or ecology.',
      'Use wealth as stewardship, not possession: support family duties, social welfare, learning, and public good.',
      'Do your svadharma (right responsibility) with excellence and humility, without attachment to ego-driven outcomes.',
      'Treat every profession as service when done with integrity, fairness, and accountability.'
    ]
  },
  {
    title: 'Daily Practice Framework',
    points: [
      'Begin the day with centering (silence, prayer, mantra, reflection) before entering activity and noise.',
      'Keep one discipline for body, one for mind, one for character, and one for contribution every day.',
      'Review actions nightly: where did I act with clarity, where with ego, where with fear, and what will I refine tomorrow?',
      'Anchor community life in festivals, shared meals, intergenerational learning, and collective service.'
    ]
  },
];

const keyMessages = [
  'Spirituality is measured by conduct, not only belief.',
  'Freedom without responsibility creates disorder; dharma binds freedom to care.',
  'Real progress joins personal awakening with social and ecological responsibility.',
  'The highest practice is to reduce suffering and increase dignity for all beings.'
];

const sevenDayPlan = [
  {
    id: 0,
    day: 'Day 1 - Awareness and Intention',
    focus: 'Set your dharmic direction.',
    actions: [
      'Begin with 10 minutes of silence or mantra and set one clear intention: “Today I will reduce harm.”',
      'Write down 3 values you want to live by this week: truth, compassion, discipline, service, or integrity.',
      'End the day with a short reflection: where did your actions match your intention and where did they drift?'
    ]
  },
  {
    id: 1,
    day: 'Day 2 - Speech and Relationships',
    focus: 'Practice ahimsa and satya in communication.',
    actions: [
      'Pause before speaking in difficult moments and choose clarity over reaction.',
      'Avoid one harmful habit for the day (gossip, sarcasm, blaming, or passive aggression).',
      'Make one relationship-healing action: apology, appreciation, or patient listening.'
    ]
  },
  {
    id: 2,
    day: 'Day 3 - Work as Seva',
    focus: 'Turn duty into service.',
    actions: [
      'Identify your core responsibility (svadharma) at work/home and complete it with full attention.',
      'Do one task with excellence without seeking praise or recognition.',
      'Offer one practical help to someone without expecting a return.'
    ]
  },
  {
    id: 3,
    day: 'Day 4 - Nature Alignment',
    focus: 'Live in reciprocity with the environment.',
    actions: [
      'Spend 20 minutes outdoors in mindful observation: sky, trees, wind, birds, water.',
      'Reduce one form of waste today (plastic, food waste, overconsumption, or unnecessary travel).',
      'Give back tangibly: plant, clean, conserve, or support a local ecological effort.'
    ]
  },
  {
    id: 4,
    day: 'Day 5 - Discipline and Energy',
    focus: 'Strengthen body-mind balance.',
    actions: [
      'Keep one body discipline (walk, yoga, stretching, or breathwork) for at least 20 minutes.',
      'Keep one mind discipline (scripture reading, focused study, or meditation) for at least 20 minutes.',
      'Reduce one source of distraction and redirect that time to learning or service.'
    ]
  },
  {
    id: 5,
    day: 'Day 6 - Community and Responsibility',
    focus: 'Expand from personal growth to collective good.',
    actions: [
      'Consciously practice equality and respect in every interaction, especially where bias may appear.',
      'Offer time, skill, or resources for a family/community need.',
      'Share one teaching with another person through conversation, not preaching.'
    ]
  },
  {
    id: 6,
    day: 'Day 7 - Integration and Renewal',
    focus: 'Review, integrate, and recommit.',
    actions: [
      'Review the full week: what changed in your thoughts, speech, behavior, and priorities?',
      'Pick 3 practices from the week to continue daily for the next 30 days.',
      'Close with gratitude and a renewed sankalpa (resolve) to live with dharma, compassion, and ecological care.'
    ]
  }
];

export default function LivingGuidePage() {
  const [completed, setCompleted] = useState(() => getCompletedDays());

  const progressPercent = useMemo(() => Math.round((completed.length / 7) * 100), [completed]);

  const onToggleDay = (dayId) => {
    setCompleted(toggleDayComplete(dayId));
  };

  const onResetWeek = () => {
    resetSevenDayPlan();
    setCompleted([]);
  };

  return (
    <section className="page-body wide living-guide-page">
      <div className="toolbox">
        <h1>Sanātana Dharma Living Guide</h1>
        <p>
          This page condenses the most important cross-topic teachings into practical guidance for life, work,
          ecology, and human relationships.
        </p>
      </div>

      <div className="summary-card living-highlight community-card">
        <h3>Community & place</h3>
        <p>
          Curated by <strong>Lakshmi Narayana Segu</strong>, with friends and seekers coming together across Europe and
          Switzerland—gathering around shared learning, seva, and life at the <strong>Farm House</strong>—to grow a
          grounded following of Sanātana Dharma in the EU and Swiss context: rooted in tradition, open to honest dialogue,
          and lived through nature, work, and neighbourly care.
        </p>
      </div>

      <div className="summary-card living-highlight">
        <h3>Essential Orientation</h3>
        <p>
          The central message is simple: live in a way that preserves harmony - within yourself, with other people,
          and with nature. Knowledge is meaningful only when translated into character, responsibility, and compassionate action.
        </p>
      </div>

      <div className="summary-grid">
        {sections.map((section) => (
          <section className="summary-card" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </section>
        ))}
      </div>

      <section className="summary-card">
        <h3>Key Messages to Remember</h3>
        <ul>
          {keyMessages.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="summary-card plan-intro-card">
        <h3>7-Day Practice Plan</h3>
        <p>Follow this as a practical weekly cycle. Repeat each week and gradually deepen each day.</p>
        <div className="plan-tracker-bar" aria-label="Week progress">
          <div className="plan-tracker-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="plan-tracker-meta">
          <span>{completed.length} of 7 days marked complete ({progressPercent}%)</span>
          <button type="button" className="plan-reset-btn" onClick={onResetWeek}>
            Reset week
          </button>
        </div>
      </section>

      <div className="plan-grid">
        {sevenDayPlan.map((day) => {
          const done = completed.includes(day.id);
          return (
            <section className={`summary-card day-card ${done ? 'day-card-done' : ''}`} key={day.id}>
              <div className="day-card-head">
                <label className="day-complete-label">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => onToggleDay(day.id)}
                    aria-label={`Mark ${day.day} complete`}
                  />
                  <span className="day-complete-text">{done ? 'Done' : 'Mark complete'}</span>
                </label>
                <h3>{day.day}</h3>
              </div>
              <p><strong>{day.focus}</strong></p>
              <ul>
                {day.actions.map((action) => <li key={action}>{action}</li>)}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="hero-actions" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
        <Link className="cta-button" to="/library">Go to Topic Library</Link>
        <Link className="cta-button ghost" to="/assistant">Ask AI Guide</Link>
      </div>
    </section>
  );
}
