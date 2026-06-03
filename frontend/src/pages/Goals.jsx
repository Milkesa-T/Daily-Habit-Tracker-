import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Edit, Save, Compass, AlignLeft, ArrowRight, CheckCircle, Clock, Trash2 } from 'lucide-react';
import api from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (dateVal) => {
  const raw = dateVal?.start || dateVal;
  if (!raw) return null;
  return new Date(raw + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calcDuration = (startVal, endVal) => {
  const s = startVal?.start || startVal;
  const e = endVal?.start || endVal;
  if (!s || !e) return null;
  const days = Math.round((new Date(e) - new Date(s)) / 86400000);
  return days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : null;
};

const calcElapsed = (startVal) => {
  const s = startVal?.start || startVal;
  if (!s) return null;
  const days = Math.round((Date.now() - new Date(s + 'T00:00:00')) / 86400000);
  if (days < 0) return 'Not started yet';
  return `Day ${days + 1}`;
};

const CATEGORY_STYLES = {
  Spiritual: 'color-spiritual border-[#10b981]/25',
  English:   'color-english border-[#f59e0b]/25',
  Coding:    'color-coding border-[#3b82f6]/25',
  Career:    'color-career border-[#8b5cf6]/25',
  Finance:   'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

// ─── Component ───────────────────────────────────────────────────────────────
const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    goalTitle: '',
    category: 'Coding',
    description: '',
    startDate: '',
    targetDate: '',
  });

  // Progress editing
  const [editingId, setEditingId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!form.goalTitle) return;
    try {
      const payload = {
        goalTitle:   form.goalTitle,
        category:    form.category,
        description: form.description,
        startDate:   form.startDate  || null,
        targetDate:  form.targetDate || null,
        progress:    0,
        status:      'Not Started',
      };
      const created = await api.createGoal(payload);
      setGoals([created, ...goals]);
      setForm({ goalTitle: '', category: 'Coding', description: '', startDate: '', targetDate: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditProgress = (goal) => {
    setEditingId(goal.id);
    setEditProgress(Math.round((goal.progress || 0) * 100));
  };

  const saveProgress = async (goal) => {
    try {
      const floatProgress = editProgress / 100;
      const status = floatProgress === 1 ? 'Completed' : floatProgress > 0 ? 'In Progress' : 'Not Started';
      setGoals(goals.map(g => g.id === goal.id ? { ...g, progress: floatProgress, status } : g));
      setEditingId(null);
      await api.updateGoal(goal.id, { progress: floatProgress, status });
    } catch (err) {
      console.error(err);
      loadGoals();
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">Synchronizing Goals...</p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] placeholder-gray-600";

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">Milestones & Goals</h2>
          <p className="text-gray-400 text-sm mt-1">Define long-term achievements with clear start and end dates.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          <Plus size={16} />
          <span>Add Goal</span>
        </button>
      </div>

      {/* ─── Add Goal Form ─────────────────────────────────────────────────────── */}
      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-lg font-semibold text-white">New Milestone</h3>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g. Land a software engineering internship"
              value={form.goalTitle}
              onChange={e => set('goalTitle', e.target.value)}
              className={inputCls}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
              <AlignLeft size={11} /> Description
            </label>
            <textarea
              rows={3}
              placeholder="What does success look like? What steps will you take?"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={inputCls}
            >
              <option value="Coding">💻 Coding</option>
              <option value="Spiritual">🙏 Spiritual</option>
              <option value="English">📚 English</option>
              <option value="Career">🎯 Career</option>
              <option value="Finance">📈 Finance</option>
            </select>
          </div>

          {/* Start Date + Target/End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                <Calendar size={11} className="text-[#10b981]" /> Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                <Calendar size={11} className="text-red-400" /> Deadline (End Date)
              </label>
              <input
                type="date"
                value={form.targetDate}
                onChange={e => set('targetDate', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl transition-colors text-sm font-semibold">
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* ─── Goals Grid ────────────────────────────────────────────────────────── */}
      {goals.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-white/5">
          <Target className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-semibold">No goals yet</p>
          <p className="text-gray-600 text-sm mt-1">Add your first milestone to start tracking progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const startDateStr = goal.startDate?.start || goal.startDate;
            const endDateStr   = goal.targetDate?.start || goal.targetDate;
            const elapsed      = calcElapsed(startDateStr);
            const duration     = calcDuration(startDateStr, endDateStr);
            const pct          = Math.round((goal.progress || 0) * 100);

            return (
              <div key={goal.id}
                className="glass p-6 rounded-2xl flex flex-col justify-between border border-white/5 bg-white/2 hover:bg-white/[0.04] transition-all">

                {/* Top: category + status */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2 flex-wrap relative">
                    <div className="flex gap-2 items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${CATEGORY_STYLES[goal.category] || 'color-career border-[#8b5cf6]/25'}`}>
                        {goal.category || 'System'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        goal.status === 'Completed'  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25' :
                        goal.status === 'In Progress' ? 'bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25' :
                        'bg-gray-500/10 text-gray-400 border border-white/5'
                      }`}>
                        {goal.status === 'Completed' && <CheckCircle size={10} className="inline mr-1" />}
                        {goal.status || 'Not Started'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Delete Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white leading-tight">{goal.goalTitle}</h3>

                  {/* Description */}
                  {goal.description && (
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 bg-white/3 border border-white/5 rounded-xl p-3">
                      {goal.description}
                    </p>
                  )}

                  {/* Date Range */}
                  {(startDateStr || endDateStr) && (
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {startDateStr && (
                        <div className="flex items-center gap-1.5 text-[#10b981]">
                          <Calendar size={12} />
                          <span className="font-semibold">{fmt(startDateStr)}</span>
                        </div>
                      )}
                      {startDateStr && endDateStr && (
                        <ArrowRight size={12} className="text-gray-500" />
                      )}
                      {endDateStr && (
                        <div className="flex items-center gap-1.5 text-red-400">
                          <Calendar size={12} />
                          <span className="font-semibold">{fmt(endDateStr)}</span>
                        </div>
                      )}
                      {duration && (
                        <span className="ml-auto text-gray-500 font-medium">{duration}</span>
                      )}
                    </div>
                  )}

                  {/* Elapsed */}
                  {elapsed && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={11} className="text-[#3b82f6]" />
                      <span>{elapsed} of this goal</span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mt-6 space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400">Progress — {pct}%</span>
                    {editingId === goal.id ? (
                      <button onClick={() => saveProgress(goal)}
                        className="flex items-center gap-1 text-xs text-[#10b981] hover:underline font-semibold">
                        <Save size={12} /><span>Save</span>
                      </button>
                    ) : (
                      <button onClick={() => startEditProgress(goal)}
                        className="flex items-center gap-1 text-xs text-[#3b82f6] hover:underline font-semibold">
                        <Edit size={12} /><span>Update</span>
                      </button>
                    )}
                  </div>

                  {editingId === goal.id ? (
                    <div className="flex items-center gap-4">
                      <input type="range" min="0" max="100" value={editProgress}
                        onChange={e => setEditProgress(parseInt(e.target.value))}
                        className="flex-1 accent-[#3b82f6] h-1.5 bg-white/10 rounded-lg cursor-pointer" />
                      <span className="text-xs font-semibold text-white w-8">{editProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-[#10b981]' : 'bg-[#3b82f6]'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-200">{pct}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
