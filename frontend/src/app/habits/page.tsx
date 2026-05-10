'use client';

import { useState, useEffect } from 'react';
import { habitsApi } from '@/lib/api';
import { HabitWithStatus, TodayHabitsResponse, Habit } from '@/lib/types';
import { Plus, Flame, Trophy, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

export default function HabitsPage() {
  const [todayData, setTodayData] = useState<TodayHabitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCue, setNewHabitCue] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState(7);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    loadToday();
  }, []);

  async function loadToday() {
    try {
      const res = await habitsApi.today();
      setTodayData(res.data);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleHabit(habitId: string, currentlyDone: boolean) {
    setToggling(habitId);
    try {
      await habitsApi.log(habitId, { completed: !currentlyDone });
      await loadToday();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    } finally {
      setToggling(null);
    }
  }

  async function createHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      await habitsApi.create({
        name: newHabitName.trim(),
        cue: newHabitCue.trim() || undefined,
        target_per_wk: newHabitTarget,
      });
      setNewHabitName('');
      setNewHabitCue('');
      setNewHabitTarget(7);
      setShowForm(false);
      loadToday();
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  }

  // Find best streak among all habits
  const bestStreak = todayData?.habits.reduce((max, h) => Math.max(max, h.current_streak), 0) ?? 0;
  const currentStreak = bestStreak; // simplified for V1
  const weeklyPct = todayData
    ? todayData.total_count > 0
      ? Math.round((todayData.completed_count / todayData.total_count) * 100)
      : 0
    : 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="page-header">
          <h1 className="page-title">Habits</h1>
        </div>
        <div className="metric-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 90 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 250 }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">Today&apos;s checklist — build consistency</p>
        </div>
        <div className={styles.headerRight}>
          {todayData && (
            <span className="chip chip-active">
              {todayData.completed_count} / {todayData.total_count} today
            </span>
          )}
          <button className="btn btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            Today
          </div>
          <div className="metric-value">{weeklyPct}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">
            <Trophy size={12} style={{ display: 'inline', marginRight: 4 }} />
            Best Streak
          </div>
          <div className="metric-value">{bestStreak}d</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">
            <Flame size={12} style={{ display: 'inline', marginRight: 4 }} />
            Current
          </div>
          <div className="metric-value">{currentStreak}d</div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={createHabit} className={styles.addForm}>
          <input
            className="input"
            placeholder="Habit name (e.g. Read 20 min)"
            value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            placeholder="Cue (optional) — e.g. After morning coffee"
            value={newHabitCue}
            onChange={e => setNewHabitCue(e.target.value)}
          />
          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              Target per week:
              <select
                className="input"
                value={newHabitTarget}
                onChange={e => setNewHabitTarget(Number(e.target.value))}
                style={{ maxWidth: 80, marginLeft: 8 }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>{n}x</option>
                ))}
              </select>
            </label>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Create</button>
            </div>
          </div>
        </form>
      )}

      {/* Habit Checklist */}
      <div className="card">
        {!todayData || todayData.habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            <div className="empty-state-text">No habits yet — create your first one above</div>
          </div>
        ) : (
          todayData.habits.map(habit => (
            <div key={habit.id} className={styles.habitRow}>
              <div className={styles.habitInfo}>
                <span className={styles.habitName}>{habit.name}</span>
                {habit.current_streak > 0 && (
                  <span className={styles.streakBadge}>
                    <Flame size={11} />
                    {habit.current_streak}d
                  </span>
                )}
              </div>
              <div
                className={`habit-check ${habit.completed_today ? 'done' : ''} ${toggling === habit.id ? styles.toggling : ''}`}
                onClick={() => toggleHabit(habit.id, habit.completed_today)}
              >
                {habit.completed_today && (
                  <svg width="12" height="10" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
