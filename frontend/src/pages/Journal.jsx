import React, { useState, useEffect } from 'react';
import { BookText, Plus, Smile, Frown, Meh, Sparkles, Compass } from 'lucide-react';
import api from '../services/api';

const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Journal Fields
  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('Good');
  const [lessons, setLessons] = useState('');

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const data = await api.getJournal();
      setJournals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    if (!title || !reflection) return;
    try {
      const created = await api.createJournal({
        title,
        date: new Date().toISOString().split('T')[0],
        reflection,
        mood,
        lessons
      });
      setJournals([created, ...journals]);
      setTitle('');
      setReflection('');
      setLessons('');
      setMood('Good');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getMoodIcon = (moodStr) => {
    switch (moodStr) {
      case 'Great': return <Smile className="text-[#10b981]" size={18} />;
      case 'Good': return <Smile className="text-[#3b82f6]" size={18} />;
      case 'Okay': return <Meh className="text-[#f59e0b]" size={18} />;
      case 'Bad': return <Frown className="text-[#ef4444]" size={18} />;
      default: return <Smile className="text-gray-400" size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">Synchronizing Journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">Reflection & Journal</h2>
          <p className="text-gray-400 text-sm mt-1">Review decisions, mental states, and lessons learned daily.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateJournal} className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-lg font-semibold text-white">Log Today's Reflection</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Title</label>
            <input 
              type="text" 
              placeholder="e.g. Day 12: Fixed the backend latency issue!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Daily Mood</label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="Great">😀 Great</option>
                <option value="Good">🙂 Good</option>
                <option value="Okay">😐 Okay</option>
                <option value="Bad">😞 Bad</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Reflection details</label>
            <textarea 
              placeholder="How was your focus today? What went right? What failed?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] h-28 resize-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Lessons Learned</label>
            <input 
              type="text" 
              placeholder="What core lesson did you extract today?"
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl transition-colors text-sm font-semibold"
            >
              Post Entry
            </button>
          </div>
        </form>
      )}

      {/* Journals list */}
      <div className="space-y-6">
        {journals.length === 0 ? (
          <p className="text-sm text-gray-500">No journal logs written yet. Write one today!</p>
        ) : journals.map(log => (
          <div key={log.id} className="glass p-6 rounded-2xl border border-white/5 bg-white/2 space-y-4 hover:bg-white/3 transition-all">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-xs text-[#3b82f6] font-semibold">{log.date?.start || log.date || 'Today'}</span>
                <h3 className="text-lg font-bold text-white leading-tight">{log.title}</h3>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                {getMoodIcon(log.mood)}
                <span className="text-xs font-semibold text-gray-300">{log.mood}</span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{log.reflection}</p>

            {log.lessons && (
              <div className="bg-[#f97316]/5 border border-[#f97316]/20 p-3.5 rounded-xl flex items-start gap-3">
                <Sparkles className="text-[#f97316] shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#f97316]">Core Lesson</h4>
                  <p className="text-xs text-gray-300 mt-0.5">{log.lessons}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
