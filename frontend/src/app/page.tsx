'use client';

import { useEffect, useState } from 'react';
import { homeApi, tasksApi } from '@/lib/api';
import { DashboardResponse } from '@/lib/types';
import { Sparkles, ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await homeApi.dashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(taskId: number, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await tasksApi.update(taskId, { status: newStatus });
      loadDashboard();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.headerSkeleton}>
          <div className="skeleton" style={{ width: 280, height: 36 }} />
          <div className="skeleton" style={{ width: 120, height: 24, marginTop: 8 }} />
        </div>
        <div className="metric-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 90 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className={styles.container}>
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <div className="empty-state-text">Could not load dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{dashboard.greeting}</h1>
          <p className={styles.dayLabel}>{dashboard.day_label}</p>
        </div>
        {dashboard.inbox_count > 0 && (
          <Link href="/capture" className={styles.inboxBadge}>
            <Inbox size={14} />
            <span>{dashboard.inbox_count} inbox</span>
          </Link>
        )}
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Today</div>
          <div className="metric-value">{dashboard.completion_pct}%</div>
          <div className={styles.metricSub}>
            {dashboard.tasks_completed_today}/{dashboard.tasks_total_today} tasks
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Weekly Score</div>
          <div className="metric-value">{dashboard.weekly_score ?? '—'}</div>
          <div className={styles.metricSub}>out of 10</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Streak</div>
          <div className="metric-value">{dashboard.current_streak}d</div>
          <div className={styles.metricSub}>best: {dashboard.best_streak}d</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Today's Priorities */}
        <div className="card">
          <div className="flex-between mb-sm">
            <div className="card-title">Today&apos;s priorities</div>
            <Link href="/plan" className="btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {dashboard.today_tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <div className="empty-state-text">No tasks yet. Add some in Plan!</div>
            </div>
          ) : (
            dashboard.today_tasks.slice(0, 5).map(task => (
              <div key={task.id} className="task-item">
                <div
                  className={`task-checkbox ${task.status === 'done' ? 'done' : ''}`}
                  onClick={() => toggleTask(task.id, task.status)}
                >
                  {task.status === 'done' && (
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className={`task-text ${task.status === 'done' ? 'done' : ''}`}>
                  {task.title}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Habits Today */}
        <div className="card">
          <div className="flex-between mb-sm">
            <div className="card-title">Habits</div>
            <Link href="/habits" className="btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {dashboard.habits_today.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <div className="empty-state-text">No habits tracked yet</div>
            </div>
          ) : (
            dashboard.habits_today.map(habit => (
              <div key={habit.id} className="habit-item">
                <span className="habit-name">{habit.name}</span>
                <div className={`habit-check ${habit.completed_today ? 'done' : ''}`}>
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

        {/* Goals */}
        <div className="card">
          <div className="card-title">Active Goals</div>
          {dashboard.active_goals.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <div className="empty-state-text">Set goals in Plan to get started</div>
            </div>
          ) : (
            dashboard.active_goals.map(goal => (
              <div key={goal.id} style={{ marginBottom: '0.75rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{goal.title}</span>
                  <span className={`badge ${goal.progress >= 60 ? 'badge-success' : goal.progress >= 30 ? 'badge-warning' : 'badge-danger'}`}>
                    {goal.progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${goal.progress >= 60 ? 'progress-fill-success' : goal.progress >= 30 ? 'progress-fill-warning' : 'progress-fill-accent'}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Nudge */}
        <div className="ai-card">
          <Sparkles size={16} className="ai-card-icon" />
          <div className="ai-card-text">{dashboard.ai_nudge}</div>
        </div>
      </div>
    </div>
  );
}
