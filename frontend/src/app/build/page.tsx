'use client';

import { useState, useEffect } from 'react';
import { habitsApi } from '@/lib/api';
import { HabitWithStatus, TodayHabitsResponse } from '@/lib/types';
import { Plus } from 'lucide-react';
import styles from './page.module.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BuildPage() {
  const [data, setData] = useState<TodayHabitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [justChecked, setJustChecked] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const r = await habitsApi.today(); setData(r.data); } catch {} finally { setLoading(false); }
  }

  async function toggle(id: string, done: boolean) {
    setJustChecked(id);
    try { await habitsApi.log(id, { completed: !done }); await load(); } catch {}
    setTimeout(() => setJustChecked(null), 400);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await habitsApi.create({ name: name.trim(), target_per_wk: 7 });
    setName(''); setShowForm(false); load();
  }

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0

  if (loading) return (
    <div className={styles.page}>
      <div style={{fontSize:20,fontWeight:600,marginBottom:24}}>Build</div>
      <div className="skeleton" style={{height:300}} />
    </div>
  );

  const pct = data && data.total_count > 0 ? Math.round(data.completed_count / data.total_count * 100) : 0;
  const bestStreak = data?.habits.reduce((m, h) => Math.max(m, h.current_streak), 0) ?? 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Build</h1>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>This week: {pct}%</span>
      </div>

      {/* Habits Today */}
      <div className={styles.section}>
        <div className="section-label">
          Habits · Today
          {data && <span className="count-badge">{data.completed_count}/{data.total_count} done</span>}
        </div>

        <div className="card">
          {!data || data.habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No habits set up.</div>
              <div className="empty-state-text">Add your first habit to start building.</div>
            </div>
          ) : (
            data.habits.map(h => (
              <div key={h.id} className={`habit-row ${h.completed_today ? 'checked' : ''}`}>
                <div className="habit-info">
                  <span className="habit-name">{h.name}</span>
                  {h.current_streak > 0 && <span className="habit-streak">🔥 {h.current_streak}d</span>}
                </div>
                <div
                  className={`habit-check-circle ${h.completed_today ? 'done' : ''} ${justChecked === h.id ? 'just-checked' : ''}`}
                  onClick={() => toggle(h.id, h.completed_today)}
                >
                  {h.completed_today && (
                    <svg width="12" height="10" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showForm ? (
          <form onSubmit={create} className={styles.addForm}>
            <input className="input" placeholder="Habit name..." value={name} onChange={e => setName(e.target.value)} autoFocus />
            <button type="submit" className="btn btn-primary btn-sm">Add</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        ) : (
          <p className="text-link" style={{ marginTop: 8 }} onClick={() => setShowForm(true)}>+ Add habit</p>
        )}
      </div>

      {/* Week Heatmap */}
      {data && data.habits.length > 0 && (
        <div className={styles.section}>
          <div className="section-label">Week heatmap</div>
          <div className={styles.heatmapWrap}>
            {/* Header row */}
            <div className={styles.heatmapRow}>
              <div className={styles.heatmapName} />
              {days.map((d, i) => (
                <div key={d} className={`heatmap-label ${i === todayIdx ? styles.todayLabel : ''}`}>{d}</div>
              ))}
            </div>
            {/* Habit rows */}
            {data.habits.map(h => (
              <div key={h.id} className={styles.heatmapRow}>
                <div className={styles.heatmapName}>{h.name.slice(0, 10)}</div>
                {days.map((_, i) => {
                  const isToday = i === todayIdx;
                  const isPast = i < todayIdx;
                  const isDone = isToday ? h.completed_today : false; // Only have today's data in V1
                  return (
                    <div
                      key={i}
                      className={`heatmap-cell ${isDone ? 'done' : isPast ? 'missed' : 'future'} ${isToday ? 'today' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              {pct}% consistency today
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="metric-row">
        <div className="metric-card">
          <div className="metric-value">{pct}%</div>
          <div className="metric-label">Today</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{bestStreak}d</div>
          <div className="metric-label">Best Streak</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{data?.completed_count ?? 0}</div>
          <div className="metric-label">Done Today</div>
        </div>
      </div>
    </div>
  );
}
