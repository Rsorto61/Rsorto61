import { useEffect, useState } from 'react'
import { format, isYesterday, parseISO } from 'date-fns'
import {
  STORAGE_KEY,
  createInitialState,
  lifeScore,
  xpToLevel,
} from './data'
import type { LifeState, PillarId } from './types'

function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

function load(): LifeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    return { ...createInitialState(), ...JSON.parse(raw) }
  } catch {
    return createInitialState()
  }
}

export function useLifeStore() {
  const [state, setState] = useState<LifeState>(() => load())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const enter = (name: string) => {
    setState((s) => ({
      ...s,
      name: name.trim() || 'You',
      entered: true,
    }))
  }

  const leaveLanding = () => setState((s) => ({ ...s, entered: true }))

  const bumpStreak = (s: LifeState): LifeState => {
    const t = today()
    if (s.lastActiveDate === t) return s
    if (s.lastActiveDate && isYesterday(parseISO(s.lastActiveDate))) {
      return { ...s, streak: s.streak + 1, lastActiveDate: t }
    }
    return { ...s, streak: 1, lastActiveDate: t }
  }

  const completeGoal = (id: string) => {
    setState((s) => {
      const goal = s.goals.find((g) => g.id === id)
      if (!goal || goal.doneToday) return s
      let next = bumpStreak(s)
      next = {
        ...next,
        xp: next.xp + goal.xp,
        goals: next.goals.map((g) =>
          g.id === id
            ? {
                ...g,
                doneToday: true,
                totalCompletions: g.totalCompletions + 1,
              }
            : g,
        ),
        quests: next.quests.map((q) => {
          if (q.claimed) return q
          if (goal.pillar === 'move' && q.id === 'q1') {
            return { ...q, progress: Math.min(q.target, q.progress + 1) }
          }
          if (goal.pillar === 'focus' && q.id === 'q2') {
            return { ...q, progress: Math.min(q.target, q.progress + 1) }
          }
          if (goal.pillar === 'connect' && q.id === 'q3') {
            return { ...q, progress: Math.min(q.target, q.progress + 1) }
          }
          return q
        }),
      }
      next = refreshBadges(next)
      return next
    })
  }

  const setPillarScore = (pillar: PillarId, value: number) => {
    setState((s) => {
      const t = today()
      const week = s.week.map((d) =>
        d.date === t
          ? { ...d, scores: { ...d.scores, [pillar]: value } }
          : d,
      )
      const hasToday = week.some((d) => d.date === t)
      const nextWeek = hasToday
        ? week
        : [
            ...week.slice(1),
            {
              date: t,
              scores: {
                sleep: 50,
                move: 50,
                focus: 50,
                connect: 50,
                craft: 50,
                [pillar]: value,
              },
            },
          ]
      return refreshBadges(bumpStreak({ ...s, week: nextWeek, xp: s.xp + 8 }))
    })
  }

  const claimQuest = (id: string) => {
    setState((s) => {
      const quest = s.quests.find((q) => q.id === id)
      if (!quest || quest.claimed || quest.progress < quest.target) return s
      return refreshBadges({
        ...s,
        xp: s.xp + quest.xp,
        quests: s.quests.map((q) =>
          q.id === id ? { ...q, claimed: true } : q,
        ),
      })
    })
  }

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState(createInitialState())
  }

  const level = xpToLevel(state.xp)
  const score = lifeScore(state.week)

  return {
    state,
    level,
    score,
    enter,
    leaveLanding,
    completeGoal,
    setPillarScore,
    claimQuest,
    resetDemo,
  }
}

function refreshBadges(s: LifeState): LifeState {
  const level = xpToLevel(s.xp).level
  const craftGoal = s.goals.find((g) => g.pillar === 'craft')
  const latest = s.week[s.week.length - 1]
  const balanced =
    latest && Object.values(latest.scores).every((v) => v >= 60)

  return {
    ...s,
    badges: s.badges.map((b) => {
      if (b.id === 'b1') {
        return {
          ...b,
          unlocked: s.goals.some((g) => g.totalCompletions > 0),
        }
      }
      if (b.id === 'b2') return { ...b, unlocked: s.streak >= 3 }
      if (b.id === 'b3') return { ...b, unlocked: Boolean(balanced) }
      if (b.id === 'b4') return { ...b, unlocked: level >= 5 }
      if (b.id === 'b5') {
        return {
          ...b,
          unlocked: (craftGoal?.totalCompletions ?? 0) >= 10,
        }
      }
      return b
    }),
  }
}
