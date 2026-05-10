'use client';

import { useState, useEffect } from 'react';
import { aiApi, homeApi, reflectionsApi } from '@/lib/api';
import { DashboardResponse, Reflection } from '@/lib/types';
import { Sparkles, AlertCircle, TrendingDown, Zap } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function InsightsPage() {
  const [dash, setDash] = useState<DashboardResponse | null>(null);
  const [latest, setLatest] = useState<Reflection | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [genBriefing, setGenBriefing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [d, r] = await Promise.all([homeApi.dashboard(), reflectionsApi.list(1)]);
      setDash(d.data);
      if (r.data.length > 0) setLatest(r.data[0]);
    } catch {} finally { setLoading(false); }
  }

  async function genWeeklyBriefing() {
    setGenBriefing(true);
    try {
      const r = await aiApi.weeklyBriefing();
      setBriefing(r.data.briefing);
    } catch {} finally { setGenBriefing(false); }
  }

  if (loading) return (
    <div className={styles.page}>
      <div style={{fontSize:20,fontWeight:600,marginBottom:8}}>Insights</div>
      <div className="skeleton" style={{height:120,marginBottom:12}} />
      <div className="skeleton" style={{height:200}} />
    </div>
  );

  // Generate some alerts from dashboard data
  const alerts: { color: string; text: string }[] = [];
  if (dash) {
    if (dash.inbox_count > 2) alerts.push({ color: 'var(--warning)', text: `${dash.inbox_count} unprocessed captures in inbox.` });
    const pendingTasks = dash.today_tasks.filter(t => t.status !== 'done');
    if (pendingTasks.length > 0) alerts.push({ color: 'var(--goals-blue)', text: `${pendingTasks.length} tasks still pending today.` });
    const uncheckedHabits = dash.habits_today.filter(h => !h.completed_today);
    if (uncheckedHabits.length > 0) alerts.push({ color: 'var(--habits-green)', text: `${uncheckedHabits.length} habits left to check off.` });
  }

  return (
    <div className={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Insights</h1>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>AI Intelligence layer</p>
      </div>

      {/* Weekly Briefing */}
      <div className={styles.briefingCard}>
        <div className={styles.briefingLabel}><Sparkles size={12} /> Weekly briefing · AI</div>
        {briefing ? (
          <>
            <div className={styles.briefingText}>{briefing}</div>
            <div className={styles.briefingFooter}>Generated just now</div>
          </>
        ) : latest ? (
          <>
            <div className={styles.briefingText} style={{ opacity: 0.6 }}>
              Latest score: {latest.score}/10. {latest.focus_next ? `Focus: ${latest.focus_next}` : ''}
            </div>
            <button className="btn btn-ai btn-sm" style={{ marginTop: 8 }} onClick={genWeeklyBriefing} disabled={genBriefing}>
              {genBriefing ? 'Generating...' : 'Read full briefing →'}
            </button>
          </>
        ) : (
          <>
            <div className={styles.briefingText} style={{ opacity: 0.5 }}>
              Complete your weekly review to generate this week&apos;s briefing.
            </div>
            <Link href="/review" className="btn btn-sm" style={{ marginTop: 8 }}>Go to Review</Link>
          </>
        )}
      </div>

      {/* Alerts */}
      <div className={styles.section}>
        <div className="section-label">
          Alerts <span className="count-badge">{alerts.length}</span>
        </div>
        {alerts.length === 0 ? (
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No active alerts. You&apos;re on track.</p>
          </div>
        ) : (
          <div className={styles.alertList}>
            {alerts.map((a, i) => (
              <div key={i} className={styles.alertRow}>
                <span className={styles.alertDot} style={{ background: a.color }} />
                <span className={styles.alertText}>{a.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className={styles.section}>
        <div className="section-label">Recommendations</div>
        <div className="card" style={{ padding: '14px 16px' }}>
          {dash ? (
            <div className={styles.recoList}>
              {dash.inbox_count > 0 && (
                <div className={styles.recoItem}>
                  <span className={styles.recoNum}>1</span>
                  <span className={styles.recoText}>Process your {dash.inbox_count} inbox captures — they&apos;ll compound if ignored.</span>
                </div>
              )}
              {dash.habits_today.filter(h => !h.completed_today).length > 0 && (
                <div className={styles.recoItem}>
                  <span className={styles.recoNum}>{dash.inbox_count > 0 ? '2' : '1'}</span>
                  <span className={styles.recoText}>Complete your remaining habits before end of day to maintain your streak.</span>
                </div>
              )}
              {!latest && (
                <div className={styles.recoItem}>
                  <span className={styles.recoNum}>★</span>
                  <span className={styles.recoText}>Do your first weekly review — the reflection engine makes everything else compound.</span>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No recommendations yet.</p>
          )}
        </div>
      </div>

      {/* Goal Trajectories */}
      {dash && dash.active_goals.length > 0 && (
        <div className={styles.section}>
          <div className="section-label">Goal trajectory</div>
          <div className={styles.trajectoryList}>
            {dash.active_goals.map(g => (
              <div key={g.id} className={styles.trajectoryRow}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{g.title}</span>
                  <span className={`badge ${g.progress >= 60 ? 'badge-success' : g.progress >= 30 ? 'badge-warning' : 'badge-danger'}`}>
                    {g.progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${g.progress}%`, background: g.progress >= 60 ? 'var(--habits-green)' : g.progress >= 30 ? 'var(--warning)' : 'var(--error)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
