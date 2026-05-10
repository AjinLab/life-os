# Life OS — UI/UX Design Prompts
*One prompt per page and per section. Use these with Claude, v0, Figma AI, or any design tool.*

---

## HOW TO USE THESE PROMPTS

Each prompt is self-contained. You can:
- Paste a single prompt into a new Claude chat to generate that screen as a React/HTML artifact
- Use in v0.dev for instant component generation
- Use in Figma AI for layout generation
- Chain them together to build the full app

Design system constants to prepend to any prompt if you want visual consistency:
```
Design system: dark-capable neutral palette, Inter or Geist font, 
border-radius 10–14px, subtle borders (1px, low opacity), 
generous whitespace, no drop shadows — use borders instead, 
micro-metric cards with large value + small label, 
muted color accents per module (green=habits, blue=goals, purple=AI, amber=capture).
Mobile-first, max content width 440px on mobile, 960px on desktop.
```

---

## PAGE 1 — ONBOARDING

### Prompt 1A: Onboarding — Welcome Screen

```
Design a minimal welcome screen for a personal Life OS app called "OS" (or let the user name it).

Layout:
- Full screen, centered vertically and horizontally
- Large wordmark or logo mark at top (simple, geometric)
- Headline: "Your life, organized." — large, confident, one line
- Subtext: "Set up in 3 minutes. Built around your semester." — small, muted
- Single CTA button: "Get started" — full width, solid, bottom of content area
- Below button: "Already have an account? Sign in" — text link, very small

Style:
- Clean, almost brutalist simplicity
- No illustrations, no gradients, no stock imagery
- Dark background option from first screen (system preference detect)
- Font: Inter or Geist, weights 400 and 600 only
- Background: near-black (#0F0F0F) or near-white (#FAFAFA)

Mood: Calm, intentional, serious — like Notion meets Linear.
```

---

### Prompt 1B: Onboarding — Mode Selection

```
Design a "Choose your mode" screen for a life OS app.
This is step 1 of 3 in onboarding. Show a step indicator at the top (1 / 3).

Content:
- Heading: "What best describes you right now?"
- Subheading: "You can change this anytime."
- 5 mode cards laid out in a 2-column grid (last one full width or centered):
  1. Student — "Managing semesters, assignments, and skills"
  2. Founder — "Building a company or product"
  3. Professional — "Career, projects, and growth"
  4. Creator — "Content, audience, and creative output"
  5. Custom — "I'll set it up my way"

Each card:
- Icon (simple, outlined, 24px)
- Mode name in bold
- One-line description in muted text
- Tap to select — highlights with colored left border or soft background tint
- No checkboxes, no radio buttons — the card itself is the selector

Bottom: "Continue" button — disabled until a mode is selected, then activates.

Style: Cards with subtle border, rounded corners, tap state is a clean highlight.
No unnecessary decoration. Mobile-first layout.
```

---

### Prompt 1C: Onboarding — Set Your Goals (Student Mode)

```
Design step 2 of 3 in onboarding for a student using a Life OS app.

Heading: "Set your semester goals"
Subheading: "3 is the maximum. Be specific."

Layout:
- Step indicator: 2 / 3
- 3 goal input rows, each with:
  - A small label above: "Academic goal", "Project or skill goal", "Personal goal (optional)"
  - A full-width text input field with placeholder text as an example:
    - Academic: "e.g. Pass all subjects with distinction"
    - Project: "e.g. Ship my first ML project publicly"
    - Personal: "e.g. Gym 4x per week, sleep by 11pm"
  - A small "category tag" shown on the right of each label — pre-filled, non-editable (Academic / Project / Personal)
- Below inputs: a collapsed section "Why only 3?" — tap to expand, shows 2 lines of explanation

Bottom:
- "Continue" button — activates when at least 1 goal is filled in
- "Skip for now" text link below button

Style: Clean form, generous spacing between inputs, soft focus ring on active field.
Label above input (not floating label). Keep it uncluttered — this is not a settings form, it's a moment of intention.
```

---

### Prompt 1D: Onboarding — Set Your Habits

```
Design step 3 of 3 in onboarding for a life OS app.

Heading: "Pick your daily habits"
Subheading: "Start with 3–5. You can always edit these."
Step indicator: 3 / 3

Layout:
- A pre-populated list of 8 suggested habits as selectable chips or toggle rows:
  Sleep before 11pm | Morning study block | Exercise / gym | Read 20 min
  No phone first 30 min | Log the day | Deep work session | Drink 2L water

- Each habit is a selectable row or pill:
  - Left: habit name
  - Right: a toggle or checkmark (tap to select/deselect)
  - Selected state: soft background tint + checkmark filled

- Below the list: "+ Add your own" — opens an inline text input

- At bottom: selected count shown e.g. "4 habits selected" — updates live

Bottom:
- "Finish setup" primary button — always enabled (user can proceed with 0 habits)
- Confetti or subtle success animation on tap (optional)

Style: Rows with 1px border, rounded, 12–14px font. Selected = green accent border left or soft green fill. Tapping is the primary interaction — no drag, no reordering in this screen.
```

---

## PAGE 2 — HOME (COMMAND CENTER)

### Prompt 2A: Home — Full Page Layout

```
Design the Home screen (Command Center) for a personal Life OS mobile app.
This is the screen users open every day. It must feel like a morning briefing, not a dashboard.

Sections in order from top to bottom:

1. Top bar: 
   - Left: "Good morning, [Name]" — personalized greeting, large-ish
   - Right: current week indicator "Week 12 · Semester 4" — small, muted
   - Below greeting: current date in small muted text

2. Daily score bar:
   - 3 metric cards in a row: Today's execution (%), Focus hours logged, Habit streak (days)
   - Each card: large number on top, small label below, subtle border, no background color

3. AI Recommendation banner:
   - A full-width card with a purple/indigo left border accent
   - Small label: "AI · Today"
   - One line of recommendation text: e.g. "You have 3 captures to process. ML project is behind — 2 days to deadline."
   - Very subtle background tint, not a loud notification

4. Today's priorities:
   - Section label: "Today" with task count badge
   - 3–5 task rows: checkbox left + task title + optional tag right (e.g. "ML Project")
   - Completed tasks shown with strikethrough and muted opacity
   - "+ Add task" text button at the bottom of the list

5. Habit check-in strip:
   - Section label: "Habits today"
   - Horizontal scrollable row of habit chips: each chip shows habit name + circle checkmark
   - Unchecked: outlined. Checked: filled green. Tap to toggle.

6. Floating action button (FAB):
   - Bottom right: "+" button — always visible — opens Quick Capture overlay
   - Should float above content, not in a nav bar

Bottom navigation bar:
- 5 tabs: Home (active), Plan, Build, Mind, Insights
- Icons + labels, current tab highlighted

Style: Light mode default, dark mode ready. Dense but not cramped. 
Cards use 1px borders, no shadows. Primary accent: neutral with green for habits, blue for goals, purple for AI.
```

---

### Prompt 2B: Home — Daily Score Cards (Component Only)

```
Design a row of 3 metric score cards for a life OS app's home screen.

Each card shows:
- A large number or short value (e.g. "74%", "3.2h", "12d")
- A small label below in muted text (e.g. "Today", "Focus", "Streak")
- An optional subtle trend indicator: tiny arrow up/down or colored dot

Card states:
- Default: white/dark card, border, no fill
- Good/high value: very subtle green tint in background or green dot indicator
- Warning/low value: very subtle amber tint or amber dot
- No value yet: shows "—" with muted color and label "Not set"

Layout:
- 3 cards in a row, equal width, no gaps between (use borders to separate)
- Or 3 cards with small gaps, each with individual border — choose whichever reads cleaner
- Total row height: ~72–80px on mobile

Style: Numbers should be 20–24px bold. Labels 10–11px, uppercase, letter-spaced.
No icons needed. Numbers speak for themselves.
This component must look great with just text — no charts, no sparklines in this version.
```

---

### Prompt 2C: Home — AI Recommendation Banner (Component Only)

```
Design an AI recommendation banner component for a life OS app.

This is a subtle, non-intrusive card that shows 1 AI-generated recommendation per day on the home screen.

Structure:
- Left accent: 3px vertical bar in indigo/purple
- Top-left: small label "AI · Today" — tiny, muted, uppercase
- Main text: 1–2 sentences of recommendation. E.g.:
  "You have 3 unprocessed captures. Your ML project deadline is in 2 days — it's marked at risk."
- Bottom-right: "See all insights →" — tiny text link

States to design:
1. Default (with recommendation text)
2. Loading state (subtle skeleton shimmer)
3. Empty state: "No insights yet — complete your first weekly review."

Style:
- Very light indigo/purple background tint (5% opacity)
- 1px border with slightly higher purple opacity
- Not a notification. Not a badge. Just a calm, useful card.
- Font: regular weight for the text, no bold
- Rounded corners consistent with rest of app

The tone of this component should feel like advice from a calm mentor, not an alert.
```

---

## PAGE 3 — QUICK CAPTURE

### Prompt 3A: Quick Capture — Full Overlay

```
Design a Quick Capture overlay/modal for a life OS app.
This appears when the user taps the floating "+" button from any screen.

Behavior: Slides up from bottom as a bottom sheet on mobile. Covers ~65–70% of the screen. Background is dimmed.

Layout inside the sheet:
1. Handle bar at top (drag indicator)
2. Heading: "Quick add" — small, bold, left-aligned
3. Type selector — horizontal pill tabs:
   Task | Note | Idea | Expense
   - Tapping switches the capture type
   - Active type is highlighted (filled pill, not just underline)

4. Main input area:
   - Large multiline text input — full width, no border (borderless style with placeholder)
   - Placeholder changes per type:
     - Task: "What needs to be done?"
     - Note: "Write anything..."
     - Idea: "Drop your idea here..."
     - Expense: "What did you spend on?"
   - Auto-focus on open

5. For "Expense" type only — show additional field:
   - Amount input: number field, currency symbol prefix, appears below the text input
   - Category: small chip selectors (Food / Transport / Subscriptions / Other)

6. Meta row (optional, collapsible):
   - For Task: "Link to goal" dropdown + "Due date" picker
   - For others: "Tag" input
   - Show as "Add details +" text that expands on tap

7. Bottom action row:
   - Left: "Cancel" text button
   - Right: "Add to inbox" filled button — full width on mobile
   - Keyboard toolbar: dismiss keyboard icon

Style:
- Sheet background: white (light) or dark surface (dark mode)
- Top rounded corners: 16–20px
- Input area feels spacious, like a notes app
- Type selector uses soft pill/chip style
- Animation: spring ease slide-up, fast (200ms)
```

---

### Prompt 3B: Quick Capture — Capture Inbox View

```
Design the Capture Inbox screen for a life OS app.
This is where all unprocessed captures land after being added via quick capture.

Accessed from: Home screen AI banner ("3 unprocessed captures") or Plan screen.

Layout:
1. Header:
   - Title: "Inbox"
   - Subtitle: "3 items to process"
   - Right: "Clear processed" text button (muted)

2. Filter bar:
   - Horizontal chips: All | Tasks | Notes | Ideas | Expenses
   - Default: All

3. Capture list:
   - Each capture item is a card/row with:
     - Type icon (small, 16px) — colored dot or symbol: ○ task, ✎ note, ✦ idea, $ expense
     - Capture content text (1–2 lines, truncated)
     - Timestamp: "2h ago" — small, muted, right side
     - Swipe right: "Convert to task" action (green)
     - Swipe left: "Archive" action (muted red)
     - Tap: opens capture detail with action options

4. Item action sheet (appears on tap):
   - Full content shown
   - Actions:
     - "Convert to task" → opens task creation with content pre-filled
     - "Save as note" → moves to knowledge module
     - "Archive" → removes from inbox
     - "Edit" → edits the capture
   - Cancel button

5. Empty state:
   - Simple illustration or icon
   - "Inbox zero." — bold
   - "All caught up." — muted subtext

Style: List-based, dense rows, swipe actions with color feedback.
Feels like a triage tool — fast, action-oriented.
```

---

## PAGE 4 — PLAN (GOALS + TASKS)

### Prompt 4A: Plan — Full Page Layout

```
Design the Plan screen for a life OS app.
This is where users manage their goals and weekly tasks. Two-part view: Goals at top, Tasks below.

Layout sections from top to bottom:

1. Header:
   - Title: "Plan"
   - Right: semester label "Semester 4 · Week 12"
   - Below: a horizontal progress bar for semester completion (e.g. 60% of 18 weeks done) — very thin, muted

2. Semester goals section:
   - Section label: "Semester goals" + count badge (e.g. "3")
   - Each goal shown as a card:
     - Goal title (bold, 14px)
     - Status badge: "on track" (green) / "at risk" (amber) / "behind" (red)
     - Progress bar — full width inside card, 4px height, colored by status
     - Progress label: "65% complete" — right-aligned small text
   - 3 goal cards stacked vertically with gap
   - "+ Add goal" text link below

3. This week's tasks section:
   - Section label: "This week" + incomplete task count
   - Toggle view: "By goal" | "All tasks" — small segmented control
   - Task list:
     - Each row: checkbox + task title + optional goal tag (right side, colored chip, 10px text)
     - Completed tasks: strikethrough, moved to bottom or hidden behind "Show completed" toggle
     - Overdue tasks: red date label on right
   - Empty state: "Nothing planned yet. Add your first task."
   - "+ Add task" floating text or button at bottom of section

4. Quick date navigation (optional):
   - Row of 7 date chips for current week
   - Tap a date to filter tasks by day

Bottom navigation bar: Home | Plan (active) | Build | Mind | Insights

Style: 
- Goals cards have bold left border tinted by status color
- Task rows are minimal — checkbox, text, tag only
- Section headers: uppercase, 11px, letter-spaced, muted
- Dense but scannable
```

---

### Prompt 4B: Plan — Goal Detail View

```
Design a Goal Detail screen for a life OS app.
Accessed by tapping a goal card on the Plan screen.

Header:
- Back arrow "← Plan"
- Goal title — large, bold, editable (tap to edit)
- Status badge (on track / at risk / behind) — tapable to change
- Goal type chip: "Semester goal"

Progress section:
- Large progress circle or arc: shows % complete — 60–70px diameter
- Below circle: "X of Y tasks complete"
- Due date: "Due: May 2026" — muted text

Milestones / Sub-tasks section:
- Section label: "Tasks linked to this goal"
- List of tasks connected to this goal
- Each task: checkbox + title + due date chip
- Completed tasks shown with strikethrough
- "+ Link task" or "+ Add task" button

Activity/notes section:
- Section label: "Notes"
- Freeform text area for notes about this goal
- Autosave — no save button

Danger zone (collapsed by bottom sheet):
- "Archive goal" / "Delete goal" — accessible via "..." menu in header

Style: Clean detail view. Progress circle or bar as the visual anchor.
No charts yet (V1). Minimal actions. Everything editable inline.
```

---

### Prompt 4C: Plan — Add / Edit Task Modal

```
Design an Add Task or Edit Task bottom sheet for a life OS app.

Triggered by: tapping "+ Add task" anywhere in the Plan screen, 
or converting a capture into a task.

Layout (bottom sheet, ~70% screen height):

1. Title input:
   - Full-width, large, autofocused
   - Placeholder: "What needs to be done?"
   - Borderless input — just the text cursor

2. Detail row — horizontal strip of property chips:
   - Due date: calendar icon + "No date" → tap to open date picker
   - Priority: flag icon + "Normal" → tap cycles through: Low / Normal / High
   - Goal: target icon + "No goal" → tap opens goal picker list

3. Goal picker (if tapped):
   - Simple list of user's active goals
   - Each goal: title + color dot
   - "No goal" option at top

4. Source tag (auto, non-editable):
   - If created from capture: small tag "From inbox" — faded
   - If AI suggested: small tag "AI suggested"

5. Action row:
   - Left: "Cancel"
   - Right: "Add task" (if new) or "Save" (if editing)
   - If editing: also show "Delete task" in red, left-aligned

Style:
- Borderless input feels like a notes app, not a form
- Property chips are pill-shaped, small, subtle — they add metadata without cluttering
- Quick to fill in: title + due date is the minimum. Everything else optional.
- Should take under 10 seconds to add a typical task.
```

---

## PAGE 5 — BUILD (HABITS + PROJECTS)

### Prompt 5A: Build — Full Page Layout

```
Design the Build screen for a life OS app.
This page covers Habits and active Projects. It's about what you're consistently constructing — not tracking, building.

Layout sections:

1. Header:
   - Title: "Build"
   - Subtitle: current day "Sunday, May 10"
   - Right: weekly consistency badge "This week: 82%"

2. Today's habits section:
   - Section label: "Habits · Today" + "3/5 done" count
   - Each habit as a row:
     - Left: habit name (14px, regular weight)
     - Right: circle checkmark button — unchecked (outlined), checked (filled green, animated tick)
     - Streak indicator: below habit name, very small — "🔥 12 days" or just "12d streak"
   - Checked habits visually deemphasized (lower opacity, stay in place — don't reorder)
   - All habits listed, no sorting options

3. Week heatmap (compact):
   - 7 columns × N habit rows mini-grid
   - Each cell: filled circle = done, outlined = missed, empty = future
   - Labels: Mon Tue Wed Thu Fri Sat Sun across top
   - Habit names down left side (abbreviated)
   - This is the "life metrics heatmap" feature — keep it compact, not a full-screen feature

4. Active projects section:
   - Section label: "Projects"
   - 2–3 project cards:
     - Project name (bold)
     - Status chip: "In progress" / "Blocked" / "Done"
     - Progress bar (thin)
     - Last updated: "2 days ago" — muted
   - "+ New project" text link

Bottom navigation: Home | Plan | Build (active) | Mind | Insights

Style:
- Habits section is the star — make it fast to interact with
- Heatmap should feel like GitHub contribution graph but smaller and cleaner
- Cards use consistent border + radius style
- Green is the primary color for this page
```

---

### Prompt 5B: Build — Habit Check-in (Component Only)

```
Design a single Habit Check-in row component for a life OS app.

States to design:
1. Unchecked (default): habit name left, outlined circle button right, streak small below name
2. Checking animation: circle fills green with a spring animation, checkmark draws in
3. Checked: circle filled green, checkmark icon inside, habit text slightly faded (not strikethrough)
4. Missed (past day): circle outlined in red/amber, small "missed" label or red dot
5. Future (not yet): circle outlined in very muted gray, non-interactive

Row structure:
- Left: habit icon (optional, 16px emoji or simple icon) + habit name
- Center (optional): cue text — very small, muted: "After lunch"
- Right: animated check circle — 28–32px tap target minimum
- Below left: "🔥 12d" streak — 10px, muted amber/orange

Interaction:
- Tap to toggle — single tap, instant
- No confirmation dialog
- Haptic feedback on check (mobile)

Size: full width, 48–56px height per row, comfortable touch target.

Style: Clean, satisfying interaction. 
The check animation is the key moment — make it feel rewarding.
```

---

### Prompt 5C: Build — Week Heatmap (Component Only)

```
Design a compact habit heatmap / life metrics heatmap component for a life OS app.

This shows the last 7 days × all habits as a grid.

Layout:
- Column headers: Mon Tue Wed Thu Fri Sat Sun — 10px, muted, centered above each column
- Row labels: habit name abbreviated to 8–10 chars max — 10px, right-aligned, muted
- Each cell: a small square or circle (12–16px)
  - Completed: filled, colored (green for habits)
  - Missed: outlined or faintly filled (red/amber tint)
  - Today: highlighted border (today's column)
  - Future: empty, very muted

Sizes:
- Mobile: cells ~14px with 4px gap
- The whole component should fit in ~100–120px height for 5 habits

States to show:
- Perfect week row (all filled)
- Partial week row (some filled, some missed)
- New habit row (only a few days have data)

Interaction: tap any cell to see date + whether habit was done (tooltip or small popover).

Below the grid: 1 summary line — "82% consistency this week — up from 74% last week"

Style: inspired by GitHub contribution graph.
Simple, data-dense, scannable. No legends needed.
Color: use green shades for completion intensity if showing multiple weeks in future.
For now: binary — done (solid green) or missed (outlined/faint).
```

---

## PAGE 6 — WEEKLY REVIEW (REFLECTION ENGINE)

### Prompt 6A: Weekly Review — Entry Screen

```
Design a Weekly Review entry screen for a life OS app.
This is the Sunday ritual — the Reflection Engine that makes the whole system compound.

Triggered: Sunday prompt notification, or always accessible from Insights tab.

Layout:

1. Header:
   - Back arrow
   - Title: "Week 12 Review"
   - Date range: "May 5 – May 11" — muted subtitle
   - Time estimate: "~15 min" — small badge on right

2. Auto-generated summary section (pulled from real data):
   - 3 metric cards in a row:
     - Tasks: "11 / 16 done" 
     - Habits: "82% consistency"
     - Captures: "7 logged"
   - Below: a mini summary sentence — auto-generated: "Your most consistent week in 3 weeks."
   - This section has a subtle background tint — it's read-only, AI/system generated

3. Rate the week:
   - Label: "How was this week overall? (1–10)"
   - A horizontal slider — 1 to 10
   - Current value shown large in center as you drag: "7"
   - Below slider: contextual label based on score:
     - 1–3: "Rough week — what got in the way?"
     - 4–6: "Steady — what could shift the needle?"
     - 7–8: "Strong week — what drove this?"
     - 9–10: "Outstanding — lock in what worked."

4. Reflection prompts (text inputs):
   - "What went well this week?"
     - Multiline text input, soft border, autogrow
     - Placeholder: "Wins, breakthroughs, momentum..."
   - "What struggled or got dropped?"
     - Placeholder: "Be honest — no judgment."
   - "One focus for next week?"
     - Single line input
     - Placeholder: "The most important thing."

5. AI summary button:
   - Full-width button: "Generate AI summary →"
   - Tapping calls AI layer with all data + user inputs
   - Loading state: animated, "Analyzing your week..."
   - Result: appears below as a card — the AI's synthesis of the week

6. Complete button:
   - "Save review" — saves to reflections table
   - Shows confetti/subtle celebration on save

Style:
- This screen should feel intentional and quiet — like opening a journal
- More generous spacing than other screens
- Soft warm tones (optional: slight warm tint on background vs the cooler dashboard)
- Reflection inputs are borderless or very soft-bordered
- AI summary card: purple/indigo left border accent
```

---

### Prompt 6B: Weekly Review — AI Summary Card (Component Only)

```
Design the AI-generated weekly summary card that appears after clicking "Generate AI summary" in the weekly review flow.

This card shows Claude/AI's analysis of the user's week.

Structure:
- Header: "AI · Week 12 Summary" — small label, indigo/purple color, with a small sparkle or AI icon
- Body: 3–4 paragraphs or bullet points of AI synthesis:
  - What worked (habits, tasks completed)
  - What didn't (goal drift, missed tasks)
  - A pattern noticed ("This is the 3rd week your ML project slipped — it might need a time block.")
  - One specific recommendation for next week
- Footer: timestamp "Generated Sunday, May 10 · 8:42 PM"
- Two small action buttons: "Copy" | "Edit" — ghost buttons, small

States:
1. Loading: skeleton shimmer over the card body, "Analyzing your week..." below header
2. Generated: full content visible, fade-in animation
3. Error: "Couldn't generate summary. Try again." with retry button

Style:
- Card has a very subtle indigo left border (3px) and faint indigo background tint
- AI text uses regular weight (not bold) — calm, not alarming
- Feels like a mentor's note, not a machine's output
- Max 150–200 words in the AI output — concise is the goal
```

---

## PAGE 7 — INSIGHTS (AI LAYER)

### Prompt 7A: Insights — Full Page Layout

```
Design the Insights screen for a life OS app.
This is the AI Intelligence layer — the premium view that synthesizes everything.

Layout sections:

1. Header:
   - Title: "Insights"
   - Subtitle: "Week 12 · updated 2h ago"

2. Weekly briefing card (top, most prominent):
   - Label: "Weekly briefing · AI"
   - Last generated date
   - Preview of AI briefing text (2–3 lines truncated)
   - "Read full briefing →" link
   - Status: if review not completed yet — "Complete your weekly review to generate this week's briefing."

3. Active alerts section:
   - Section label: "Alerts" + count badge
   - Each alert is a row with:
     - Colored left dot: red = urgent, amber = warning, blue = info
     - Alert text: short, 1 line — "ML project is 2 days past deadline."
     - Timestamp: "3 days ago" — muted right text
   - Empty state: "No active alerts. You're on track."

4. Patterns section:
   - Section label: "Patterns" — what the AI has noticed over time
   - Each pattern is a card:
     - Icon (subtle)
     - Pattern title: "Sleep consistency dropping"
     - Detail: "Last 3 weeks: 6.1h avg vs your 7.5h target."
     - Trend indicator: arrow down in amber
   - 2–3 patterns max shown, "See all" link

5. Recommendations section:
   - Section label: "Recommendations"
   - Numbered list of actionable suggestions from AI:
     1. "Block 2h on Tuesday for the ML project — it's your most consistent focus day."
     2. "Consider dropping one low-priority habit this week — you're at 5, and consistency is slipping."
   - Each recommendation has a "Done" button to dismiss

6. Goal trajectory section:
   - Each active goal with a trajectory indicator:
     - Goal name
     - "On track to complete by [date]" or "At current pace, you'll finish [X weeks late]"
     - Small mini-bar or dot indicator

Bottom navigation: Home | Plan | Build | Mind | Insights (active)

Style:
- Indigo/purple as the accent color throughout this page
- Data-informed but not overwhelming — this page should be skimmable in 60 seconds
- Alert section uses color-coded left borders
- Briefing card is the hero element — large, prominent
```

---

## SHARED COMPONENTS

### Prompt S1: Bottom Navigation Bar

```
Design a bottom navigation bar for a mobile life OS app.

5 tabs:
1. Home — house icon or grid icon
2. Plan — target/goal icon
3. Build — flame or building blocks icon
4. Mind — book or brain icon
5. Insights — sparkle or chart icon

Each tab:
- Icon (24px, outlined when inactive, filled when active)
- Label text below: 10px, same color as icon
- Active state: icon filled + label in primary text color
- Inactive state: icon outlined + label muted

Floating Capture Button:
- A "+" button positioned center-top of the nav bar, slightly elevated (floating)
- 52px circle, filled with primary accent color (amber or black)
- White "+" icon inside
- Raises above the nav bar with a subtle shadow or elevation effect
- This is the quick capture trigger — always accessible

Style:
- Nav bar background: white / dark surface, with a very subtle top border
- No background color on individual tabs
- Transition between tabs: icons smoothly switch fill state (100ms)
- Safe area aware on iPhone (bottom padding)
- On desktop/tablet: convert to a left sidebar with same 5 items + labels
```

---

### Prompt S2: Empty States

```
Design a set of empty state screens for a life OS app. One design pattern to cover all modules.

Empty states needed:
1. No tasks yet (Plan screen)
2. No habits set up (Build screen)
3. Inbox is clear — Inbox Zero (Capture inbox)
4. No insights yet (Insights screen)
5. No goals set (Plan — goals section)

Each empty state:
- A simple geometric illustration or icon (no stock art, no cartoon characters)
  - Prefer: abstract shapes, simple line drawings, or just a large icon
- Primary message: short, 3–5 words. Examples:
  - "Nothing here yet."
  - "Inbox zero."
  - "No insights yet."
- Secondary message: 1 line of guidance. Examples:
  - "Add your first task above."
  - "All caught up. Great work."
  - "Complete your first weekly review."
- Optional: a single CTA button if an action is needed (not always necessary)

Style:
- Illustration should be small — 80–100px height, centered
- Text centered below illustration
- Muted palette — this is a neutral moment, not a celebration
- Consistent across all empty states (same illustration style/weight)
- No emojis as illustrations — use actual icons or simple SVG shapes
```

---

### Prompt S3: Loading and Skeleton States

```
Design skeleton loading states for a life OS app.

Needed for:
1. Home screen — while data loads on first open
2. Insights screen — while AI briefing generates
3. Habit heatmap — while weekly data loads
4. Goal progress bars — while progress calculates

Skeleton style:
- Rectangular or pill-shaped gray blocks where content will appear
- Shimmer animation: a subtle light sweep left-to-right, looping
- Match the approximate size of the real content:
  - Large text: tall wide block
  - Metric card number: short wide block in card position
  - Progress bar: thin long block
  - Habit row: two blocks side by side (name + check circle)

AI-specific loading state (for Insights screen):
- Instead of pure skeleton: show a card with header ("AI · Generating...") 
  and animated typing dots or a pulse animation in the body area
- Small text below: "Analyzing your week..."

Duration expectation:
- Regular data: skeleton for <1s
- AI generation: show a more verbose loading state since it takes 2–5s
  - Optional: show progress stages: "Reading your data... Identifying patterns... Writing your briefing..."

Style: 
- Skeleton base: #E5E5E5 (light) / #2A2A2A (dark)
- Shimmer: slightly lighter shade moving across
- No text in skeleton states — shapes only
```

---

## DESIGN SYSTEM REFERENCE

### Prompt DS1: Full Design System Definition

```
Create a design system specification document for a life OS app called "OS" (or user-named).

Define:

Colors:
- Background primary: #FFFFFF / #0F0F0F
- Background secondary: #F5F5F5 / #1A1A1A
- Background tertiary: #EBEBEB / #252525
- Text primary: #111111 / #F0F0F0
- Text secondary: #555555 / #A0A0A0
- Text tertiary: #999999 / #606060
- Border: #E0E0E0 / #2A2A2A

Module accent colors (subtle, used for left borders and tints):
- Capture: Amber #F59E0B
- Goals / Plan: Blue #3B82F6
- Habits / Build: Green #22C55E
- Knowledge / Mind: Violet #8B5CF6
- AI / Insights: Indigo #6366F1
- Warning: Amber #F59E0B
- Error / Risk: Red #EF4444
- Success: Green #22C55E

Typography:
- Font family: Inter or Geist (system fallback: -apple-system, sans-serif)
- Scale: 10 / 11 / 12 / 14 / 16 / 20 / 24 / 32px
- Weights: 400 (regular), 500 (medium), 600 (semibold) — no 700 bold except titles
- Line height: 1.4 for body, 1.2 for headings, 1.6 for long-form text

Spacing:
- Base unit: 4px
- Common values: 4 / 8 / 12 / 16 / 24 / 32 / 48px
- Section padding: 16px horizontal, 24px vertical
- Card padding: 12px all sides

Border radius:
- Small (chips, badges): 6px
- Medium (inputs, rows): 10px
- Large (cards, modals): 14px
- Full (pills, avatars): 999px

Elevation / Shadows:
- None by default — use borders instead
- Exception: FAB (+) button: subtle shadow for lift effect only

Component rules:
- Cards: 1px border, no shadow, 14px radius
- Inputs: 1px border, 10px radius, subtle focus ring (2px, accent color, 30% opacity)
- Buttons primary: filled, text white/black, 10px radius
- Buttons ghost: 1px border, transparent background
- Chips: 6px radius, 1px border, compact padding (4px 10px)
- Section labels: 11px, uppercase, letter-spacing 0.06em, muted color

Animation:
- Duration: 150ms for micro-interactions, 250ms for transitions, 200ms for overlays
- Easing: ease-out for enters, ease-in for exits, spring for check animations
- Habit check: spring scale + fill animation
- Sheet slide-up: spring ease, 200ms
```

---

*End of UI/UX Prompt Library — Life OS V1*
*Total screens covered: 7 pages + shared components + design system*
*All prompts are self-contained and can be used independently or in sequence.*
