import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const api = {
  // Generic helper methods
  get: async (type) => {
    const res = await axios.get(`${API_BASE}/${type}`);
    return res.data;
  },
  create: async (type, data) => {
    try {
      const res = await axios.post(`${API_BASE}/${type}`, data);
      toast.success(`Created successfully`);
      return res.data;
    } catch (err) {
      toast.error(`Failed to create`);
      throw err;
    }
  },
  update: async (type, id, data) => {
    try {
      const res = await axios.patch(`${API_BASE}/${type}/${id}`, data);
      // Suppress toasts for rapid habit streaks to avoid spam, otherwise show
      if (type !== 'habits') {
        toast.success(`Updated successfully`);
      }
      return res.data;
    } catch (err) {
      toast.error(`Failed to update`);
      throw err;
    }
  },
  delete: async (type, id) => {
    try {
      const res = await axios.delete(`${API_BASE}/${type}/${id}`);
      toast.success(`Deleted successfully`);
      return res.data;
    } catch (err) {
      toast.error(`Failed to delete`);
      throw err;
    }
  },

  // Specific helpers for ease of use
  getTasks: () => api.get('tasks'),
  createTask: (data) => api.create('tasks', data),
  updateTask: (id, data) => api.update('tasks', id, data),
  deleteTask: (id) => api.delete('tasks', id),

  getHabits: () => api.get('habits'),
  createHabit: (data) => api.create('habits', data),
  updateHabit: (id, data) => api.update('habits', id, data),
  deleteHabit: (id) => api.delete('habits', id),

  getGoals: () => api.get('goals'),
  createGoal: (data) => api.create('goals', data),
  updateGoal: (id, data) => api.update('goals', id, data),
  deleteGoal: (id) => api.delete('goals', id),

  getProjects: () => api.get('projects'),
  createProject: (data) => api.create('projects', data),
  updateProject: (id, data) => api.update('projects', id, data),
  deleteProject: (id) => api.delete('projects', id),

  getEnglish: () => api.get('english'),
  createEnglish: (data) => api.create('english', data),
  updateEnglish: (id, data) => api.update('english', id, data),
  deleteEnglish: (id) => api.delete('english', id),

  getJournal: () => api.get('journal'),
  createJournal: (data) => api.create('journal', data),
  updateJournal: (id, data) => api.update('journal', id, data),
  deleteJournal: (id) => api.delete('journal', id),
};

export default api;
