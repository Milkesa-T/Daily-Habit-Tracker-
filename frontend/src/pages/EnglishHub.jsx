import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Trash2, Award, Compass } from 'lucide-react';
import api from '../services/api';

const EnglishHub = () => {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMastery, setFilterMastery] = useState('All');
  
  // Form states
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadVocab();
  }, []);

  const loadVocab = async () => {
    setLoading(true);
    try {
      const data = await api.getEnglish();
      setVocab(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    try {
      const created = await api.createEnglish({
        word,
        meaning,
        exampleSentence,
        masteryStatus: 'Learning'
      });
      setVocab([created, ...vocab]);
      setWord('');
      setMeaning('');
      setExampleSentence('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateMastery = async (item, newStatus) => {
    try {
      // Optimistic Update
      setVocab(vocab.map(v => v.id === item.id ? { ...v, masteryStatus: newStatus } : v));
      await api.updateEnglish(item.id, { masteryStatus: newStatus });
    } catch (err) {
      console.error(err);
      loadVocab();
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEnglish(id);
      setVocab(vocab.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVocab = vocab.filter(item => {
    const matchesSearch = (item.word || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.meaning || '').toLowerCase().includes(search.toLowerCase());
    const matchesMastery = filterMastery === 'All' || item.masteryStatus === filterMastery;
    return matchesSearch && matchesMastery;
  });

  const learnedCount = vocab.filter(v => v.masteryStatus === 'Mastered').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">Synchronizing English Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top statistics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">English & TOEFL Hub</h2>
          <p className="text-gray-400 text-sm mt-1">Develop academic vocabulary and language skills daily.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <Award className="text-yellow-500 animate-bounce" size={24} />
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Words Mastered</p>
              <p className="text-lg font-bold text-white">{learnedCount} / {vocab.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control panel (Search & Filter) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search words or meanings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3b82f6] placeholder-gray-500"
            />
          </div>

          <select
            value={filterMastery}
            onChange={(e) => setFilterMastery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="All">All Statuses</option>
            <option value="Learning">📕 Learning</option>
            <option value="Remembered">📙 Remembered</option>
            <option value="Mastered">📗 Mastered</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          <span>Add Word</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddWord} className="glass p-6 rounded-2xl border border-white/10 space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold text-white">Add New Vocabulary</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Word</label>
            <input 
              type="text" 
              placeholder="e.g. Ephemeral"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Meaning</label>
            <textarea 
              placeholder="e.g. Lasting for a very short time."
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] h-20 resize-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Example Sentence</label>
            <input 
              type="text" 
              placeholder="e.g. The beauty of the sunset was ephemeral."
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
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
              Add Word
            </button>
          </div>
        </form>
      )}

      {/* Vocabulary Table (Desktop) / Cards (Mobile) */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Word</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Meaning</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Example Sentence</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-400">Mastery Status</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVocab.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm text-gray-500">
                    No vocabulary items match your filters.
                  </td>
                </tr>
              ) : filteredVocab.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="p-4 text-sm font-bold text-white">{item.word}</td>
                  <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{item.meaning}</td>
                  <td className="p-4 text-sm text-gray-400 italic max-w-sm truncate">{item.exampleSentence || '—'}</td>
                  <td className="p-4">
                    <select
                      value={item.masteryStatus || 'Learning'}
                      onChange={(e) => updateMastery(item, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded border bg-transparent cursor-pointer ${
                        item.masteryStatus === 'Mastered' ? 'text-[#10b981] border-[#10b981]/30' :
                        item.masteryStatus === 'Remembered' ? 'text-[#f59e0b] border-[#f59e0b]/30' :
                        'text-[#ef4444] border-[#ef4444]/30'
                      }`}
                    >
                      <option value="Learning">📕 Learning</option>
                      <option value="Remembered">📙 Remembered</option>
                      <option value="Mastered">📗 Mastered</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnglishHub;
