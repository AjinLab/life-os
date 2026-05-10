'use client';

import { useEffect, useState } from 'react';
import { homeApi, tasksApi, habitsApi } from '@/lib/api';
import { DashboardResponse } from '@/lib/types';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [d, setD] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await homeApi.dashboard();
      setD(res.data);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  async function toggleTask(taskId: number, current: string) {
    try {
      await tasksApi.update(taskId, { status: current === 'done' ? 'todo' : 'done' });
      load();
    } catch { /* empty */ }
  }

  async function toggleHabit(habitId: string, done: boolean) {
    try {
      await habitsApi.log(habitId, { completed: !done });
      load();
    } catch { /* empty */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="skeleton" style={{ width: 260, height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 24 }} />
        <div className="metric-row">
          {[1,2,3].map(i => <div key={i} className="metric-card"><div className="skeleton" style={{height:40}}/></div>)}
        </div>
        <div className="skeleton" style={{ height: 60, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (!d) return <div className={styles.page}><div className="empty-state"><div className="empty-state-title">Could not load dashboard</div></div></div>;

  const pendingTasks = d.today_tasks.filter(t => t.status !== 'done');
  const doneTasks = d.today_tasks.filter(t => t.status === 'done');

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{d.greeting}</h1>
          <p className={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={styles.weekChip}>{d.day_label}</span>
      </div>

      {/* Metric cards — joined, no gaps */}
      <div className="metric-row">
        <div className="metric-card">
          <div className="metric-value">{d.completion_pct}%</div>
          <div className="metric-label">Today</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{d.weekly_score ?? '—'}</div>
          <div className="metric-label">Week Score</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{d.current_streak}d</div>
          <div className="metric-label">Streak</div>
        </div>
      </div>

      {/* AI Banner */}
      <div className="ai-banner">
        <div className="ai-banner-label">AI · Today</div>
        <div className="ai-banner-text">{d.ai_nudge}</div>
        <Link href="/insights" className="ai-banner-link">See all insights →</Link>
      </div>

      {/* Today's priorities */}
      <div className={styles.section}>
        <div className="section-label">
          Today
          {pendingTasks.length > 0 && <span className="count-badge">{pendingTasks.length}</span>}
        </div>
        <div className="card">
          {d.today_tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-title">Nothing here yet.</div>
              <div className="empty-state-text">Add your first task in Plan.</div>
            </div>
          ) : (
            <>
              {pendingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-checkbox" onClick={() => toggleTask(task.id, task.status)}>
                  </div>
                  <span className="task-text">{task.title}</span>
                  {task.goal_id && <span className="task-tag">Goal</span>}
                </div>
              ))}
              {doneTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-checkbox done" onClick={() => toggleTask(task.id, task.status)}>
                    <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  <span className="task-text done">{task.title}</span>
                </div>
              ))}
            </>
          )}
        </div>
        <Link href="/plan" className="text-link" style={{ marginTop: 8, display: 'inline-block' }}>+ Add task</Link>
      </div>

      {/* Habits check-in strip */}
      <div className={styles.section}>
        <div className="section-label">Habits today</div>
        <div className={styles.habitStrip}>
          {d.habits_today.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <div className="empty-state-text">No habits tracked yet</div>
            </div>
          ) : (
            d.habits_today.map(h => (
              <div
                key={h.id}
                className={`${styles.habitChip} ${h.completed_today ? styles.habitChipDone : ''}`}
                onClick={() => toggleHabit(h.id, h.completed_today)}
              >
                <div className={`${styles.chipCircle} ${h.completed_today ? styles.chipCircleDone : ''}`}>
                  {h.completed_today && <svg width="8" height="6" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <span>{h.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <Link href="/capture" className="fab">+</Link>
    </div>
  );
}
