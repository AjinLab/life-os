'use client';

import { useState, useEffect } from 'react';
import { goalsApi, tasksApi } from '@/lib/api';
import { Goal, Task } from '@/lib/types';
import { Plus, Target, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function PlanPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState('semester');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskGoalId, setNewTaskGoalId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [goalsRes, tasksRes] = await Promise.all([
        goalsApi.list(),
        tasksApi.list({ limit: 200 }),
      ]);
      setGoals(goalsRes.data);
      setTasks(tasksRes.data.tasks);
      // Expand all goals by default
      setExpandedGoals(new Set(goalsRes.data.map((g: Goal) => g.id)));
    } catch (err) {
      console.error('Failed to load plan data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    try {
      await goalsApi.create({ title: newGoalTitle.trim(), type: newGoalType });
      setNewGoalTitle('');
      setShowGoalForm(false);
      loadData();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await tasksApi.create({
        title: newTaskTitle.trim(),
        goal_id: newTaskGoalId || undefined,
        priority: newTaskPriority,
        status: 'todo',
      });
      setNewTaskTitle('');
      setShowTaskForm(false);
      loadData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  }

  async function toggleTask(taskId: number, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await tasksApi.update(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }

  function toggleGoal(goalId: string) {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  }

  function getGoalTasks(goalId: string) {
    return tasks.filter(t => t.goal_id === goalId);
  }

  function getUnlinkedTasks() {
    return tasks.filter(t => !t.goal_id);
  }

  function getStatusBadge(goal: Goal) {
    if (goal.progress >= 60) return { class: 'badge-success', text: 'on track' };
    if (goal.progress >= 30) return { class: 'badge-warning', text: 'at risk' };
    return { class: 'badge-danger', text: 'behind' };
  }

  function getPriorityBadge(priority: string | null) {
    switch (priority) {
      case 'urgent': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return '';
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="page-header">
          <h1 className="page-title">Plan</h1>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  const unlinkedTasks = getUnlinkedTasks();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Plan</h1>
          <p className="page-subtitle">Goals &amp; tasks — your execution view</p>
        </div>
        <div className={styles.actions}>
          <button className="btn btn-sm" onClick={() => setShowGoalForm(!showGoalForm)}>
            <Plus size={14} /> Goal
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(!showTaskForm)}>
            <Plus size={14} /> Task
          </button>
        </div>
      </div>

      {/* Goal Form */}
      {showGoalForm && (
        <form onSubmit={createGoal} className={styles.inlineForm}>
          <input
            className="input"
            placeholder="Goal title..."
            value={newGoalTitle}
            onChange={e => setNewGoalTitle(e.target.value)}
            autoFocus
          />
          <select
            className="input"
            value={newGoalType}
            onChange={e => setNewGoalType(e.target.value)}
            style={{ maxWidth: 160 }}
          >
            <option value="semester">Semester</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Create</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowGoalForm(false)}>Cancel</button>
        </form>
      )}

      {/* Task Form */}
      {showTaskForm && (
        <form onSubmit={createTask} className={styles.inlineForm}>
          <input
            className="input"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <select
            className="input"
            value={newTaskGoalId}
            onChange={e => setNewTaskGoalId(e.target.value)}
            style={{ maxWidth: 200 }}
          >
            <option value="">No goal (standalone)</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <select
            className="input"
            value={newTaskPriority}
            onChange={e => setNewTaskPriority(e.target.value)}
            style={{ maxWidth: 130 }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Create</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTaskForm(false)}>Cancel</button>
        </form>
      )}

      {/* Goals with tasks */}
      <div className={styles.goalsList}>
        {goals.length === 0 && unlinkedTasks.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-text">No goals yet — create your first goal to get started</div>
            </div>
          </div>
        ) : (
          <>
            {goals.map(goal => {
              const goalTasks = getGoalTasks(goal.id);
              const isExpanded = expandedGoals.has(goal.id);
              const badge = getStatusBadge(goal);
              const doneTasks = goalTasks.filter(t => t.status === 'done').length;

              return (
                <div key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalHeader} onClick={() => toggleGoal(goal.id)}>
                    <div className={styles.goalLeft}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <div>
                        <div className={styles.goalTitle}>{goal.title}</div>
                        <div className={styles.goalMeta}>
                          <span className="chip">{goal.type}</span>
                          <span className={styles.goalTaskCount}>{doneTasks}/{goalTasks.length} tasks</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.goalRight}>
                      <span className={`badge ${badge.class}`}>{badge.text}</span>
                    </div>
                  </div>

                  <div className="progress-bar" style={{ margin: '0 1.25rem' }}>
                    <div
                      className={`progress-fill ${goal.progress >= 60 ? 'progress-fill-success' : goal.progress >= 30 ? 'progress-fill-warning' : 'progress-fill-accent'}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {isExpanded && goalTasks.length > 0 && (
                    <div className={styles.goalTasks}>
                      {goalTasks.map(task => (
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
                          {task.priority && (
                            <span className={`badge ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unlinked tasks */}
            {unlinkedTasks.length > 0 && (
              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div className={styles.goalLeft}>
                    <Target size={16} style={{ opacity: 0.4 }} />
                    <div>
                      <div className={styles.goalTitle} style={{ opacity: 0.6 }}>Standalone Tasks</div>
                      <div className={styles.goalMeta}>
                        <span className={styles.goalTaskCount}>{unlinkedTasks.length} tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.goalTasks}>
                  {unlinkedTasks.map(task => (
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
                      {task.priority && (
                        <span className={`badge ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
