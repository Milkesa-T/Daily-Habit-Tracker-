import React, { useState, useEffect } from 'react';
import { Flame, Plus, Check, Undo, Sparkles, Compass, Trash2, Edit2, Activity, Clock } from 'lucide-react';
import api from '../services/api';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('Coding');
  const [frequency, setFrequency] = useState('Daily');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const data = await api.getHabits();
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!habitName) return;
    try {
      if (editingId) {
        // Edit mode
        const updated = await api.updateHabit(editingId, { habitName, category, frequency, startTime, endTime });
        setHabits(habits.map(h => h.id === editingId ? { ...h, habitName, category, frequency, startTime, endTime } : h));
      } else {
        // Create mode
        const created = await api.createHabit({
          habitName,
          completed: false,
          streak: 0,
          frequency,
          category,
          startTime,
          endTime
        });
        setHabits([created, ...habits]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setHabitName('');
    setCategory('Coding');
    setFrequency('Daily');
    setStartTime('');
    setEndTime('');
    setEditingId(null);
    setShowAddForm(false);
  };

  const startEdit = (habit) => {
    setHabitName(habit.habitName);
    setCategory(habit.category || 'Coding');
    setFrequency(habit.frequency || 'Daily');
    setStartTime(habit.startTime || '');
    setEndTime(habit.endTime || '');
    setEditingId(habit.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleHabit = async (habit) => {
    const nextCompleted = !habit.completed;
    const nextStreak = nextCompleted ? (habit.streak || 0) + 1 : Math.max(0, (habit.streak || 1) - 1);
    
    try {
      // Optimistic Update
      setHabits(habits.map(h => h.id === habit.id ? { ...h, completed: nextCompleted, streak: nextStreak } : h));
      
      await api.updateHabit(habit.id, {
        completed: nextCompleted,
        streak: nextStreak
      });
    } catch (err) {
      // Revert if error
      setHabits(habits.map(h => h.id === habit.id ? { ...h, completed: habit.completed, streak: habit.streak } : h));
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      await api.deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">Synchronizing Habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">Habits Tracker</h2>
          <p className="text-gray-400 text-sm mt-1">Develop structural habits to force daily discipline.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          <Plus size={16} />
          <span>New Habit</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateHabit} className="glass p-6 rounded-2xl border border-white/10 space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Habit' : 'Create New Habit'}</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Habit Title</label>
            <input 
              type="text" 
              placeholder="e.g. Solve 2 LeetCode problems"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="Coding">💻 Coding</option>
                <option value="Spiritual">🙏 Spiritual</option>
                <option value="English">📚 English</option>
                <option value="Health">💪 Health</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Frequency</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Start Time</label>
              <input 
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">End Time</label>
              <input 
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl transition-colors text-sm font-semibold"
            >
              {editingId ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Grid of habits */}
      {habits.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-white/5 mt-8 max-w-2xl mx-auto">
          <Activity className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-semibold">No habits tracked yet</p>
          <p className="text-gray-600 text-sm mt-1">Add your daily or weekly routines to build consistency.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className={`glass p-5 rounded-2xl flex flex-col justify-between border transition-all duration-300 relative overflow-hidden group ${
              habit.completed 
                ? 'bg-[#10b981]/5 border-[#10b981]/20' 
                : 'bg-white/2 border-white/5 hover:bg-white/5'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                    habit.category === 'Spiritual' ? 'color-spiritual border-[#10b981]/20' :
                    habit.category === 'English' ? 'color-english border-[#f59e0b]/20' :
                    habit.category === 'Coding' ? 'color-coding border-[#3b82f6]/20' :
                    'color-career border-[#8b5cf6]/20'
                  }`}>
                    {habit.category || 'Focus'}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{habit.frequency}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(habit); }}
                    className="text-gray-500 hover:text-[#3b82f6] transition-colors p-1"
                    title="Edit Habit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteHabit(habit.id); }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    title="Delete Habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className={`text-base font-semibold leading-tight ${habit.completed ? 'text-[#10b981] line-through' : 'text-white'}`}>
                {habit.habitName}
              </h3>
              {habit.startTime && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <Clock size={13} className="text-[#10b981]" />
                  <span>{habit.startTime}{habit.endTime ? ` → ${habit.endTime}` : ''}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Flame size={16} className={habit.streak > 0 ? "text-orange-500 animate-pulse" : "text-gray-500"} />
                <span className="font-semibold text-gray-300">{habit.streak || 0} Day Streak</span>
              </div>

              <button
                onClick={() => handleToggleHabit(habit)}
                className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center border ${
                  habit.completed 
                    ? 'bg-[#10b981]/20 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/30' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {habit.completed ? <Undo size={16} /> : <Check size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default HabitTracker;
