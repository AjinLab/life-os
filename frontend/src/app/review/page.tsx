'use client';

import { useState, useEffect } from 'react';
import { reflectionsApi, aiApi, homeApi } from '@/lib/api';
import { Reflection, DashboardResponse } from '@/lib/types';
import { Sparkles, BookOpen } from 'lucide-react';
import styles from './page.module.css';

function getScoreContext(score: number) {
  if (score <= 3) return 'Rough week — what got in the way?';
  if (score <= 6) return 'Steady — what could shift the needle?';
  if (score <= 8) return 'Strong week — what drove this?';
  return 'Outstanding — lock in what worked.';
}

function weekNum() {
  return Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 864e5));
}

function weekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

export default function ReviewPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [dash, setDash] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'new' | 'history'>('new');

  const [score, setScore] = useState(7);
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [focus, setFocus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Reflection | null>(null);
  const [genAI, setGenAI] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [r, d] = await Promise.all([reflectionsApi.list(), homeApi.dashboard()]);
      setReflections(r.data); setDash(d.data);
    } catch {} finally { setLoading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const r = await reflectionsApi.create({ week_start: weekStart(), score, wins: wins||undefined, struggles: struggles||undefined, focus_next: focus||undefined });
      setSaved(r.data); load();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 409) alert('Review for this week already saved!');
    } finally { setSubmitting(false); }
  }

  async function generateAI(id: string) {
    setGenAI(true);
    try {
      const r = await aiApi.reflectionSummary(id);
      setSaved(prev => prev ? { ...prev, ai_summary: r.data.summary } : null);
      load();
    } catch {} finally { setGenAI(false); }
  }

  if (loading) return <div className={styles.page}><div className="skeleton" style={{height:300}}/></div>;

  return (
    <div className={styles.page}>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Week {weekNum()} Review</h1>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>The compounding loop — reflect to grow</p>
        </div>
        <div className={styles.viewToggle}>
          <button className={`pill ${view === 'new' ? 'active' : ''}`} onClick={() => setView('new')}>New</button>
          <button className={`pill ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>History ({reflections.length})</button>
        </div>
      </div>

      {view === 'new' ? (
        <form onSubmit={save}>
          {/* Auto-generated metrics */}
          {dash && (
            <div className={styles.summaryBg}>
              <div className="metric-row" style={{ marginBottom: 8 }}>
                <div className="metric-card"><div className="metric-value">{dash.tasks_completed_today}/{dash.tasks_total_today}</div><div className="metric-label">Tasks</div></div>
                <div className="metric-card"><div className="metric-value">{dash.completion_pct}%</div><div className="metric-label">Habits</div></div>
                <div className="metric-card"><div className="metric-value">{dash.inbox_count}</div><div className="metric-label">Captures</div></div>
              </div>
            </div>
          )}

          {/* Score slider */}
          <div className={`card ${styles.scoreCard}`}>
            <div className="section-label">Rate this week (1–10)</div>
            <div className="score-slider-container">
              <input type="range" min={1} max={10} value={score} onChange={e => setScore(+e.target.value)} className="score-slider-track" />
              <div className="score-slider-value">{score}</div>
            </div>
            <div className="score-context">{getScoreContext(score)}</div>
          </div>

          {/* Reflection prompts */}
          <div className={`card ${styles.promptCard}`}>
            <label className={styles.promptLabel}>What went well this week?</label>
            <textarea className="textarea" placeholder="Wins, breakthroughs, momentum..." value={wins} onChange={e => setWins(e.target.value)} rows={3} style={{border:'none',background:'transparent',padding:'4px 0'}} />
          </div>

          <div className={`card ${styles.promptCard}`}>
            <label className={styles.promptLabel}>What struggled or got dropped?</label>
            <textarea className="textarea" placeholder="Be honest — no judgment." value={struggles} onChange={e => setStruggles(e.target.value)} rows={3} style={{border:'none',background:'transparent',padding:'4px 0'}} />
          </div>

          <div className={`card ${styles.promptCard}`}>
            <label className={styles.promptLabel}>One focus for next week?</label>
            <input className="input-borderless input" placeholder="The most important thing." value={focus} onChange={e => setFocus(e.target.value)} style={{fontSize:14}} />
          </div>

          {/* AI Summary */}
          {saved && (
            <div className={styles.aiSummarySection}>
              {saved.ai_summary ? (
                <div className={styles.aiCard}>
                  <div className={styles.aiCardHeader}><Sparkles size={13} /> AI · Week {weekNum()} Summary</div>
                  <div className={styles.aiCardBody}>{saved.ai_summary}</div>
                  <div className={styles.aiCardFooter}>Generated {new Date().toLocaleString()}</div>
                </div>
              ) : (
                <button type="button" className="btn btn-ai" style={{ width: '100%', padding: 14 }} onClick={() => generateAI(saved.id)} disabled={genAI}>
                  <Sparkles size={14} />
                  {genAI ? 'Analyzing your week...' : 'Generate AI summary →'}
                </button>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, marginTop: 16 }} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save review'}
          </button>
        </form>
      ) : (
        <div className={styles.historyList}>
          {reflections.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-title">No insights yet.</div><div className="empty-state-text">Complete your first weekly review.</div></div></div>
          ) : reflections.map(ref => (
            <div key={ref.id} className={styles.historyCard}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div className={styles.historyWeek}><BookOpen size={13} /> Week of {new Date(ref.week_start).toLocaleDateString()}</div>
                <div className={styles.historyScore}>{ref.score}<span className={styles.historyMax}>/10</span></div>
              </div>
              {ref.wins && <div className={styles.historyField}><span className={styles.fieldLabel}>Wins</span><p className={styles.fieldText}>{ref.wins}</p></div>}
              {ref.struggles && <div className={styles.historyField}><span className={styles.fieldLabel}>Challenges</span><p className={styles.fieldText}>{ref.struggles}</p></div>}
              {ref.focus_next && <div className={styles.historyField}><span className={styles.fieldLabel}>Next focus</span><p className={styles.fieldText}>{ref.focus_next}</p></div>}
              {ref.ai_summary && (
                <div className={styles.aiCard} style={{ marginTop: 8 }}>
                  <div className={styles.aiCardHeader}><Sparkles size={12} /> AI Summary</div>
                  <div className={styles.aiCardBody}>{ref.ai_summary}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
