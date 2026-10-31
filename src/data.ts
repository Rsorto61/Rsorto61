import type { Badge, Goal, LifeState, Pillar, Quest } from './types'
import { format, subDays } from 'date-fns'

export const PILLARS: Pillar[] = [
  {
    id: 'sleep',
    label: 'Sleep',
    blurb: 'Rest that restores tomorrow.',
    unit: 'hrs',
    target: 8,
    color: '#3D6B5A',
  },
  {
    id: 'move',
    label: 'Move',
    blurb: 'Minutes that wake the body.',
    unit: 'min',
    target: 45,
    color: '#C45C26',
  },
  {
    id: 'focus',
    label: 'Focus',
    blurb: 'Deep work without noise.',
    unit: 'blocks',
    target: 3,
    color: '#2A5F7A',
  },
  {
    id: 'connect',
    label: 'Connect',
    blurb: 'People who keep you human.',
    unit: 'touchpoints',
    target: 2,
    color: '#8B5E3C',
  },
  {
    id: 'craft',
    label: 'Craft',
    blurb: 'Making something that lasts.',
    unit: 'sessions',
    target: 1,
    color: '#5C6B3D',
  },
]

const today = () => format(new Date(), 'yyyy-MM-dd')

function seededWeek(): LifeState['week'] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    const wobble = (n: number) => Math.max(0, Math.min(100, n + ((i * 13) % 17) - 8))
    return {
      date,
      scores: {
        sleep: wobble(72),
        move: wobble(58),
        focus: wobble(64),
        connect: wobble(50),
        craft: wobble(40),
      },
    }
  })
}

const defaultGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Lights out by 11pm',
    pillar: 'sleep',
    xp: 40,
    doneToday: false,
    totalCompletions: 9,
    targetPerWeek: 5,
  },
  {
    id: 'g2',
    title: 'Morning walk or stretch',
    pillar: 'move',
    xp: 35,
    doneToday: false,
    totalCompletions: 12,
    targetPerWeek: 5,
  },
  {
    id: 'g3',
    title: '90-minute deep work block',
    pillar: 'focus',
    xp: 50,
    doneToday: false,
    totalCompletions: 7,
    targetPerWeek: 4,
  },
  {
    id: 'g4',
    title: 'Call or meet someone I care about',
    pillar: 'connect',
    xp: 45,
    doneToday: false,
    totalCompletions: 4,
    targetPerWeek: 3,
  },
  {
    id: 'g5',
    title: 'Ship one creative session',
    pillar: 'craft',
    xp: 55,
    doneToday: false,
    totalCompletions: 6,
    targetPerWeek: 3,
  },
]

const defaultBadges: Badge[] = [
  {
    id: 'b1',
    title: 'First Spark',
    detail: 'Complete any goal once.',
    unlocked: true,
  },
  {
    id: 'b2',
    title: 'Three-Day Flame',
    detail: 'Hold a 3-day streak.',
    unlocked: true,
  },
  {
    id: 'b3',
    title: 'Balanced Week',
    detail: 'Score 60+ across every pillar.',
    unlocked: false,
  },
  {
    id: 'b4',
    title: 'Level 5 Cadence',
    detail: 'Reach level 5.',
    unlocked: false,
  },
  {
    id: 'b5',
    title: 'Craft Keeper',
    detail: 'Log craft 10 times.',
    unlocked: false,
  },
]

const defaultQuests: Quest[] = [
  {
    id: 'q1',
    title: 'Morning Ritual',
    detail: 'Complete Move before noon three times.',
    xp: 120,
    progress: 1,
    target: 3,
    claimed: false,
  },
  {
    id: 'q2',
    title: 'Quiet Mind',
    detail: 'Finish four Focus sessions this week.',
    xp: 150,
    progress: 2,
    target: 4,
    claimed: false,
  },
  {
    id: 'q3',
    title: 'Social Gravity',
    detail: 'Hit Connect goal twice.',
    xp: 100,
    progress: 0,
    target: 2,
    claimed: false,
  },
]

export function createInitialState(): LifeState {
  return {
    name: 'You',
    xp: 860,
    streak: 4,
    lastActiveDate: today(),
    goals: defaultGoals,
    week: seededWeek(),
    badges: defaultBadges,
    quests: defaultQuests,
    entered: false,
  }
}

export const STORAGE_KEY = 'cadence-life-v1'

export function xpToLevel(xp: number) {
  const level = Math.floor(xp / 250) + 1
  const into = xp % 250
  return { level, into, next: 250, pct: (into / 250) * 100 }
}

export function lifeScore(week: LifeState['week']) {
  const latest = week[week.length - 1]
  if (!latest) return 0
  const values = Object.values(latest.scores)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}
