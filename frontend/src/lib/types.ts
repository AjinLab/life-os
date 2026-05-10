// ============ CAPTURES ============

export interface Capture {
  id: string;
  content: string;
  type: 'task' | 'note' | 'idea' | 'expense';
  status: 'inbox' | 'processed' | 'archived';
  created_at: string;
}

// ============ GOALS ============

export interface Goal {
  id: string;
  parent_id: string | null;
  title: string;
  type: 'semester' | 'monthly' | 'weekly';
  status: 'active' | 'completed' | 'paused';
  progress: number;
  due_date: string | null;
  created_at: string;
}

// ============ TASKS ============

export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskSource = 'manual' | 'capture' | 'ai_suggested';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  due_date: string | null;
  source: TaskSource;
  goal_id: string | null;
  created_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

// ============ HABITS ============

export interface Habit {
  id: string;
  name: string;
  cue: string | null;
  target_per_wk: number;
  current_streak: number;
  active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  note: string | null;
  created_at: string;
}

export interface HabitWithStatus {
  id: string;
  name: string;
  cue: string | null;
  target_per_wk: number;
  current_streak: number;
  completed_today: boolean;
}

export interface TodayHabitsResponse {
  habits: HabitWithStatus[];
  completed_count: number;
  total_count: number;
}

// ============ REFLECTIONS ============

export interface Reflection {
  id: string;
  week_start: string;
  score: number;
  wins: string | null;
  struggles: string | null;
  focus_next: string | null;
  ai_summary: string | null;
  created_at: string;
}

// ============ DASHBOARD ============

export interface DashboardTaskSummary {
  id: number;
  title: string;
  status: string;
  priority: string | null;
  goal_id: string | null;
}

export interface DashboardGoalSummary {
  id: string;
  title: string;
  status: string;
  progress: number;
}

export interface DashboardHabitSummary {
  id: string;
  name: string;
  current_streak: number;
  completed_today: boolean;
}

export interface DashboardResponse {
  greeting: string;
  day_label: string;
  tasks_completed_today: number;
  tasks_total_today: number;
  completion_pct: number;
  best_streak: number;
  current_streak: number;
  today_tasks: DashboardTaskSummary[];
  active_goals: DashboardGoalSummary[];
  habits_today: DashboardHabitSummary[];
  inbox_count: number;
  weekly_score: number | null;
  ai_nudge: string;
}
