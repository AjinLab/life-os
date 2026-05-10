'use client';

import { useState, useEffect } from 'react';
import { reflectionsApi, aiApi, homeApi } from '@/lib/api';
import { Reflection, DashboardResponse } from '@/lib/types';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function ReviewPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [score, setScore] = useState(7);
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [focusNext, setFocusNext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [latestReflection, setLatestReflection] = useState<Reflection | null>(null);

  // View state
  const [view, setView] = useState<'new' | 'history'>('new');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reflRes, dashRes] = await Promise.all([
        reflectionsApi.list(),
        homeApi.dashboard(),
      ]);
      setReflections(reflRes.data);
      setDashboard(dashRes.data);
    } catch (err) {
      console.error('Failed to load review data:', err);
    } finally {
      setLoading(false);
    }
  }

  function getWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  async function submitReflection(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reflectionsApi.create({
        week_start: getWeekStart(),
        score,
        wins: wins || undefined,
        struggles: struggles || undefined,
        focus_next: focusNext || undefined,
      });
      setLatestReflection(res.data);
      setWins('');
      setStruggles('');
      setFocusNext('');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 409) {
        alert('A reflection for this week already exists!');
      } else {
        console.error('Failed to submit reflection:', err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function generateAISummary(reflectionId: string) {
    setGeneratingAI(true);
    try {
      const res = await aiApi.reflectionSummary(reflectionId);
      setLatestReflection(prev =>
        prev ? { ...prev, ai_summary: res.data.summary } : null
      );
      loadData();
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setGeneratingAI(false);
    }
  }

  const weekNum = Math.ceil(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
    (7 * 24 * 60 * 60 * 1000)
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="page-header">
          <h1 className="page-title">Weekly Review</h1>
        </div>
        <div className="metric-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 90 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Week {weekNum} Review</h1>
          <p className="page-subtitle">The compounding loop — reflect to grow</p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`pill-type ${view === 'new' ? 'active' : ''}`}
            onClick={() => setView('new')}
          >
            New Review
          </button>
          <button
            className={`pill-type ${view === 'history' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            History ({reflections.length})
          </button>
        </div>
      </div>

      {view === 'new' ? (
        <>
          {/* Week Metrics */}
          {dashboard && (
            <div className="metric-grid">
              <div className="metric-card">
                <div className="metric-label">Tasks Done</div>
                <div className="metric-value">
                  {dashboard.tasks_completed_today}/{dashboard.tasks_total_today}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Habits</div>
                <div className="metric-value">{dashboard.completion_pct}%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Inbox</div>
                <div className="metric-value">{dashboard.inbox_count}</div>
              </div>
            </div>
          )}

          {/* Review Form */}
          <form onSubmit={submitReflection}>
            {/* Score */}
            <div className="card mb-md">
              <div className="card-title">Rate this week (1–10)</div>
              <div className="score-slider">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className={styles.rangeInput}
                />
                <div className="score-value">{score}</div>
              </div>
              <div className={styles.scoreLabels}>
                <span>Rough</span>
                <span>Average</span>
                <span>Amazing</span>
              </div>
            </div>

            {/* Wins */}
            <div className="card mb-md">
              <div className="card-title">What went well?</div>
              <textarea
                className="textarea"
                placeholder="Highlight your wins this week..."
                value={wins}
                onChange={e => setWins(e.target.value)}
                rows={3}
              />
            </div>

            {/* Struggles */}
            <div className="card mb-md">
              <div className="card-title">What was challenging?</div>
              <textarea
                className="textarea"
                placeholder="What did you struggle with?"
                value={struggles}
                onChange={e => setStruggles(e.target.value)}
                rows={3}
              />
            </div>

            {/* Focus */}
            <div className="card mb-md">
              <div className="card-title">Focus for next week</div>
              <textarea
                className="textarea"
                placeholder="One thing to prioritize next week..."
                value={focusNext}
                onChange={e => setFocusNext(e.target.value)}
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {submitting ? 'Saving...' : 'Save Reflection'}
            </button>
          </form>

          {/* AI Summary */}
          {latestReflection && (
            <div className={styles.aiSection}>
              {latestReflection.ai_summary ? (
                <div className="ai-card">
                  <Sparkles size={16} className="ai-card-icon" />
                  <div className="ai-card-text">{latestReflection.ai_summary}</div>
                </div>
              ) : (
                <button
                  className={styles.aiButton}
                  onClick={() => generateAISummary(latestReflection.id)}
                  disabled={generatingAI}
                >
                  <Sparkles size={15} />
                  {generatingAI ? 'Generating...' : 'Generate AI Summary →'}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        /* History */
        <div className={styles.historyList}>
          {reflections.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-text">No reflections yet — complete your first weekly review</div>
              </div>
            </div>
          ) : (
            reflections.map(ref => (
              <div key={ref.id} className={styles.historyCard}>
                <div className={styles.historyHeader}>
                  <div>
                    <div className={styles.historyWeek}>
                      <BookOpen size={14} />
                      Week of {new Date(ref.week_start).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={styles.historyScore}>
                    <span className={styles.scoreCircle}>{ref.score}</span>
                    <span className={styles.scoreMax}>/10</span>
                  </div>
                </div>
                {ref.wins && (
                  <div className={styles.historyField}>
                    <span className={styles.historyLabel}>Wins</span>
                    <p className={styles.historyText}>{ref.wins}</p>
                  </div>
                )}
                {ref.struggles && (
                  <div className={styles.historyField}>
                    <span className={styles.historyLabel}>Challenges</span>
                    <p className={styles.historyText}>{ref.struggles}</p>
                  </div>
                )}
                {ref.focus_next && (
                  <div className={styles.historyField}>
                    <span className={styles.historyLabel}>Next Focus</span>
                    <p className={styles.historyText}>{ref.focus_next}</p>
                  </div>
                )}
                {ref.ai_summary && (
                  <div className="ai-card" style={{ marginTop: '0.5rem' }}>
                    <Sparkles size={14} className="ai-card-icon" />
                    <div className="ai-card-text">{ref.ai_summary}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
