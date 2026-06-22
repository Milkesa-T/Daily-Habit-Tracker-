import {
  Activity,
  AlignLeft,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  Flame,
  Plus,
  Repeat,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import api from "../services/api";
import { scheduleNotification } from "../services/notifications.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);

/** Returns true if the habit needs to reset (last completed on a previous day) */
function shouldReset(habit) {
  if (!habit.completed) return false;
  const lcd = habit.lastCompletedDate?.start || habit.lastCompletedDate;
  if (!lcd) return false;
  return lcd < today();
}

// ─── Sub-components ──────────────────────────────────────────────────────────
const PriorityBadge = ({ p }) => {
  const cls =
    p === "High"
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : p === "Medium"
        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        : "bg-green-500/10 text-green-400 border-green-500/20";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border ${cls} font-semibold`}
    >
      {p || "Med"}
    </span>
  );
};

const TimeRange = ({ start, end, color = "#3b82f6" }) =>
  start ? (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
      <Clock size={11} style={{ color }} />
      <span>
        {start}
        {end ? ` → ${end}` : ""}
      </span>
    </div>
  ) : null;

const TimeframeBadge = ({ tf }) => {
  if (!tf) return null;
  const cls =
    tf === "Daily"
      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
      : tf === "Weekly"
        ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
        : "text-orange-400 bg-orange-500/10 border-orange-500/20";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cls}`}
    >
      {tf}
    </span>
  );
};

// ─── Task Quick-Add Form ──────────────────────────────────────────────────────
const TaskQuickAdd = ({ onAdd }) => {
  const [form, setForm] = useState({
    title: "",
    priority: "Medium",
    category: "Projects",
    timeframe: "Daily",
    startTime: "",
    endTime: "",
    dueDate: "",
    description: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    onAdd({
      ...form,
      status: "Todo",
      completed: false,
      dueDate: form.dueDate ? { start: form.dueDate, end: null } : null,
    });
    setForm({
      title: "",
      priority: "Medium",
      category: "Projects",
      timeframe: "Daily",
      startTime: "",
      endTime: "",
      dueDate: "",
      description: "",
    });
  };

  const inputCls =
    "w-full bg-[#0b0c10] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] placeholder-gray-600";
  const selectCls =
    "bg-[#0b0c10] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] flex-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2.5 p-3 bg-white/5 rounded-xl border border-white/5 text-xs"
    >
      <input
        type="text"
        placeholder="Task title..."
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        className={inputCls}
        required
        autoFocus
      />

      {/* Time range */}
      <div className="flex gap-2 items-center">
        <Clock size={13} className="text-[#3b82f6] shrink-0" />
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => set("startTime", e.target.value)}
          className={`${selectCls} flex-1`}
        />
        <span className="text-gray-500">→</span>
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => set("endTime", e.target.value)}
          className={`${selectCls} flex-1`}
        />
      </div>

      {/* Due date + timeframe */}
      <div className="flex gap-2">
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => set("dueDate", e.target.value)}
          className={`${selectCls}`}
        />
        <select
          value={form.timeframe}
          onChange={(e) => set("timeframe", e.target.value)}
          className={selectCls}
        >
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Priority + Category */}
      <div className="flex gap-2">
        <select
          value={form.priority}
          onChange={(e) => set("priority", e.target.value)}
          className={selectCls}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={selectCls}
        >
          {[
            "English",
            "Internship",
            "Projects",
            "Cybersecurity",
            "CP",
            "Forex",
            "Spiritual",
            "Reading",
            "Career",
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <textarea
        rows={2}
        placeholder="Description (optional)..."
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        className={`${inputCls} resize-none`}
      />

      <button
        type="submit"
        className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-2 rounded-lg text-xs font-semibold transition-colors"
      >
        Add Task
      </button>
    </form>
  );
};

// ─── Habit Quick-Add Form ─────────────────────────────────────────────────────
const HabitQuickAdd = ({ onAdd }) => {
  const [form, setForm] = useState({
    habitName: "",
    category: "Coding",
    customCategory: "",
    frequency: "Daily",
    customFrequency: "",
    startTime: "",
    endTime: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const categoryOptions = [
    "Coding",
    "Spiritual",
    "English",
    "Health",
    "Career",
    "Custom",
  ];
  const frequencyOptions = ["Daily", "Weekly", "Monthly", "Custom"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.habitName) return;

    const category =
      form.category === "Custom" ? form.customCategory.trim() : form.category;
    const frequency =
      form.frequency === "Custom"
        ? form.customFrequency.trim()
        : form.frequency;
    if (!category || !frequency) return;

    onAdd({
      habitName: form.habitName,
      category,
      frequency,
      startTime: form.startTime,
      endTime: form.endTime,
      completed: false,
      streak: 0,
      isRoutine: false,
    });
    setForm({
      habitName: "",
      category: "Coding",
      customCategory: "",
      frequency: "Daily",
      customFrequency: "",
      startTime: "",
      endTime: "",
    });
  };

  const inputCls =
    "w-full bg-[#0b0c10] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] placeholder-gray-600";
  const selectCls =
    "bg-[#0b0c10] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] flex-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2.5 p-3 bg-white/5 rounded-xl border border-white/5"
    >
      <input
        type="text"
        placeholder="Habit name..."
        value={form.habitName}
        onChange={(e) => set("habitName", e.target.value)}
        className={inputCls}
        required
        autoFocus
      />

      <div className="flex gap-2 items-center">
        <Clock size={13} className="text-[#10b981] shrink-0" />
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => set("startTime", e.target.value)}
          className={`${selectCls}`}
        />
        <span className="text-gray-500 text-xs">→</span>
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => set("endTime", e.target.value)}
          className={`${selectCls}`}
        />
      </div>

      <div className="flex gap-2">
        <select
          value={form.frequency}
          onChange={(e) => set("frequency", e.target.value)}
          className={selectCls}
        >
          {frequencyOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={selectCls}
        >
          {categoryOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      {form.category === "Custom" && (
        <input
          type="text"
          placeholder="Custom category"
          value={form.customCategory}
          onChange={(e) => set("customCategory", e.target.value)}
          className={inputCls}
          required
        />
      )}

      {form.frequency === "Custom" && (
        <input
          type="text"
          placeholder="Custom frequency"
          value={form.customFrequency}
          onChange={(e) => set("customFrequency", e.target.value)}
          className={inputCls}
          required
        />
      )}

      <button
        type="submit"
        className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-2 rounded-lg text-xs font-semibold transition-colors"
      >
        Add Habit
      </button>
    </form>
  );
};

// ─── Task Detail Modal ────────────────────────────────────────────────────────
const TaskModal = ({ task, onClose, onUpdateStatus, onDeleteTask }) => {
  const dateRange = task.dueDate;
  const startDate = dateRange?.start || dateRange;
  const endDate = dateRange?.end;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-5 pr-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PriorityBadge p={task.priority} />
            <TimeframeBadge tf={task.timeframe} />
            {task.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                {task.category}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white leading-tight">
            {task.title}
          </h3>
        </div>

        <div className="space-y-3">
          {/* Description */}
          {task.description && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1.5 flex items-center gap-1.5">
                <AlignLeft size={12} /> Description
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Time & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                Time Range
              </p>
              {task.startTime ? (
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Clock size={13} className="text-[#3b82f6]" />
                  {task.startTime}
                  {task.endTime ? ` – ${task.endTime}` : ""}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Not set</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                Due Date
              </p>
              {startDate ? (
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#f97316]" />
                  {new Date(startDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                  {endDate &&
                    ` – ${new Date(endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No deadline</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Current Status
            </p>
            <span
              className={`text-sm font-bold ${task.status === "Done" ? "text-green-400" : task.status === "Doing" ? "text-blue-400" : "text-gray-400"}`}
            >
              {task.status || "Todo"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              onUpdateStatus(task.id, "Doing");
              onClose();
            }}
            className="flex-1 py-2.5 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 rounded-xl font-semibold transition-colors text-sm border border-blue-500/20"
          >
            Mark Doing
          </button>
          <button
            onClick={() => {
              onUpdateStatus(task.id, "Done");
              onClose();
            }}
            className="flex-1 py-2.5 bg-green-500/15 text-green-400 hover:bg-green-500/25 rounded-xl font-semibold transition-colors text-sm border border-green-500/20"
          >
            Mark Done ✓
          </button>
          <button
            onClick={() => {
              if (window.confirm("Delete this task?")) {
                onDeleteTask(task.id);
                onClose();
              }
            }}
            className="flex-none p-2.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-xl transition-colors border border-red-500/20"
            title="Delete Task"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showQuickAdd, setShowQuickAdd] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFilter, setTaskFilter] = useState("All"); // All | Daily | Weekly | Monthly

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, habitsData, goalsData, projectsData] =
          await Promise.all([
            api.getTasks(),
            api.getHabits(),
            api.getGoals(),
            api.getProjects(),
          ]);
        // Apply daily reset logic: if a routine was completed yesterday, show as unchecked today
        const resettedHabits = habitsData.map((h) =>
          shouldReset(h) ? { ...h, completed: false } : h,
        );
        setTasks(tasksData);
        setHabits(resettedHabits);
        setGoals(goalsData);
        setProjects(projectsData);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addTask = async (data) => {
    try {
      const newTask = await api.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      setShowQuickAdd(null);
      // Schedule a native notification if the task has a start time
      if (newTask.startTime) {
        const date = newTask.dueDate?.start || newTask.dueDate || today();
        scheduleNotification({
          id: newTask.id,
          title: `⏰ Task: ${newTask.title}`,
          body: newTask.description || `Starting at ${newTask.startTime}`,
          date,
          time: newTask.startTime,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addHabit = async (data) => {
    try {
      const newHabit = await api.createHabit(data);
      setHabits((prev) => [newHabit, ...prev]);
      setShowQuickAdd(null);
      // Schedule a native notification if the habit has a start time
      if (newHabit.startTime) {
        scheduleNotification({
          id: newHabit.id,
          title: `🔥 Habit: ${newHabit.habitName}`,
          body: `Time to do your ${newHabit.category || ""} habit! Starting at ${newHabit.startTime}`,
          date: today(),
          time: newHabit.startTime,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHabit = async (habit) => {
    const newCompleted = !habit.completed;
    const newStreak = newCompleted
      ? (habit.streak || 0) + 1
      : Math.max(0, (habit.streak || 1) - 1);
    const payload = {
      completed: newCompleted,
      streak: newStreak,
      ...(newCompleted ? { lastCompletedDate: today() } : {}),
    };
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, completed: newCompleted, streak: newStreak }
          : h,
      ),
    );
    try {
      await api.updateHabit(habit.id, payload);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHabit = async (id) => {
    if (!window.confirm("Delete this habit?")) return;
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12
      ? "Good Morning, Engineer"
      : h < 18
        ? "Good Afternoon, Engineer"
        : "Good Evening, Engineer";
  };

  // Metrics
  const totalStreaks = habits.reduce((a, h) => a + (h.streak || 0), 0);
  const completedHabitsToday = habits.filter((h) => h.completed).length;
  const projectProgress =
    projects.length > 0
      ? Math.round(
          (projects.reduce((a, p) => a + (p.progress || 0), 0) /
            projects.length) *
            100,
        )
      : 0;

  // Dynamic day counter — system started 2026-05-28
  const SYSTEM_START = new Date("2026-05-28T00:00:00");
  const currentDay = Math.min(
    135,
    Math.max(1, Math.round((Date.now() - SYSTEM_START) / 86400000) + 1),
  );
  const phaseProgress = Math.round((currentDay / 135) * 100);
  const currentPhase =
    currentDay <= 34
      ? "Phase 1: Foundation"
      : currentDay <= 67
        ? "Phase 2: Build"
        : currentDay <= 100
          ? "Phase 3: Ship"
          : "Phase 4: Excel";

  // Filtered tasks
  const filteredTasks = tasks.filter(
    (t) =>
      t.status !== "Done" &&
      (taskFilter === "All" || t.timeframe === taskFilter),
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">
            Synchronizing with Notion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto space-y-8 relative">
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={updateTaskStatus}
          onDeleteTask={deleteTask}
        />
      )}

      {/* Welcome Panel */}
      <div className="glass p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full color-coding uppercase tracking-wider">
            Day {currentDay} of 135
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {getGreeting()}
          </h2>
          <p className="text-gray-400 text-sm max-w-md">
            "Habit is the intersection of knowledge, skill, and desire."
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 w-full md:w-auto">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">
              Current Phase
            </p>
            <p className="text-sm font-semibold text-white">{currentPhase}</p>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">
              Overall Progress
            </p>
            <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#3b82f6] h-full transition-all duration-500"
                style={{ width: `${phaseProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {phaseProgress}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Streaks",
            value: `${totalStreaks}d`,
            icon: <Flame className="text-[#3b82f6]" size={22} />,
            cls: "color-coding",
          },
          {
            label: "Habits Today",
            value: `${completedHabitsToday}/${habits.length}`,
            icon: <CheckCircle className="text-[#10b981]" size={22} />,
            cls: "color-spiritual",
          },
          {
            label: "Tasks Pending",
            value: tasks.filter((t) => t.status !== "Done").length,
            icon: <Calendar className="text-[#f97316]" size={22} />,
            cls: "color-forex",
          },
          {
            label: "Active Goals",
            value: goals.filter((g) => g.status !== "Completed").length,
            icon: <Target className="text-[#8b5cf6]" size={22} />,
            cls: "color-career",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass p-5 rounded-2xl flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl ${s.cls} flex items-center justify-center border`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main 3-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Tasks Column ── */}
        <div className="glass p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Today's Focus</h3>
            <button
              onClick={() =>
                setShowQuickAdd(showQuickAdd === "task" ? null : "task")
              }
              className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex gap-1.5">
            {["All", "Daily", "Weekly", "Monthly"].map((f) => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-colors border ${
                  taskFilter === f
                    ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {showQuickAdd === "task" && <TaskQuickAdd onAdd={addTask} />}

          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white/2 border border-white/5 rounded-2xl">
                <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="text-[#3b82f6]" size={24} />
                </div>
                <p className="text-sm font-semibold text-gray-200">
                  All caught up!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  No {taskFilter !== "All" ? taskFilter.toLowerCase() : ""}{" "}
                  tasks pending.
                </p>
              </div>
            ) : (
              filteredTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex flex-col p-3 bg-white/2 hover:bg-white/[0.06] border border-white/5 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-snug">
                      {task.title}
                    </span>
                    <PriorityBadge p={task.priority} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <TimeRange start={task.startTime} end={task.endTime} />
                    <TimeframeBadge tf={task.timeframe} />
                  </div>
                  {/* Quick-action buttons */}
                  <div
                    className="flex gap-2 mt-2.5 pt-2.5 border-t border-white/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => updateTaskStatus(task.id, "Doing")}
                      className="flex-1 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      Doing
                    </button>
                    <button
                      onClick={() => updateTaskStatus(task.id, "Done")}
                      className="flex-1 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      Done ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Habits Column ── */}
        <div className="glass p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Daily Routines</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                <Repeat size={10} /> Auto-reset daily
              </span>
              <button
                onClick={() =>
                  setShowQuickAdd(showQuickAdd === "habit" ? null : "habit")
                }
                className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {showQuickAdd === "habit" && <HabitQuickAdd onAdd={addHabit} />}

          <div className="space-y-2">
            {habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white/2 border border-white/5 rounded-2xl mt-4">
                <div className="w-12 h-12 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-3">
                  <Activity className="text-[#10b981]" size={24} />
                </div>
                <p className="text-sm font-semibold text-gray-200">
                  No routines yet
                </p>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Start tracking daily habits.
                </p>
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`flex flex-col p-3 border rounded-xl transition-all ${
                    habit.completed
                      ? "bg-[#10b981]/5 border-[#10b981]/25"
                      : "bg-white/2 border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={habit.completed || false}
                        onChange={() => toggleHabit(habit)}
                        className="w-4 h-4 accent-[#10b981] rounded cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-sm font-medium ${habit.completed ? "text-[#10b981] line-through" : "text-gray-200"}`}
                      >
                        {habit.habitName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <Flame size={13} className="text-orange-500" />
                      <span className="font-semibold">{habit.streak || 0}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHabit(habit.id);
                        }}
                        className="ml-2 text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Delete Habit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Time range for habit */}
                  {(habit.startTime || habit.category) && (
                    <div className="flex items-center justify-between mt-1.5 pl-6">
                      <TimeRange
                        start={habit.startTime}
                        end={habit.endTime}
                        color="#10b981"
                      />
                      {habit.category && (
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                          {habit.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Projects Column & Chart ── */}
        <div className="flex flex-col gap-6">
          {/* Projects */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Active Projects
              </h3>
              <span className="text-xs text-gray-400 font-semibold">
                {projectProgress}% avg
              </span>
            </div>
            <div className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No projects yet.
                </p>
              ) : (
                projects.slice(0, 4).map((project) => (
                  <div
                    key={project.id}
                    className="space-y-2 p-3 bg-white/2 border border-white/5 rounded-xl"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-gray-200">
                        {project.projectName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#3b82f6] font-medium">
                          {project.status || "Building"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#3b82f6] h-full rounded-full transition-all duration-500"
                          style={{ width: `${(project.progress || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-400">
                        {Math.round((project.progress || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Habit Streaks Chart */}
          <div className="glass p-6 rounded-2xl flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Streaks
            </h3>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={habits.slice(0, 5).map((h) => ({
                    name: h.habitName.split(" ")[0],
                    streak: h.streak || 0,
                  }))}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="streak" radius={[4, 4, 0, 0]}>
                    {habits.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#10b981" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
