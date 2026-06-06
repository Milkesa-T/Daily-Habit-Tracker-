import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, GitBranch, Link, Edit, Save, Compass } from 'lucide-react';
import api from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Project Fields
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState('Planning');
  const [githubLink, setGithubLink] = useState('');
  const [notes, setNotes] = useState('');
  const [stack, setStack] = useState([]); // select tag array

  // Edit progress state
  const [editingId, setEditingId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  const availableStacks = ['React', 'Next.js', 'PostgreSQL', 'Docker', 'Go', 'Node.js', 'Supabase', 'TypeScript'];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName) return;
    try {
      const created = await api.createProject({
        projectName,
        status,
        stack,
        githubLink,
        progress: 0,
        notes
      });
      setProjects([created, ...projects]);
      setProjectName('');
      setGithubLink('');
      setNotes('');
      setStack([]);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStackTag = (tag) => {
    if (stack.includes(tag)) {
      setStack(stack.filter(s => s !== tag));
    } else {
      setStack([...stack, tag]);
    }
  };

  const startEditProgress = (proj) => {
    setEditingId(proj.id);
    setEditProgress(Math.round((proj.progress || 0) * 100));
  };

  const saveProgress = async (proj) => {
    try {
      const floatProgress = editProgress / 100;
      const nextStatus = floatProgress === 1 ? 'Completed' : 'Building';

      setProjects(projects.map(p => p.id === proj.id ? { ...p, progress: floatProgress, status: nextStatus } : p));
      setEditingId(null);

      await api.updateProject(proj.id, {
        progress: floatProgress,
        status: nextStatus
      });
    } catch (err) {
      console.error(err);
      loadProjects();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="animate-spin text-[#3b82f6]" size={48} />
          <p className="text-gray-400 font-medium">Synchronizing Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">Project Sandbox</h2>
          <p className="text-gray-400 text-sm mt-1">Document, configure, and ship software engineering projects.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateProject} className="glass p-6 rounded-2xl border border-white/10 space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold text-white">Initialize Project Log</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Project Name</label>
            <input 
              type="text" 
              placeholder="e.g. 135-Day Transformation App"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="Planning">Planning</option>
                <option value="Building">Building</option>
                <option value="Debugging">Debugging</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold uppercase">GitHub URL</label>
              <input 
                type="url" 
                placeholder="https://github.com/..."
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-semibold uppercase block">Tech Stack Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableStacks.map(tag => {
                const isSelected = stack.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleStackTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]' 
                        : 'border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase">Quick Notes / Specs</label>
            <textarea 
              placeholder="System requirements, deployment strategy, ideas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] h-20 resize-none"
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
              Initialize
            </button>
          </div>
        </form>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj.id} className="glass p-6 rounded-2xl flex flex-col justify-between border border-white/5 bg-white/2 hover:bg-white/4 transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FolderGit2 className="text-[#3b82f6]" size={24} />
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  proj.status === 'Completed' ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25' :
                  proj.status === 'Building' ? 'bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25' :
                  proj.status === 'Debugging' ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/25' :
                  'bg-gray-500/10 text-gray-400 border border-white/5'
                }`}>
                  {proj.status || 'Planning'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{proj.projectName}</h3>
                {proj.notes && <p className="text-xs text-gray-400 mt-2 italic line-clamp-2">{proj.notes}</p>}
              </div>

              {/* Tech stack badges */}
              {proj.stack && proj.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.stack.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400">Progress</span>
                {editingId === proj.id ? (
                  <button 
                    onClick={() => saveProgress(proj)}
                    className="flex items-center gap-1 text-xs text-[#10b981] hover:underline font-semibold"
                  >
                    <Save size={12} />
                    <span>Save</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => startEditProgress(proj)}
                    className="flex items-center gap-1 text-xs text-[#3b82f6] hover:underline font-semibold"
                  >
                    <Edit size={12} />
                    <span>Update</span>
                  </button>
                )}
              </div>

              {editingId === proj.id ? (
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={editProgress} 
                    onChange={(e) => setEditProgress(parseInt(e.target.value))}
                    className="flex-1 accent-[#3b82f6] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white w-8">{editProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#3b82f6] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(proj.progress || 0) * 100}%` }} 
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-200">
                    {Math.round((proj.progress || 0) * 100)}%
                  </span>
                </div>
              )}

              {proj.githubLink && (
                <a 
                  href={proj.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-[#3b82f6] hover:underline pt-2 inline-flex items-center"
                >
                  <GitBranch size={14} />
                  <span>GitHub Repository</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
