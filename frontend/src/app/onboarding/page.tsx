'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { goalsApi, habitsApi } from '@/lib/api';
import { GraduationCap, Rocket, Briefcase, Palette, Settings, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

const modes = [
  { id: 'student', label: 'Student', desc: 'Managing semesters, assignments, and skills', icon: GraduationCap },
  { id: 'founder', label: 'Founder', desc: 'Building a company or product', icon: Rocket },
  { id: 'professional', label: 'Professional', desc: 'Career, projects, and growth', icon: Briefcase },
  { id: 'creator', label: 'Creator', desc: 'Content, audience, and creative output', icon: Palette },
  { id: 'custom', label: 'Custom', desc: "I'll set it up my way", icon: Settings },
];

const suggestedHabits = [
  'Sleep before 11pm', 'Morning study block', 'Exercise / gym', 'Read 20 min',
  'No phone first 30 min', 'Log the day', 'Deep work session', 'Drink 2L water',
];

const goalSlots = [
  { label: 'Academic goal', tag: 'Academic', placeholder: 'e.g. Pass all subjects with distinction' },
  { label: 'Project or skill goal', tag: 'Project', placeholder: 'e.g. Ship my first ML project publicly' },
  { label: 'Personal goal (optional)', tag: 'Personal', placeholder: 'e.g. Gym 4x per week, sleep by 11pm' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('');
  const [goals, setGoals] = useState(['', '', '']);
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const [customHabit, setCustomHabit] = useState('');
  const [extraHabits, setExtraHabits] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function toggleHabit(i: number) {
    setSelectedHabits(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  function addCustom() {
    if (customHabit.trim()) { setExtraHabits(p => [...p, customHabit.trim()]); setCustomHabit(''); }
  }

  async function finish() {
    setSubmitting(true);
    try {
      for (const g of goals) { if (g.trim()) await goalsApi.create({ title: g.trim(), type: 'semester' }); }
      const all = [...suggestedHabits.filter((_, i) => selectedHabits.has(i)), ...extraHabits];
      for (const name of all) { await habitsApi.create({ name, target_per_wk: 7 }); }
      router.push('/');
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className={styles.welcome}>
            <div className={styles.wordmark}>OS</div>
            <h1 className={styles.headline}>Your life, organized.</h1>
            <p className={styles.subtext}>Set up in 3 minutes. Built around your semester.</p>
            <button className={styles.ctaBtn} onClick={() => setStep(2)}>Get started</button>
            <p className={styles.signInLink}>Already have an account? Sign in</p>
          </div>
        )}

        {/* Step 2: Mode */}
        {step === 2 && (
          <>
            <div className={styles.stepBar}><span className={styles.stepActive}>1</span><span className={styles.stepDivider} /><span className={styles.stepDot}>2</span><span className={styles.stepDivider} /><span className={styles.stepDot}>3</span></div>
            <h2 className={styles.stepTitle}>What best describes you right now?</h2>
            <p className={styles.stepSub}>You can change this anytime.</p>
            <div className={styles.modeGrid}>
              {modes.map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.id} className={`${styles.modeCard} ${mode === m.id ? styles.modeSelected : ''}`} onClick={() => setMode(m.id)}>
                    <Icon size={20} strokeWidth={1.5} />
                    <div>
                      <div className={styles.modeName}>{m.label}</div>
                      <div className={styles.modeDesc}>{m.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className={`${styles.ctaBtn} ${!mode ? styles.ctaDisabled : ''}`} disabled={!mode} onClick={() => setStep(3)}>
              Continue <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <>
            <div className={styles.stepBar}><span className={styles.stepDone}>1</span><span className={styles.stepDivider} /><span className={styles.stepActive}>2</span><span className={styles.stepDivider} /><span className={styles.stepDot}>3</span></div>
            <h2 className={styles.stepTitle}>Set your semester goals</h2>
            <p className={styles.stepSub}>3 is the maximum. Be specific.</p>
            <div className={styles.goalList}>
              {goalSlots.map((slot, i) => (
                <div key={i} className={styles.goalSlot}>
                  <div className={styles.goalLabelRow}>
                    <span className={styles.goalLabel}>{slot.label}</span>
                    <span className={styles.goalTag}>{slot.tag}</span>
                  </div>
                  <input
                    className="input"
                    placeholder={slot.placeholder}
                    value={goals[i]}
                    onChange={e => setGoals(prev => prev.map((g, j) => j === i ? e.target.value : g))}
                  />
                </div>
              ))}
            </div>
            <div className={styles.btnRow}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className={styles.ctaBtn} disabled={!goals.some(g => g.trim())} onClick={() => setStep(4)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-link" style={{ textAlign: 'center', marginTop: 12 }} onClick={() => setStep(4)}>Skip for now</p>
          </>
        )}

        {/* Step 4: Habits */}
        {step === 4 && (
          <>
            <div className={styles.stepBar}><span className={styles.stepDone}>1</span><span className={styles.stepDivider} /><span className={styles.stepDone}>2</span><span className={styles.stepDivider} /><span className={styles.stepActive}>3</span></div>
            <h2 className={styles.stepTitle}>Pick your daily habits</h2>
            <p className={styles.stepSub}>Start with 3–5. You can always edit these.</p>
            <div className={styles.habitList}>
              {suggestedHabits.map((name, i) => (
                <div key={i} className={`${styles.habitOption} ${selectedHabits.has(i) ? styles.habitSelected : ''}`} onClick={() => toggleHabit(i)}>
                  <span>{name}</span>
                  <div className={`${styles.habitToggle} ${selectedHabits.has(i) ? styles.habitToggleOn : ''}`}>
                    {selectedHabits.has(i) && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                  </div>
                </div>
              ))}
              {extraHabits.map((name, i) => (
                <div key={`e-${i}`} className={`${styles.habitOption} ${styles.habitSelected}`}>
                  <span>{name}</span>
                  <div className={`${styles.habitToggle} ${styles.habitToggleOn}`}>
                    <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                </div>
              ))}
              <div className={styles.addCustomRow}>
                <input className="input" placeholder="+ Add your own" value={customHabit} onChange={e => setCustomHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} />
              </div>
            </div>
            <p className={styles.habitCount}>{selectedHabits.size + extraHabits.length} habits selected</p>
            <div className={styles.btnRow}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
              <button className={styles.ctaBtn} onClick={finish} disabled={submitting}>
                {submitting ? 'Setting up…' : 'Finish setup'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
