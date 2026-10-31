export type PillarId = 'sleep' | 'move' | 'focus' | 'connect' | 'craft'

export type ViewId = 'dashboard' | 'goals' | 'lifestyle' | 'quests'

export interface Pillar {
  id: PillarId
  label: string
  blurb: string
  unit: string
  target: number
  color: string
}

export interface DayLog {
  date: string
  scores: Record<PillarId, number>
}

export interface Goal {
  id: string
  title: string
  pillar: PillarId
  xp: number
  doneToday: boolean
  totalCompletions: number
  targetPerWeek: number
}

export interface Badge {
  id: string
  title: string
  detail: string
  unlocked: boolean
}

export interface Quest {
  id: string
  title: string
  detail: string
  xp: number
  progress: number
  target: number
  claimed: boolean
}

export interface LifeState {
  name: string
  xp: number
  streak: number
  lastActiveDate: string | null
  goals: Goal[]
  week: DayLog[]
  badges: Badge[]
  quests: Quest[]
  entered: boolean
}
