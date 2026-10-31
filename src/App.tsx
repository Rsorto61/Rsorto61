import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { PILLARS } from './data'
import type { ViewId } from './types'
import { useLifeStore } from './useLifeStore'
import './App.css'

export default function App() {
  const store = useLifeStore()
  const [view, setView] = useState<ViewId>('dashboard')
  const [name, setName] = useState('')

  if (!store.state.entered) {
    return (
      <div className="app-root">
        <Landing
          name={name}
          onName={setName}
          onEnter={() => store.enter(name)}
        />
      </div>
    )
  }

  return (
    <div className="app-root shell">
      <header className="topbar">
        <div className="topbar__brand">Cadence</div>
        <nav className="nav" aria-label="Primary">
          {(
            [
              ['dashboard', 'Dashboard'],
              ['goals', 'Goals'],
              ['lifestyle', 'Lifestyle'],
              ['quests', 'Quests'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-current={view === id ? 'page' : undefined}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="btn btn-soft" onClick={store.resetDemo}>
          Reset demo
        </button>
      </header>

      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'dashboard' && <Dashboard store={store} />}
            {view === 'goals' && <Goals store={store} />}
            {view === 'lifestyle' && <Lifestyle store={store} />}
            {view === 'quests' && <Quests store={store} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function Landing({
  name,
  onName,
  onEnter,
}: {
  name: string
  onName: (v: string) => void
  onEnter: () => void
}) {
  return (
    <section className="landing">
      <div className="landing__media" aria-hidden="true" />
      <div className="landing__grain" aria-hidden="true" />
      <div className="landing__content">
        <motion.div
          className="brand-mark"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span aria-hidden="true" />
          Cadence
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          Your life, kept in rhythm.
        </motion.h1>
        <motion.p
          className="landing__lede"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          Goals, lifestyle pillars, and a living dashboard that turns daily
          habits into visible progress.
        </motion.p>
        <motion.form
          className="landing__cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          onSubmit={(e) => {
            e.preventDefault()
            onEnter()
          }}
        >
          <label className="sr-only" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            className="name-field"
            placeholder="What should we call you?"
            value={name}
            onChange={(e) => onName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Open my dashboard
          </button>
        </motion.form>
      </div>
    </section>
  )
}

type Store = ReturnType<typeof useLifeStore>

function Dashboard({ store }: { store: Store }) {
  const chartData = store.state.week.map((d) => ({
    day: format(parseISO(d.date), 'EEE'),
    score: Math.round(
      Object.values(d.scores).reduce((a, b) => a + b, 0) /
        Object.values(d.scores).length,
    ),
  }))

  const latest = store.state.week[store.state.week.length - 1]

  return (
    <section>
      <header className="section-head">
        <span className="eyebrow">Today for {store.state.name}</span>
        <h2>Life dashboard</h2>
        <p>
          One score for the day you are living — powered by sleep, movement,
          focus, connection, and craft.
        </p>
      </header>

      <div className="dash-hero">
        <div className="score-block">
          <motion.div
            key={store.score}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <h3>{store.score}</h3>
          </motion.div>
          <div className="meta">
            <span>Life score</span>
            <span>{store.state.streak}-day streak</span>
            <span>
              {store.state.goals.filter((g) => g.doneToday).length}/
              {store.state.goals.length} goals today
            </span>
          </div>
        </div>

        <div className="xp-panel">
          <div className="xp-row">
            <strong>Level {store.level.level}</strong>
            <span>
              {store.level.into}/{store.level.next} XP
            </span>
          </div>
          <div className="meter" aria-label="XP progress">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${store.level.pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>Weekly pulse</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3d6b5a" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#3d6b5a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(21,32,28,0.08)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(21,32,28,0.12)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3d6b5a"
                  strokeWidth={2.5}
                  fill="url(#pulse)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Pillar balance</h3>
          <div className="pillar-list">
            {PILLARS.map((p) => {
              const value = latest?.scores[p.id] ?? 0
              return (
                <div className="pillar-row" key={p.id}>
                  <span>{p.label}</span>
                  <div className="bar">
                    <motion.i
                      style={{ background: p.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.7, delay: 0.05 }}
                    />
                  </div>
                  <span>{value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="badge-rail">
        {store.state.badges.map((b) => (
          <article
            className="badge"
            key={b.id}
            data-locked={!b.unlocked}
            aria-label={`${b.title}${b.unlocked ? '' : ' (locked)'}`}
          >
            <strong>{b.title}</strong>
            <p>{b.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Goals({ store }: { store: Store }) {
  return (
    <section>
      <header className="section-head">
        <span className="eyebrow">Daily commitments</span>
        <h2>Goals</h2>
        <p>
          Check in to earn XP. Completing goals also advances related quests
          and protects your streak.
        </p>
      </header>

      <div className="goal-list">
        {store.state.goals.map((g) => {
          const pillar = PILLARS.find((p) => p.id === g.pillar)
          return (
            <article className="goal" key={g.id} data-done={g.doneToday}>
              <div>
                <h3>{g.title}</h3>
                <div className="tags">
                  <span className="tag">{pillar?.label}</span>
                  <span className="tag">+{g.xp} XP</span>
                  <span className="tag">
                    {g.totalCompletions} total · {g.targetPerWeek}/wk aim
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={g.doneToday ? 'btn btn-soft' : 'btn btn-ink'}
                disabled={g.doneToday}
                onClick={() => store.completeGoal(g.id)}
              >
                {g.doneToday ? 'Done today' : 'Complete'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Lifestyle({ store }: { store: Store }) {
  const latest = store.state.week[store.state.week.length - 1]

  return (
    <section>
      <header className="section-head">
        <span className="eyebrow">Five pillars</span>
        <h2>Lifestyle</h2>
        <p>
          Drag each dial to log how today feels. Small updates reshape your
          life score and weekly pulse.
        </p>
      </header>

      <div className="pillar-grid">
        {PILLARS.map((p) => {
          const value = latest?.scores[p.id] ?? 50
          return (
            <article className="pillar-pad" key={p.id}>
              <h3>{p.label}</h3>
              <p>{p.blurb}</p>
              <div className="value" style={{ color: p.color }}>
                {value}
              </div>
              <label className="sr-only" htmlFor={`pillar-${p.id}`}>
                {p.label} score
              </label>
              <input
                id={`pillar-${p.id}`}
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) =>
                  store.setPillarScore(p.id, Number(e.target.value))
                }
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Quests({ store }: { store: Store }) {
  return (
    <section>
      <header className="section-head">
        <span className="eyebrow">Gamification</span>
        <h2>Quests & rewards</h2>
        <p>
          Longer arcs on top of daily goals. Finish the objective, claim the
          XP, unlock the next rhythm.
        </p>
      </header>

      <div className="quest-list">
        {store.state.quests.map((q) => {
          const ready = q.progress >= q.target && !q.claimed
          const pct = Math.min(100, (q.progress / q.target) * 100)
          return (
            <article className="quest" key={q.id}>
              <div>
                <h3>{q.title}</h3>
                <p>{q.detail}</p>
                <div className="meter" aria-label={`${q.title} progress`}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <p className="empty-note">
                  {q.progress}/{q.target}
                  {q.claimed ? ' · claimed' : ` · +${q.xp} XP`}
                </p>
              </div>
              <button
                type="button"
                className={ready ? 'btn btn-primary' : 'btn btn-soft'}
                disabled={!ready}
                onClick={() => store.claimQuest(q.id)}
              >
                {q.claimed ? 'Claimed' : ready ? 'Claim XP' : 'In progress'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
