'use client';

import { useState, useEffect } from 'react';
import { capturesApi } from '@/lib/api';
import { Capture } from '@/lib/types';
import { Archive, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

const captureTypes = [
  { value: 'task', label: 'Task', placeholder: 'What needs to be done?' },
  { value: 'note', label: 'Note', placeholder: 'Write anything...' },
  { value: 'idea', label: 'Idea', placeholder: 'Drop your idea here...' },
  { value: 'expense', label: 'Expense', placeholder: 'What did you spend on?' },
];

export default function CapturePage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState('task');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const res = await capturesApi.list(); setCaptures(res.data); } catch {} finally { setLoading(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try { await capturesApi.create({ content: content.trim(), type }); setContent(''); load(); } catch {} finally { setSubmitting(false); }
  }

  async function process(id: string, status: string) {
    try { await capturesApi.process(id, status); load(); } catch {}
  }

  const placeholder = captureTypes.find(t => t.value === type)?.placeholder || '';
  const inbox = captures.filter(c => c.status === 'inbox');
  const processed = captures.filter(c => c.status !== 'inbox');
  const filtered = filter === 'all' ? inbox : inbox.filter(c => c.type === filter);

  function timeAgo(dt: string) {
    const diff = Date.now() - new Date(dt).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div className={styles.page}>
      {/* Quick Capture Form */}
      <form onSubmit={submit} className={styles.captureSheet}>
        <div className={styles.sheetHandle} />
        <h2 className={styles.sheetTitle}>Quick add</h2>

        {/* Type pills */}
        <div className={styles.typeRow}>
          {captureTypes.map(t => (
            <button key={t.value} type="button" className={`pill ${type === t.value ? 'active' : ''}`} onClick={() => setType(t.value)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          className={`textarea ${styles.captureInput}`}
          placeholder={placeholder}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submit(e); }}
        />

        {/* Actions */}
        <div className={styles.formActions}>
          <span className={styles.hint}>⌘ Enter</span>
          <button type="submit" className="btn btn-primary" disabled={!content.trim() || submitting}>
            Add to inbox
          </button>
        </div>
      </form>

      {/* Inbox */}
      <div className={styles.inboxSection}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <div>
            <h2 className={styles.inboxTitle}>Inbox</h2>
            <p className={styles.inboxSub}>{inbox.length} items to process</p>
          </div>
          {processed.length > 0 && <span className="text-link">Clear processed</span>}
        </div>

        {/* Filter */}
        <div className={styles.filterRow}>
          {['all', 'task', 'note', 'idea', 'expense'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}s
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-title">Inbox zero.</div>
              <div className="empty-state-text">All caught up.</div>
            </div>
          </div>
        ) : (
          <div className={styles.captureList}>
            {filtered.map(c => (
              <div key={c.id} className={styles.captureRow}>
                <div className={styles.captureLeft}>
                  <span className={styles.typeIcon}>
                    {c.type === 'task' ? '○' : c.type === 'note' ? '✎' : c.type === 'idea' ? '✦' : '$'}
                  </span>
                  <div>
                    <p className={styles.captureText}>{c.content}</p>
                    <span className={styles.captureTime}>{timeAgo(c.created_at)}</span>
                  </div>
                </div>
                <div className={styles.captureActions}>
                  <button className="btn btn-sm" onClick={() => process(c.id, 'processed')} title="Process">
                    <CheckCircle size={13} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => process(c.id, 'archived')} title="Archive">
                    <Archive size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
