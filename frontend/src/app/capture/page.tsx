'use client';

import { useState, useEffect } from 'react';
import { capturesApi } from '@/lib/api';
import { Capture } from '@/lib/types';
import { Plus, Zap, FileText, Lightbulb, DollarSign, Archive, CheckCircle, Clock } from 'lucide-react';
import styles from './page.module.css';

const captureTypes = [
  { value: 'task', label: 'Task', icon: CheckCircle },
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'idea', label: 'Idea', icon: Lightbulb },
  { value: 'expense', label: 'Expense', icon: DollarSign },
];

export default function CapturePage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState('task');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCaptures();
  }, []);

  async function loadCaptures() {
    try {
      const res = await capturesApi.list();
      setCaptures(res.data);
    } catch (err) {
      console.error('Failed to load captures:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await capturesApi.create({ content: content.trim(), type });
      setContent('');
      loadCaptures();
    } catch (err) {
      console.error('Failed to create capture:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProcess(id: string, newStatus: string) {
    try {
      await capturesApi.process(id, newStatus);
      loadCaptures();
    } catch (err) {
      console.error('Failed to process capture:', err);
    }
  }

  const inboxCaptures = captures.filter(c => c.status === 'inbox');
  const processedCaptures = captures.filter(c => c.status !== 'inbox');

  return (
    <div className={styles.container}>
      <div className="page-header">
        <h1 className="page-title">Quick Capture</h1>
        <p className="page-subtitle">Dump anything here — sort it later</p>
      </div>

      {/* Capture Form */}
      <form onSubmit={handleSubmit} className={styles.captureForm}>
        <div className={styles.typeRow}>
          {captureTypes.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                className={`pill-type ${type === t.value ? 'active' : ''}`}
                onClick={() => setType(t.value)}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>
        <textarea
          className="textarea"
          placeholder="Type or paste anything..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.metaKey) handleSubmit(e);
          }}
        />
        <div className={styles.formActions}>
          <span className={styles.hint}>⌘ + Enter to submit</span>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!content.trim() || submitting}
          >
            <Plus size={15} />
            Add to inbox
          </button>
        </div>
      </form>

      {/* Inbox */}
      <div className={styles.section}>
        <div className="flex-between mb-sm">
          <h2 className={styles.sectionTitle}>
            <Zap size={16} />
            Inbox
            {inboxCaptures.length > 0 && (
              <span className={styles.count}>{inboxCaptures.length}</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 100 }} />
        ) : inboxCaptures.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">Inbox is empty — nice!</div>
            </div>
          </div>
        ) : (
          <div className={styles.captureList}>
            {inboxCaptures.map(capture => (
              <div key={capture.id} className={styles.captureCard}>
                <div className={styles.captureTop}>
                  <span className={`badge badge-info`}>{capture.type}</span>
                  <span className={styles.captureTime}>
                    <Clock size={11} />
                    {new Date(capture.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.captureContent}>{capture.content}</p>
                <div className={styles.captureActions}>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleProcess(capture.id, 'processed')}
                  >
                    <CheckCircle size={13} />
                    Process
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleProcess(capture.id, 'archived')}
                  >
                    <Archive size={13} />
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed */}
      {processedCaptures.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ opacity: 0.5 }}>
            Processed ({processedCaptures.length})
          </h2>
          <div className={styles.captureList}>
            {processedCaptures.slice(0, 5).map(capture => (
              <div key={capture.id} className={styles.captureCard} style={{ opacity: 0.5 }}>
                <div className={styles.captureTop}>
                  <span className={`badge badge-success`}>{capture.status}</span>
                  <span className={styles.captureTime}>{capture.type}</span>
                </div>
                <p className={styles.captureContent}>{capture.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
