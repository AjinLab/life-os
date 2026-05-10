'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { goalsApi, habitsApi } from '@/lib/api';
import { Crosshair, ArrowRight, Sparkles } from 'lucide-react';
import styles from './page.module.css';

const defaultHabits = [
  'Sleep by 11pm',
  'Morning study block',
  'Gym / workout',
  'Read 20 min',
  'Log the day',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([
    { title: '', label: 'Academic', placeholder: 'e.g. Pass all modules with B+ or above' },
    { title: '', label: 'Skill / Project', placeholder: 'e.g. Ship first ML project by end of semester' },
    { title: '', label: 'Personal (optional)', placeholder: 'e.g. Gym 4x per week, consistent sleep' },
  ]);
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [customHabit, setCustomHabit] = useState('');
  const [customHabits, setCustomHabits] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function updateGoal(index: number, title: string) {
    setGoals(prev => prev.map((g, i) => i === index ? { ...g, title } : g));
  }

  function toggleHabit(index: number) {
    setSelectedHabits(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function addCustomHabit() {
    if (customHabit.trim()) {
      setCustomHabits(prev => [...prev, customHabit.trim()]);
      setCustomHabit('');
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      // Create goals
      for (const goal of goals) {
        if (goal.title.trim()) {
          await goalsApi.create({ title: goal.title.trim(), type: 'semester' });
        }
      }

      // Create habits
      const habitsToCreate = [
        ...defaultHabits.filter((_, i) => selectedHabits.has(i)),
        ...customHabits,
      ];
      for (const name of habitsToCreate) {
        await habitsApi.create({ name, target_per_wk: 7 });
      }

      router.push('/');
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Crosshair size={22} />
          </div>
          <span className={styles.logoText}>Life OS</span>
        </div>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`} />
          <div className={styles.stepLine} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`} />
        </div>

        {step === 1 ? (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>Set your semester goals</h1>
              <p className={styles.subtitle}>Add up to 3 goals for this term</p>
            </div>

            <div className={styles.goalsList}>
              {goals.map((goal, i) => (
                <div key={i} className={styles.goalCard}>
                  <label className={styles.goalLabel}>
                    Goal {i + 1} — {goal.label}
                  </label>
                  <input
                    className={`input ${styles.goalInput}`}
                    placeholder={goal.placeholder}
                    value={goal.title}
                    onChange={e => updateGoal(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              className={styles.continueBtn}
              onClick={() => setStep(2)}
              disabled={!goals.some(g => g.title.trim())}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>Pick your habits</h1>
              <p className={styles.subtitle}>Select habits to track daily</p>
            </div>

            <div className={styles.habitsList}>
              {defaultHabits.map((name, i) => (
                <div
                  key={i}
                  className={`${styles.habitOption} ${selectedHabits.has(i) ? styles.selected : ''}`}
                  onClick={() => toggleHabit(i)}
                >
                  <div className={styles.habitCheckbox}>
                    {selectedHabits.has(i) && (
                      <svg width="10" height="8" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span>{name}</span>
                </div>
              ))}
              {customHabits.map((name, i) => (
                <div key={`custom-${i}`} className={`${styles.habitOption} ${styles.selected}`}>
                  <div className={styles.habitCheckbox}>
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span>{name}</span>
                </div>
              ))}
              <div className={styles.addCustom}>
                <input
                  className="input"
                  placeholder="Add a custom habit..."
                  value={customHabit}
                  onChange={e => setCustomHabit(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomHabit()}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button className="btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className={styles.continueBtn}
                onClick={handleFinish}
                disabled={submitting}
              >
                <Sparkles size={16} />
                {submitting ? 'Setting up...' : 'Launch Life OS'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
