import React, { useState, useEffect } from 'react';
import { Plus, Check, ArrowRight, ArrowLeft, Trash2, Calendar, Compass } from 'lucide-react';
import api from '../services/api';

const DailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New task form fields
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Projects');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const created = await api.createTask({
        title,
        status: 'Todo',
        priority,
        category,
        dueDate,
        completed: false
      });
      setTasks([created, ...tasks]);
      setTitle('');
      setDueDate('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    try {
      const updated = await api.updateTask(task.id, {
        status: newStatus,
        completed: newStatus === 'Done'
      });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, completed: newStatus === 'Done' } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = ['Todo', 'Doing', 'Done'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">Synchronizing Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">Daily Planner</h2>
          <p className="text-gray-400 text-sm mt-1">Organize your sprints and build focus today.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Quick Add Form Overlay/Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="glass p-6 rounded-2xl border border-white/10 space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold text-white">Create New Task</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Write backend authentication logic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="High">🔥 High</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Low">🌱 Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="English">📚 English</option>
                <option value="Internship">💼 Internship</option>
                <option value="Projects">💻 Projects</option>
                <option value="Cybersecurity">🛡️ Cyber</option>
                <option value="CP">🧩 CP</option>
                <option value="Forex">📈 Forex</option>
                <option value="Spiritual">🙏 Spiritual</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Due Date</label>
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              Create
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = tasks.filter(t => (t.status || 'Todo') === col);
          return (
            <div key={col} className="glass p-5 rounded-2xl flex flex-col gap-4 border border-white/5 bg-[#16171d]/30 min-h-[400px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col === 'Todo' ? 'bg-gray-400' :
                    col === 'Doing' ? 'bg-[#3b82f6]' : 'bg-[#10b981]'
                  }`} />
                  <h3 className="font-semibold text-white">{col}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {colTasks.map(task => (
                  <div key={task.id} className="glass p-4 rounded-xl space-y-3 relative group border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-300">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-medium text-gray-100">{task.title}</h4>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-400">
                        {task.category || 'Focus'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        task.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                      {task.dueDate && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {task.dueDate?.start || task.dueDate}
                        </span>
                      )}
                    </div>

                    {/* Navigation buttons to move tasks */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
                      {col !== 'Todo' && (
                        <button 
                          onClick={() => updateTaskStatus(task, col === 'Doing' ? 'Todo' : 'Doing')}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <ArrowLeft size={12} />
                        </button>
                      )}
                      {col !== 'Done' && (
                        <button 
                          onClick={() => updateTaskStatus(task, col === 'Todo' ? 'Doing' : 'Done')}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <ArrowRight size={12} />
                        </button>
                      )}
                      {col === 'Done' && (
                        <div className="p-1 text-[#10b981] bg-[#10b981]/10 rounded border border-[#10b981]/20">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyPlanner;
