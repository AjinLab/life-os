'use client';

import { useState, useEffect } from 'react';
import { goalsApi, tasksApi } from '@/lib/api';
import { Goal, Task } from '@/lib/types';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function PlanPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newTaskGoal, setNewTaskGoal] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [g, t] = await Promise.all([goalsApi.list(), tasksApi.list({ limit: 500 })]);
      setGoals(g.data);
      setTasks(t.data.tasks);
      setExpanded(new Set(g.data.map((gl: Goal) => gl.id)));
    } catch {} finally { setLoading(false); }
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoal.trim()) return;
    await goalsApi.create({ title: newGoal.trim(), type: 'semester' });
    setNewGoal(''); setShowGoalForm(false); load();
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    await tasksApi.create({ title: newTask.trim(), goal_id: newTaskGoal || undefined, priority: newTaskPriority, status: 'todo' });
    setNewTask(''); setShowTaskForm(false); load();
  }

  async function toggleTask(id: number, status: string) {
    await tasksApi.update(id, { status: status === 'done' ? 'todo' : 'done' });
    load();
  }

  function toggle(id: string) {
    setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function statusClass(goal: Goal) {
    if (goal.progress >= 60) return 'status-on-track';
    if (goal.progress >= 30) return 'status-at-risk';
    return 'status-behind';
  }

  function statusLabel(goal: Goal) {
    if (goal.progress >= 60) return { text: 'on track', cls: 'badge-success' };
    if (goal.progress >= 30) return { text: 'at risk', cls: 'badge-warning' };
    return { text: 'behind', cls: 'badge-danger' };
  }

  const unlinked = tasks.filter(t => !t.goal_id);
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');

  if (loading) return (
    <div className={styles.page}>
      <div className="section-label">Loading...</div>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:100,marginBottom:8}}/>)}
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Plan</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-sm" onClick={() => setShowGoalForm(!showGoalForm)}>
            <Plus size={13} /> Goal
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(!showTaskForm)}>
            <Plus size={13} /> Task
          </button>
        </div>
      </div>

      {/* Inline forms */}
      {showGoalForm && (
        <form onSubmit={createGoal} className={styles.inlineForm}>
          <input className="input" placeholder="Goal title..." value={newGoal} onChange={e=>setNewGoal(e.target.value)} autoFocus />
          <button type="submit" className="btn btn-primary btn-sm">Create</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setShowGoalForm(false)}>Cancel</button>
        </form>
      )}
      {showTaskForm && (
        <form onSubmit={createTask} className={styles.inlineForm}>
          <input className="input" placeholder="What needs to be done?" value={newTask} onChange={e=>setNewTask(e.target.value)} autoFocus style={{flex:1}} />
          <select className="input" value={newTaskGoal} onChange={e=>setNewTaskGoal(e.target.value)} style={{maxWidth:160}}>
            <option value="">No goal</option>
            {goals.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
          <select className="input" value={newTaskPriority} onChange={e=>setNewTaskPriority(e.target.value)} style={{maxWidth:100}}>
            <option value="low">Low</option><option value="medium">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Add</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setShowTaskForm(false)}>Cancel</button>
        </form>
      )}

      {/* Semester Goals */}
      <div className={styles.section}>
        <div className="section-label">
          Semester goals <span className="count-badge">{goals.length}</span>
        </div>
        {goals.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-title">No goals set.</div><div className="empty-state-text">Add your first goal above.</div></div></div>
        ) : (
          <div className={styles.goalStack}>
            {goals.map(goal => {
              const gt = tasks.filter(t => t.goal_id === goal.id);
              const done = gt.filter(t => t.status === 'done').length;
              const st = statusLabel(goal);
              const isOpen = expanded.has(goal.id);
              return (
                <div key={goal.id} className={`goal-card ${statusClass(goal)}`}>
                  <div className={styles.goalHeader} onClick={() => toggle(goal.id)}>
                    <div className={styles.goalLeft}>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className={styles.goalTitle}>{goal.title}</span>
                    </div>
                    <span className={`badge ${st.cls}`}>{st.text}</span>
                  </div>
                  <div className="progress-bar" style={{margin:'0 16px 8px'}}>
                    <div className="progress-fill" style={{width:`${goal.progress}%`, background: goal.progress >= 60 ? 'var(--habits-green)' : goal.progress >= 30 ? 'var(--warning)' : 'var(--error)'}} />
                  </div>
                  <div className={styles.goalMeta}>{done}/{gt.length} tasks · {goal.progress}% complete</div>
                  {isOpen && gt.length > 0 && (
                    <div className={styles.goalTasks}>
                      {gt.map(task => (
                        <div key={task.id} className="task-item">
                          <div className={`task-checkbox ${task.status==='done'?'done':''}`} onClick={()=>toggleTask(task.id,task.status)}>
                            {task.status==='done' && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                          </div>
                          <span className={`task-text ${task.status==='done'?'done':''}`}>{task.title}</span>
                          {task.priority && task.priority !== 'medium' && <span className={`badge ${task.priority==='urgent'?'badge-danger':task.priority==='high'?'badge-warning':'badge-info'}`}>{task.priority}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-link" style={{marginTop:8}} onClick={()=>setShowGoalForm(true)}>+ Add goal</p>
      </div>

      {/* This week's tasks */}
      <div className={styles.section}>
        <div className="section-label">
          This week <span className="count-badge">{activeTasks.length}</span>
        </div>
        <div className="card">
          {activeTasks.length === 0 && completedTasks.length === 0 ? (
            <div className="empty-state" style={{padding:'24px 0'}}><div className="empty-state-title">Nothing planned yet.</div><div className="empty-state-text">Add your first task.</div></div>
          ) : (
            <>
              {activeTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-checkbox" onClick={()=>toggleTask(task.id,task.status)} />
                  <span className="task-text">{task.title}</span>
                  {task.goal_id && <span className="task-tag" style={{color:'var(--goals-blue)',borderColor:'var(--goals-blue-border)'}}>
                    {goals.find(g=>g.id===task.goal_id)?.title?.slice(0,15) || 'Goal'}
                  </span>}
                </div>
              ))}
              {completedTasks.length > 0 && (
                <>
                  <p className="text-link" style={{padding:'8px 0'}} onClick={()=>setShowCompleted(!showCompleted)}>
                    {showCompleted ? 'Hide' : 'Show'} completed ({completedTasks.length})
                  </p>
                  {showCompleted && completedTasks.map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-checkbox done" onClick={()=>toggleTask(task.id,task.status)}>
                        <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                      </div>
                      <span className="task-text done">{task.title}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
        <p className="text-link" style={{marginTop:8}} onClick={()=>setShowTaskForm(true)}>+ Add task</p>
      </div>
    </div>
  );
}
